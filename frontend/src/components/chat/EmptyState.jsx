import React from 'react';
import { Bot, Code2, Brain, Sparkles, Lightbulb, Compass, ArrowUpRight } from 'lucide-react';

export default function EmptyState({ onSelectPrompt }) {
  const promptSuggestions = [
    {
      title: 'Vector Search Deep Dive',
      desc: 'Explain how 768-dimensional Pinecone embeddings retrieve past memories',
      icon: Brain,
      prompt: 'Explain how Pinecone vector search and 768-dimensional embeddings work together to provide long-term memory for an AI assistant.',
      tag: 'Memory',
    },
    {
      title: 'Fullstack Architecture',
      desc: 'Compare WebSocket streaming vs HTTP polling for chat applications',
      icon: Code2,
      prompt: 'Compare WebSocket bidirectional communication with HTTP polling for real-time generative AI chat applications. What are the trade-offs?',
      tag: 'Architecture',
    },
    {
      title: 'React Performance',
      desc: 'Create an optimized custom hook for debouncing and caching queries',
      icon: Sparkles,
      prompt: 'Write a production-ready custom React hook for debouncing search input with in-memory caching and AbortController cancellation.',
      tag: 'Coding',
    },
    {
      title: 'Algorithm Brainstorming',
      desc: 'Design a cosine similarity ranking algorithm for semantic text matching',
      icon: Lightbulb,
      prompt: 'How does cosine similarity calculate the semantic distance between query vectors and stored message embeddings?',
      tag: 'Concepts',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center text-center">
      {/* Hero Icon */}
      <div className="relative mb-6">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-lg" />
        <div className="relative h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
          <Bot className="h-8 w-8 text-emerald-400" />
        </div>
      </div>

      {/* Greeting Title */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
        What can I help you discover today?
      </h1>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-10">
        Connected to <span className="text-emerald-400 font-medium">Gemini 2.5 Flash</span> and reinforced with <span className="text-teal-400 font-medium">Pinecone Long-Term Vector Memory</span>.
      </p>

      {/* Suggestion Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {promptSuggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700/80 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-200">
                  <span>{item.tag}</span>
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
