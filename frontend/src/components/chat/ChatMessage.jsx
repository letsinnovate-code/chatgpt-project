import React, { useState } from 'react';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ChatMessage({ message }) {
  const { user } = useAuth();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [reaction, setReaction] = useState(null); // 'like' | 'dislike' | null

  const isModel = message.role === 'model';
  const content = message.content || '';

  // User initials
  const userInitials = (() => {
    if (!user) return 'U';
    const first = user.fullName?.firstName?.charAt(0) || '';
    const last = user.fullName?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  })();

  const formatTimestamp = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleCopyFull = () => {
    navigator.clipboard.writeText(content);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleCopyCode = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse markdown-like code blocks and formatted text
  const renderFormattedContent = (rawText) => {
    // Split by triple backticks for code blocks: ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockId = 0;

    while ((match = codeBlockRegex.exec(rawText)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: rawText.substring(lastIndex, match.index),
          id: `text-${blockId}`,
        });
      }

      // Code block
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        code: match[2].trim(),
        id: `code-${blockId}`,
        blockIndex: blockId,
      });

      lastIndex = match.index + match[0].length;
      blockId++;
    }

    if (lastIndex < rawText.length) {
      parts.push({
        type: 'text',
        content: rawText.substring(lastIndex),
        id: `text-final`,
      });
    }

    if (parts.length === 0) {
      parts.push({ type: 'text', content: rawText, id: 'text-raw' });
    }

    return parts.map((part) => {
      if (part.type === 'code') {
        const isCopied = copiedIndex === part.blockIndex;
        return (
          <div
            key={part.id}
            className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/90 shadow-md"
          >
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
              <span className="uppercase tracking-wider">{part.language}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(part.code, part.blockIndex)}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors py-0.5 px-1.5 rounded hover:bg-zinc-800 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <pre className="p-3.5 overflow-x-auto text-xs font-mono text-zinc-200 leading-relaxed scrollbar-thin">
              <code>{part.code}</code>
            </pre>
          </div>
        );
      }

      // Render regular text with paragraphs and inline code formatting
      return (
        <div key={part.id} className="space-y-2 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
          {part.content}
        </div>
      );
    });
  };

  return (
    <div
      className={`group w-full py-4 sm:py-5 px-3 sm:px-4 transition-colors ${
        isModel ? 'bg-zinc-900/40 border-y border-zinc-800/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isModel ? (
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles className="h-4 w-4 text-zinc-950" />
            </div>
          ) : (
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-xs font-bold text-zinc-200 shadow-xs">
              {userInitials}
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0">
          {/* Header row: Author & Time */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-zinc-200">
              {isModel ? 'ChatGPT' : user?.fullName?.firstName || 'You'}
            </span>
            {isModel && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gemini 2.5
              </span>
            )}
            {message.createdAt && (
              <span className="text-[10px] text-zinc-500">
                {formatTimestamp(message.createdAt)}
              </span>
            )}
          </div>

          {/* Formatted Content */}
          <div className="text-zinc-200">{renderFormattedContent(content)}</div>

          {/* Action Footer for Model */}
          {isModel && (
            <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopyFull}
                title="Copy response"
                className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80 rounded-md transition-colors cursor-pointer"
              >
                {copiedFull ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                onClick={() => setReaction(reaction === 'like' ? null : 'like')}
                title="Good response"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  reaction === 'like'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setReaction(reaction === 'dislike' ? null : 'dislike')}
                title="Bad response"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  reaction === 'dislike'
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
