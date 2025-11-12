import { useState } from 'react';
import { Headphones, LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
}

export function AuthForm({ onSignIn, onSignUp }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result =
      mode === 'signin'
        ? await onSignIn(email, password)
        : await onSignUp(email, password, name);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setEmail('');
      setPassword('');
      setName('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 p-5 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
            <Headphones className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">IT Support Portal</h1>
          <p className="text-blue-200 text-lg">AI-powered automated support system</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10">
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {mode === 'signup' && (
                <p className="mt-2 text-xs text-gray-500">Must be at least 6 characters</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to Your Account
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Your Account
                </>
              )}
            </button>
          </form>

        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="w-3 h-3 bg-emerald-400 rounded-full mx-auto mb-2 shadow-lg shadow-emerald-500/50"></div>
            <p className="text-sm font-medium text-white">AI-Powered</p>
            <p className="text-xs text-blue-200 mt-1">Analysis</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-2 shadow-lg shadow-blue-500/50"></div>
            <p className="text-sm font-medium text-white">Instant</p>
            <p className="text-xs text-blue-200 mt-1">Resolution</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="w-3 h-3 bg-orange-400 rounded-full mx-auto mb-2 shadow-lg shadow-orange-500/50"></div>
            <p className="text-sm font-medium text-white">Smart</p>
            <p className="text-xs text-blue-200 mt-1">Escalation</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-blue-200">
            © 2025 IT Support Portal. Made with <span className="text-red-400">♥</span> for IT teams everywhere
          </p>
        </div>
      </div>
    </div>
  );
}
