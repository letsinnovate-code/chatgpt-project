import React from 'react';
import { PanelLeftOpen, Sparkles, Database, Wifi, WifiOff, Trash2, Plus } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function ChatHeader({
  activeChat,
  onToggleSidebar,
  onNewChat,
  onDeleteChat,
}) {
  const { isConnected, connectionStatus } = useSocket();

  return (
    <header className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-20">
      {/* Left side: Sidebar Toggle & Chat Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          title="Toggle sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-zinc-200 truncate max-w-[200px] sm:max-w-md">
            {activeChat ? activeChat.title : 'New Conversation'}
          </h2>
        </div>
      </div>

      {/* Right side: Model Badges and Connection Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span className="font-medium">Gemini 2.5 Flash</span>
          <span className="text-zinc-600">•</span>
          <Database className="h-3 w-3 text-teal-400" />
          <span className="text-zinc-400">Pinecone Memory</span>
        </div>

        {/* Real-time Socket Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : connectionStatus === 'connecting'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
          title={`WebSocket Status: ${connectionStatus}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected
                ? 'bg-emerald-400 animate-pulse'
                : connectionStatus === 'connecting'
                ? 'bg-amber-400 animate-ping'
                : 'bg-rose-400'
            }`}
          />
          <span className="hidden sm:inline">
            {isConnected ? 'Live' : connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
          </span>
        </div>

        {/* Action icons */}
        <button
          onClick={onNewChat}
          title="New Chat"
          className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>

        {activeChat && (
          <button
            onClick={() => onDeleteChat(activeChat.id || activeChat._id)}
            title="Delete this chat"
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
}
