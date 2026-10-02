import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, Lock, Mail, User, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, role });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Check parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F293D15_1px,transparent_1px),linear-gradient(to_bottom,#1F293D15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative z-10 max-w-md w-full bg-[#111827] border border-[#1F293D] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
            <Radio className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-mono tracking-wider text-slate-100">
            ENROLL OPERATOR
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Register New Municipal Monitoring Clearance
          </p>
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
              Full Officer Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A0E17] text-white pl-9 pr-4 py-2.5 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Commander Alex Mercer"
              />
            </div>
          </div>

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
                placeholder="alex.mercer@arhdn.gov"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5 uppercase">
              Security Access Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0E17] text-white pl-9 pr-4 py-2.5 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5 uppercase">
              Authorized Role Level
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#0A0E17] text-white pl-9 pr-4 py-2.5 rounded-lg border border-[#1F293D] focus:outline-none focus:border-cyan-500 font-mono transition-colors"
              >
                <option value="OPERATOR">OPERATOR (Surveillance & Dispatch)</option>
                <option value="VIEWER">VIEWER (Read-Only Observer)</option>
                <option value="ADMIN">ADMIN (Full System Governance)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10"
          >
            <span>{loading ? 'Creating Profile...' : 'Complete Officer Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs font-mono text-slate-500 pt-2 border-t border-[#1F293D]">
          <span>Already authorized? </span>
          <Link to="/login" className="text-cyan-400 hover:underline">
            Terminal Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
