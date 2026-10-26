import React, { useRef, useEffect, useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';
import ChatInput from './ChatInput';
import { ArrowDown, Sparkles } from 'lucide-react';

export default function ChatArea({
  activeChat,
  messages,
  isGenerating,
  onSendMessage,
  onNewChat,
  onDeleteChat,
  onToggleSidebar,
}) {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState('');

  // Auto-scroll to bottom on new messages or during generation
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isGenerating]);

  // Track scroll position to show/hide "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 200);
  };

  const handleSelectSuggestedPrompt = (promptText) => {
    setPendingPrompt(promptText);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
      {/* Header */}
      <ChatHeader
        activeChat={activeChat}
        onToggleSidebar={onToggleSidebar}
        onNewChat={onNewChat}
        onDeleteChat={onDeleteChat}
      />

      {/* Main Messages & Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState onSelectPrompt={handleSelectSuggestedPrompt} />
          </div>
        ) : (
          <div className="flex-1 pb-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Thinking / Streaming Indicator */}
            {isGenerating && (
              <div className="w-full py-4 sm:py-5 px-3 sm:px-4 bg-zinc-900/40 border-y border-zinc-800/40 animate-pulse">
                <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <Sparkles className="h-4 w-4 text-zinc-950 animate-spin" />
                  </div>
                  <div className="flex-1 pt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-300">ChatGPT</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Retrieving context & reasoning...</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Floating Scroll to Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="fixed bottom-24 right-8 z-30 p-2.5 rounded-full bg-zinc-800/90 text-zinc-200 hover:text-white border border-zinc-700 shadow-xl backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Chat Input Bar */}
      <ChatInput
        onSendMessage={onSendMessage}
        isGenerating={isGenerating}
        promptInput={pendingPrompt}
        setPromptInput={setPendingPrompt}
      />
    </div>
  );
}
