import React, { useState } from 'react';
import { MessageSquare, Trash2, Check, X } from 'lucide-react';

export default function ChatItem({
  chat,
  isActive,
  onSelect,
  onDelete,
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const chatId = chat.id || chat._id;
  const title = chat.title || 'Untitled Chat';

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsConfirmingDelete(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(chatId);
    setIsConfirmingDelete(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setIsConfirmingDelete(false);
  };

  return (
    <div
      onClick={() => onSelect(chatId)}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
        isActive
          ? 'bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
      }`}
    >
      <MessageSquare
        className={`h-4 w-4 shrink-0 transition-colors ${
          isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'
        }`}
      />

      <span className="truncate flex-1 pr-6">{title}</span>

      {/* Action buttons */}
      <div className="absolute right-2 flex items-center">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-700">
            <button
              onClick={confirmDelete}
              title="Confirm Delete"
              className="p-1 hover:text-rose-400 text-zinc-400 rounded transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={cancelDelete}
              title="Cancel"
              className="p-1 hover:text-zinc-200 text-zinc-400 rounded transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleDeleteClick}
            title="Delete chat"
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 rounded transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
