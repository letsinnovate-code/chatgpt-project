import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Bot, Lock, Mail, User, ArrowRight, ShieldCheck, Database, Zap, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const { login, register, loginAsGuest, isLoading, authError, clearError } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!email || !password) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (isRegisterMode && (!firstName || !lastName)) {
      setValidationError('Please enter both first and last name.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password should be at least 6 characters long.');
      return;
    }

    if (isRegisterMode) {
      await register({ firstName, lastName, email, password });
    } else {
      await login({ email, password });
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo.user@example.com');
    setPassword('secret123');
    setFirstName('Alex');
    setLastName('Dev');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] px-4 py-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        
        {/* Left Side: Product Showcase & Brand */}
        <div className="p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 via-zinc-950/70 to-zinc-950">
          <div>
            {/* Logo Badge */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Bot className="h-6 w-6 text-zinc-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  ChatGPT
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    2.0 Next-Gen
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">Gemini & Pinecone Neural Engine</p>
              </div>
            </div>

            {/* Headline */}
            <div className="mt-8 space-y-2">
              <h2 className="text-2xl font-semibold text-zinc-100">
                Intelligent conversations with continuous recall.
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Experience ultra-fast multimodal AI capabilities with persistent vector memory that recalls every detail of your conversations.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Google Gemini 2.5 Flash</h3>
                  <p className="text-xs text-zinc-400">High-throughput reasoning, instant code synthesis, and natural responses.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 mt-0.5">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Pinecone Long-Term Vector Memory</h3>
                  <p className="text-xs text-zinc-400">Dense semantic embeddings (768d) automatically index past chat context.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/50">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-200">Real-time WebSocket Engine</h3>
                  <p className="text-xs text-zinc-400">Zero-polling bidirectional streaming with Socket.io protocol.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> End-to-end token secured
            </span>
            <span>v1.0.0</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 lg:p-10 flex flex-col justify-center bg-zinc-950/40">
          <div className="max-w-md w-full mx-auto">
            {/* Mode Tabs */}
            <div className="flex p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setValidationError('');
                  clearError();
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  !isRegisterMode
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setValidationError('');
                  clearError();
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  isRegisterMode
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                {isRegisterMode ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {isRegisterMode
                  ? 'Sign up to start chatting with persistent AI memory.'
                  : 'Enter your credentials to access your saved conversations.'}
              </p>
            </div>

            {/* Error Banners */}
            {(validationError || authError) && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{validationError || authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        required={isRegisterMode}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        required={isRegisterMode}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-medium text-xs text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="mt-5 pt-4 border-t border-zinc-800/60 flex flex-col items-center gap-2.5 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-xs text-zinc-400 hover:text-emerald-400 underline underline-offset-4 transition-colors cursor-pointer"
              >
                Click to prefill test credentials
              </button>

              <span className="text-[10px] text-zinc-600">— or —</span>

              <button
                type="button"
                onClick={loginAsGuest}
                className="text-xs px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Explore in Guest Demo Mode</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
