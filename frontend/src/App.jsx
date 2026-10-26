import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { useChat } from './hooks/useChat';
import AuthPage from './components/auth/AuthPage';
import Sidebar from './components/sidebar/Sidebar';
import ChatArea from './components/chat/ChatArea';

function ChatDashboard() {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    chats,
    activeChatId,
    activeChat,
    activeMessages,
    isGenerating,
    setActiveChatId,
    createNewChat,
    sendChatMessage,
    deleteChatSession,
  } = useChat();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(chatId) => {
          setActiveChatId(chatId);
          setIsSidebarOpen(false);
        }}
        onNewChat={() => {
          createNewChat();
          setIsSidebarOpen(false);
        }}
        onDeleteChat={(chatId) => {
          deleteChatSession(chatId);
        }}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main chat conversation window */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <ChatArea
          activeChat={activeChat}
          messages={activeMessages}
          isGenerating={isGenerating}
          onSendMessage={sendChatMessage}
          onNewChat={() => createNewChat()}
          onDeleteChat={(chatId) => deleteChatSession(chatId)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatDashboard />
      </SocketProvider>
    </AuthProvider>
  );
}
