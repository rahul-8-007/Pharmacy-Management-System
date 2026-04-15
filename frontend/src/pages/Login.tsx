import { useState, useContext, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/api';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `
    w-full pl-12 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
    focus:ring-2 focus:ring-blue-200
  `;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-color)' }}>
      {/* Left: Branding Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 0),
                              radial-gradient(circle at 75% 75%, white 2px, transparent 0)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative z-10 text-center text-white max-w-md">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <ShieldCheck size={52} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Clinical Curator</h1>
          <p className="text-xs font-semibold uppercase tracking-widest mb-6 opacity-75">
            Pharmacy Management
          </p>
          <p className="text-lg text-blue-100 leading-relaxed">
            The next-generation pharmacy platform. Manage stock, predict demands, and track sales — securely.
          </p>
          <div className="flex justify-center gap-6 mt-10">
            {['Stock', 'Sales', 'Predictions'].map(feat => (
              <div
                key={feat}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ background: 'var(--white)' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>Clinical Curator</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--text-main)' }}>
              Welcome Back
            </h2>
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              Sign in to your pharmacist account
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 p-4 rounded-xl mb-6 text-sm border-l-4"
              style={{ background: 'var(--red-light)', color: '#991b1b', borderLeftColor: 'var(--red)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={17} style={{ color: 'var(--text-muted)' }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-color)' }}
                  placeholder="pharmacy@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={17} style={{ color: 'var(--text-muted)' }} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputClass}
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-color)' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: 'var(--primary)' }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold transition-colors"
              style={{ color: 'var(--primary)' }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
