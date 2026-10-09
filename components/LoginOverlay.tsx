import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Lock, User as UserIcon, Mail, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface Props {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const LoginOverlay: React.FC<Props> = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('admin123');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      // Demo password login: POST /api/auth/login with { username, password }.
      // OTP (POST /api/auth/otp + /api/auth/verify) still exists but needs SMTP,
      // so for this demo we use the password path with admin123 / scse.
      const result = await api.login(username.trim(), password);
      const user: User = result?.user ?? {
        email: result?.user?.email ?? 'admin123@uniarchive.local',
        username: username.trim(),
        isVerified: true,
        role: result?.user?.role ?? 'admin'
      };

      localStorage.setItem('uniarchive_user', JSON.stringify(user));
      onLogin(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-uni-black/90 backdrop-blur-md p-4 font-mono">
      <div className="w-full max-w-md bg-uni-panel border border-uni-neon shadow-hard-neon relative overflow-hidden">

        {/* Header */}
        <div className="p-6 bg-uni-dark border-b border-uni-border flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-uni-contrast uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck size={24} className="text-uni-neon" /> Student Access
          </h2>
          <button onClick={onClose} className="text-uni-muted hover:text-uni-contrast transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-uni-muted text-xs uppercase">Demo account</p>
            <p className="text-uni-contrast text-sm font-bold">admin123 / scse</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-uni-muted mb-2 uppercase">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-uni-muted" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin123"
                  className={`w-full bg-uni-black border ${error ? 'border-uni-alert' : 'border-uni-border'} p-3 pl-10 text-uni-contrast focus:border-uni-neon outline-none transition-colors`}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-uni-muted mb-2 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-uni-muted" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="scse"
                  className={`w-full bg-uni-black border ${error ? 'border-uni-alert' : 'border-uni-border'} p-3 pl-10 text-uni-contrast focus:border-uni-neon outline-none transition-colors`}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-uni-alert text-xs">
                <AlertTriangle size={12} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-uni-neon text-uni-black font-display font-bold py-3 hover:bg-uni-contrast transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-hard-neon uppercase flex justify-center items-center gap-2"
            >
              {isLoading ? 'Signing in...' : 'Sign in'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-5 text-center text-uni-muted text-[10px] font-mono uppercase">
            Press Sign in with the demo credentials above: admin123 / scse.
          </p>
          <p className="mt-1 text-center text-uni-muted text-[10px] font-mono">
            Email on file: admin123@uniarchive.local
          </p>
        </div>

        {/* Footer decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-uni-neon via-uni-cyan to-uni-alert"></div>
      </div>
    </div>
  );
};
