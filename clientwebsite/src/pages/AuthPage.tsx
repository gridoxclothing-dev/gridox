import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Github, Chrome, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const API_URL = '/api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [isGoogleOtp, setIsGoogleOtp] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const response = await fetch('/api/dashboard', { credentials: 'include' });
        if (response.ok) {
          let redirectPath = searchParams.get('redirect') || '/';
          navigate(redirectPath);
        }
      } catch (error) {
        // Not logged in
      }
    };

    if (searchParams.get('google_otp') !== 'true') {
      checkExistingAuth();
    } else {
      setShowOtp(true);
      setIsGoogleOtp(true);
      if (searchParams.get('email')) {
        setFormData(prev => ({ ...prev, email: searchParams.get('email') || '' }));
      }
    }

    // Handle error messages from redirects
    const error = searchParams.get('error');
    if (error) {
      if (error === 'google_failed') toast.error('Google login failed. Please try again.');
      else if (error === 'token_err') toast.error('Session error. Please try again.');
      else toast.error('An error occurred. Please try again.');
    }
  }, [navigate, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = formData.email.trim().toLowerCase();
    const trimmedPassword = formData.password.trim();

    if (!isLogin && trimmedPassword !== formData.confirmPassword.trim()) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (!showOtp) {
        // Step 1: Send OTP
        const endpoint = isLogin ? '/auth/login' : '/auth/send-otp';
        const payload = isLogin
          ? { email: trimmedEmail, password: trimmedPassword }
          : { email: trimmedEmail, type: 'signup' };

        console.log(`[AUTH] Step 1: Calling ${endpoint} for ${trimmedEmail}`);

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error('Invalid response from server');
        }

        if (response.ok) {
          if (isLogin && data.otpRequired) {
            setShowOtp(true);
            if (data.devOtp) {
              setOtp(data.devOtp);
              toast.info(`Development Mode: OTP is ${data.devOtp}`, { duration: 10000 });
            } else {
              toast.success('Verification code sent to your email');
            }
          } else if (!isLogin) {
            setShowOtp(true);
            if (data.devOtp) {
              setOtp(data.devOtp);
              toast.info(`Development Mode: OTP is ${data.devOtp}`, { duration: 10000 });
            } else {
              toast.success('Verification code sent to your email');
            }
          } else {
            toast.success(data.message);
            const redirectPath = searchParams.get('redirect') || '/';
            // Use window.location.href for a full refresh to ensure all components update
            window.location.href = redirectPath;
          }
        } else {
          toast.error(data.message || 'Error processing request');
        }
      } else {
        // Step 2: Verify OTP
        const endpoint = isGoogleOtp
          ? '/auth/google/verify-otp'
          : (isLogin ? '/auth/login' : '/auth/signup');

        const payload = { 
          ...formData, 
          email: trimmedEmail,
          password: trimmedPassword,
          otp: otp.trim() 
        };

        console.log(`[AUTH] Step 2: Verifying OTP via ${endpoint} for ${trimmedEmail}`);

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        let data;
        try {
          data = await response.json();
        } catch (e) {
          throw new Error('Verification failed: Invalid server response');
        }

        if (response.ok) {
          toast.success(isLogin ? 'Login successful' : 'Account created successfully!');
          const redirectPath = searchParams.get('redirect') || '/';
          // Use window.location.href for a full refresh to ensure all components update
          window.location.href = redirectPath;
        } else {
          toast.error(data.message || 'Verification failed');
        }
      }
    } catch (error: any) {
      console.error('[AUTH] Submit error:', error);
      toast.error(error.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirect = searchParams.get('redirect');
    window.location.href = `${API_URL}/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-outfit">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl border border-black/5 overflow-hidden flex flex-col shadow-stone-200/50">
        {/* Header Section */}
        <div className="pt-10 pb-6 px-8 text-center bg-gradient-to-b from-stone-50/50 to-transparent">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            {showOtp ? 'Verification' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h1>
          <p className="text-gray-500 text-sm">
            {showOtp
              ? `Enter the code sent to ${formData.email}`
              : (isLogin ? 'Sign in to your premium account' : 'Join our luxury fashion community')}
          </p>
        </div>

        {/* Tab Switcher */}
        {!showOtp && (
          <div className="flex px-8 mb-6">
            <div className="flex w-full bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        <div className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !showOtp && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10 h-12 rounded-xl border-stone-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {!showOtp && (
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-12 rounded-xl border-stone-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {!isGoogleOtp && !showOtp && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <button type="button" className="text-xs text-stone-500 hover:text-black hover:underline font-medium">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 rounded-xl border-stone-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && !isGoogleOtp && !showOtp && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 h-12 rounded-xl border-stone-200 focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {showOtp && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-center">
                  <div className="relative group w-full max-w-[200px]">
                    <Input
                      id="otp"
                      placeholder="000000"
                      className="h-14 rounded-xl border-stone-300 focus:ring-4 focus:ring-black/5 focus:border-black transition-all text-center tracking-[0.4em] font-bold text-2xl"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-xs text-stone-500 hover:text-black underline"
                  >
                    Back to {isLogin ? 'Login' : 'Signup'}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-black hover:bg-stone-800 text-white font-semibold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-stone-200"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showOtp ? 'Verify & Continue' : (isLogin ? 'Sign In' : 'Create Account')}
                  {!showOtp && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </>
              )}
            </Button>
          </form>

          {!showOtp && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-white px-4 text-stone-400 font-bold">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full h-12 rounded-xl border-stone-200 hover:bg-stone-50 flex items-center justify-center gap-3 transition-all"
                onClick={handleGoogleLogin}
              >
                <Chrome className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-stone-700">Continue with Google</span>
              </Button>
            </>
          )}

          <p className="mt-8 text-center text-xs text-stone-400">
            By continuing, you agree to our <a href="/terms" className="underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
