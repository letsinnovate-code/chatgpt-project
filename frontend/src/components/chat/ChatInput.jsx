import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, Paperclip, Sparkles, StopCircle } from 'lucide-react';

export default function ChatInput({ onSendMessage, isGenerating, promptInput, setPromptInput }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Sync external prompt selection from EmptyState if provided
  useEffect(() => {
    if (promptInput) {
      setInput(promptInput);
      if (setPromptInput) setPromptInput('');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [promptInput, setPromptInput]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isGenerating) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-4">
      {/* Input Container */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700/50 transition-all p-2 sm:p-2.5">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message ChatGPT (Gemini 2.5 Flash)..."
          rows={1}
          disabled={isGenerating}
          className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 resize-none outline-none max-h-48 px-2 py-1 scrollbar-thin"
        />

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-zinc-800/60">
          {/* Left tools: Attachment & Voice hints */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Add attachment (contextual prompt)"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Voice dictation"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>

          {/* Right action: Send or Generating Status */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 text-xs font-medium animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                <span>Thinking...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim()}
                title="Send message"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  input.trim()
                    ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] sm:text-[11px] text-zinc-500 text-center mt-2">
        ChatGPT can make mistakes. Check important info. Integrated with Pinecone Vector Memory.
      </p>
    </div>
  );
}
