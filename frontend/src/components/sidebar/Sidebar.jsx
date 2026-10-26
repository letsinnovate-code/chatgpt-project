import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatItem from './ChatItem';
import {
  Plus,
  Search,
  Bot,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggleOpen,
}) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats by search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    return chats.filter((c) =>
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  // Group chats by date
  const groupedChats = useMemo(() => {
    const today = [];
    const past7Days = [];
    const older = [];

    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.lastActivity || chat.createdAt || chat.updatedAt || Date.now());
      const diffMs = now - chatDate;

      if (diffMs < oneDayMs && now.getDate() === chatDate.getDate()) {
        today.push(chat);
      } else if (diffMs < sevenDaysMs) {
        past7Days.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { today, past7Days, older };
  }, [filteredChats]);

  // User initials
  const initials = useMemo(() => {
    if (!user) return 'U';
    const first = user.fullName?.firstName?.charAt(0) || '';
    const last = user.fullName?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }, [user]);

  const fullName = useMemo(() => {
    if (!user) return 'User';
    if (user.fullName?.firstName) {
      return `${user.fullName.firstName} ${user.fullName.lastName || ''}`.trim();
    }
    return user.email?.split('@')[0] || 'User';
  }, [user]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 flex flex-col bg-zinc-950 border-r border-zinc-800/80 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-72'
        }`}
      >
        {/* Header: Logo and Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Bot className="h-4 w-4 text-zinc-950" />
            </div>
            <div>
              <span className="font-semibold text-sm text-zinc-100 flex items-center gap-1.5">
                ChatGPT
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg lg:hidden"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => onNewChat()}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 shadow-sm transition-all cursor-pointer group"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Layers className="h-8 w-8 text-zinc-600 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-zinc-500">
                {searchQuery ? 'No chats match your search' : 'No conversation history yet'}
              </p>
            </div>
          ) : (
            <>
              {groupedChats.today.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase px-2 mb-1.5">
                    Today
                  </h4>
                  {groupedChats.today.map((chat) => (
                    <ChatItem
                      key={chat.id || chat._id}
                      chat={chat}
                      isActive={(chat.id || chat._id) === activeChatId}
                      onSelect={onSelectChat}
                      onDelete={onDeleteChat}
                    />
                  ))}
                </div>
              )}

              {groupedChats.past7Days.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase px-2 mb-1.5">
                    Previous 7 Days
                  </h4>
                  {groupedChats.past7Days.map((chat) => (
                    <ChatItem
                      key={chat.id || chat._id}
                      chat={chat}
                      isActive={(chat.id || chat._id) === activeChatId}
                      onSelect={onSelectChat}
                      onDelete={onDeleteChat}
                    />
                  ))}
                </div>
              )}

              {groupedChats.older.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase px-2 mb-1.5">
                    Older
                  </h4>
                  {groupedChats.older.map((chat) => (
                    <ChatItem
                      key={chat.id || chat._id}
                      chat={chat}
                      isActive={(chat.id || chat._id) === activeChatId}
                      onSelect={onSelectChat}
                      onDelete={onDeleteChat}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">{fullName}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
