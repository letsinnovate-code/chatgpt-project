import { useState, useEffect, useCallback, useRef } from 'react';
import { chatAPI } from '../api/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export function useChat() {
  const { user } = useAuth();
  const { sendMessage, subscribeToMessages, isConnected } = useSocket();

  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(`chatgpt_chats_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return localStorage.getItem(`chatgpt_active_chat_${user?.id || 'guest'}`) || null;
  });

  const [messagesByChat, setMessagesByChat] = useState(() => {
    try {
      const saved = localStorage.getItem(`chatgpt_messages_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const activeChatIdRef = useRef(activeChatId);
  activeChatIdRef.current = activeChatId;

  // Persist chats to localStorage whenever they change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`chatgpt_chats_${user.id}`, JSON.stringify(chats));
    }
  }, [chats, user?.id]);

  // Persist activeChatId
  useEffect(() => {
    if (user?.id) {
      if (activeChatId) {
        localStorage.setItem(`chatgpt_active_chat_${user.id}`, activeChatId);
      } else {
        localStorage.removeItem(`chatgpt_active_chat_${user.id}`);
      }
    }
  }, [activeChatId, user?.id]);

  // Persist messagesByChat
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`chatgpt_messages_${user.id}`, JSON.stringify(messagesByChat));
    }
  }, [messagesByChat, user?.id]);

  // Fetch chats from backend
  const loadChats = useCallback(async () => {
    if (!user) return;
    setIsLoadingChats(true);
    try {
      const serverChats = await chatAPI.getChats();
      if (serverChats && Array.isArray(serverChats) && serverChats.length > 0) {
        setChats((prevChats) => {
          // Merge server chats with existing chats, preserving order
          const map = new Map();
          serverChats.forEach((c) => map.set(c.id || c._id, c));
          prevChats.forEach((c) => {
            if (!map.has(c.id || c._id)) {
              map.set(c.id || c._id, c);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn('Could not load remote chats:', err);
    } finally {
      setIsLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // When activeChatId changes, optionally load messages from server if empty
  useEffect(() => {
    if (!activeChatId) return;

    const currentMsgs = messagesByChat[activeChatId];
    if (!currentMsgs || currentMsgs.length === 0) {
      chatAPI.getChatMessages(activeChatId).then((serverMsgs) => {
        if (serverMsgs && Array.isArray(serverMsgs) && serverMsgs.length > 0) {
          setMessagesByChat((prev) => ({
            ...prev,
            [activeChatId]: serverMsgs.map((m) => ({
              id: m.id || m._id || Math.random().toString(),
              role: m.role,
              content: m.content,
              createdAt: m.createdAt || new Date().toISOString(),
            })),
          }));
        }
      });
    }
  }, [activeChatId]);

  // Subscribe to real-time socket response
  useEffect(() => {
    const unsubscribe = subscribeToMessages((responsePayload) => {
      // responsePayload: { content: string, chatId: string }
      const { content, chatId } = responsePayload;
      const targetChatId = chatId || activeChatIdRef.current;

      if (!targetChatId) return;

      const aiMessage = {
        id: 'ai-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        role: 'model',
        content: content || 'No response generated.',
        createdAt: new Date().toISOString(),
      };

      setMessagesByChat((prev) => {
        const chatMsgs = prev[targetChatId] || [];
        return {
          ...prev,
          [targetChatId]: [...chatMsgs, aiMessage],
        };
      });

      setIsGenerating(false);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToMessages]);

  // Create a new chat session
  const createNewChat = async (customTitle = 'New Chat') => {
    try {
      const response = await chatAPI.createChat(customTitle);
      const newChat = response.chat || {
        id: 'chat-' + Date.now(),
        title: customTitle,
        lastActivity: new Date().toISOString(),
      };

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      return newChat;
    } catch (err) {
      // Local fallback in case backend fails
      const fallbackChat = {
        id: 'chat-' + Date.now(),
        title: customTitle,
        lastActivity: new Date().toISOString(),
      };
      setChats((prev) => [fallbackChat, ...prev]);
      setActiveChatId(fallbackChat.id);
      return fallbackChat;
    }
  };

  // Send a message
  const sendChatMessage = async (text) => {
    if (!text || !text.trim()) return;
    const content = text.trim();

    let currentChatId = activeChatId;

    // If no active chat, create one with title from first message
    if (!currentChatId) {
      const titleCandidate = content.length > 30 ? content.slice(0, 30) + '...' : content;
      const newChat = await createNewChat(titleCandidate);
      currentChatId = newChat.id;
    }

    const userMessage = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    // Append user message immediately to state
    setMessagesByChat((prev) => {
      const chatMsgs = prev[currentChatId] || [];
      return {
        ...prev,
        [currentChatId]: [...chatMsgs, userMessage],
      };
    });

    // Update chat's last activity and title if it was "New Chat"
    setChats((prev) =>
      prev.map((c) => {
        if ((c.id || c._id) === currentChatId) {
          const updatedTitle =
            c.title === 'New Chat'
              ? content.length > 30
                ? content.slice(0, 30) + '...'
                : content
              : c.title;
          return {
            ...c,
            title: updatedTitle,
            lastActivity: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    setIsGenerating(true);

    // Send through Socket.io
    const sent = sendMessage({
      chat: currentChatId,
      content,
    });

    if (!sent) {
      // If socket failed to send
      setTimeout(() => {
        setIsGenerating(false);
        const errMsg = {
          id: 'err-' + Date.now(),
          role: 'model',
          content: '⚠️ Failed to connect to server socket. Please verify that the backend server is running.',
          createdAt: new Date().toISOString(),
        };
        setMessagesByChat((prev) => ({
          ...prev,
          [currentChatId]: [...(prev[currentChatId] || []), errMsg],
        }));
      }, 1000);
    }
  };

  // Delete chat
  const deleteChatSession = async (chatId) => {
    try {
      await chatAPI.deleteChat(chatId);
    } catch (err) {
      console.warn('Backend delete error:', err);
    }

    setChats((prev) => prev.filter((c) => (c.id || c._id) !== chatId));

    setMessagesByChat((prev) => {
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });

    if (activeChatId === chatId) {
      const remaining = chats.filter((c) => (c.id || c._id) !== chatId);
      setActiveChatId(remaining.length > 0 ? remaining[0].id || remaining[0]._id : null);
    }
  };

  const activeChat = chats.find((c) => (c.id || c._id) === activeChatId) || null;
  const activeMessages = (activeChatId && messagesByChat[activeChatId]) || [];

  return {
    chats,
    activeChatId,
    activeChat,
    activeMessages,
    isGenerating,
    isLoadingChats,
    isConnected,
    setActiveChatId,
    createNewChat,
    sendChatMessage,
    deleteChatSession,
    loadChats,
  };
}
