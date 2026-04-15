import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { name, email, password });
      navigate('/login');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      setError(msg || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 flex-row-reverse">
      {/* Right side Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <img src="/bg_login.png" alt="Pharmacy Background" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-105" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/95 to-transparent"></div>
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
        <div className="relative z-10 p-12 flex flex-col items-center justify-center text-center text-white h-full w-full">
          <ShieldCheck className="w-24 h-24 mb-6 drop-shadow-xl text-teal-100" strokeWidth={1.5} />
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg">PharmaSync Elite</h1>
          <p className="text-xl text-teal-50 max-w-md font-medium leading-relaxed drop-shadow-md">
            Join the network of elite pharmacists. Create your own isolated pharmacy environment with advanced AI predictions.
          </p>
        </div>
      </div>

      {/* Left side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Create Account</h2>
            <p className="text-gray-500 font-medium text-lg">Set up your pharmacist workspace</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6 text-sm flex items-center shadow-sm">
              <span className="font-semibold">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white hover:border-gray-300 outline-none transition-all duration-200"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white hover:border-gray-300 outline-none transition-all duration-200"
                  placeholder="pharmacy@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white hover:border-gray-300 outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-secondary text-white font-bold text-lg py-4 rounded-xl transition-all duration-300 shadow-xl shadow-teal-500/25 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />}
            </button>
          </form>
          
          <p className="text-center mt-8 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
