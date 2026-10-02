import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@arhdn.gov');
  const [password, setPassword] = useState('adminPassword123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F293D15_1px,transparent_1px),linear-gradient(to_bottom,#1F293D15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative z-10 max-w-md w-full bg-[#111827] border border-[#1F293D] rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
            <Radio className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100">
            ARHDN COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous Road Hazard Detection Network Portal
          </p>
        </div>

        {/* Demo credentials notification */}
        <div className="p-3 bg-[#0E1424] border border-[#1F293D] rounded-lg text-xs font-mono text-slate-400 space-y-1">
          <div className="text-cyan-400 font-semibold uppercase">Default Demo Accounts:</div>
          <div>Admin: <span className="text-slate-200">admin@arhdn.gov</span> / <span className="text-slate-200">adminPassword123!</span></div>
          <div>Operator: <span className="text-slate-200">operator@arhdn.gov</span> / <span className="text-slate-200">operatorPassword123!</span></div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-xs text-red-400 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 uppercase">
              Municipal Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0E17] text-white pl-9 pr-4 py-2.5 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="officer@arhdn.gov"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5 uppercase">
              Access Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0E17] text-white pl-9 pr-4 py-2.5 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10"
          >
            <span>{loading ? 'Authenticating...' : 'Authorize Terminal Access'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-mono text-slate-500 pt-2 border-t border-[#1F293D]">
          <span>Need authorization? </span>
          <Link to="/register" className="text-cyan-400 hover:underline">
            Register Operator ID
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
