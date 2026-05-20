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
          const redirectPath = searchParams.get('redirect') || '/';
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
    <div className="h-screen flex bg-background font-body overflow-hidden">
      {/* Left Pane - Editorial Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary h-full">
        <img
          src="/auth_fashion_editorial.png"
          alt="GriDox Fashion Editorial"
          className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[10000ms] hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <h2 className="font-heading text-3xl text-white mb-3 leading-tight">
            Elevate Your <br /> Everyday <span className="italic">Elegance</span>
          </h2>
          <p className="text-white/80 text-base max-w-sm font-light leading-relaxed">
            Join the GriDox community and discover curated designer collections tailored for the modern woman.
          </p>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-16 h-full overflow-y-auto lg:overflow-hidden">
        <div className="max-w-md w-full mx-auto flex flex-col h-full py-8 lg:py-12">
          {/* Logo/Branding */}
          <div className="mb-6 lg:mb-8 text-center lg:text-left shrink-0">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground uppercase mb-1">GriDox</h1>
            <div className="w-8 h-0.5 bg-primary hidden lg:block"></div>
          </div>

          <div className="space-y-1 mb-4 lg:mb-6 text-center lg:text-left shrink-0">
            <h2 className="font-heading text-xl lg:text-2xl font-bold text-foreground">
              {showOtp ? 'Verification' : (isLogin ? 'Sign In' : 'Create Account')}
            </h2>
            <p className="text-muted-foreground text-xs lg:text-sm">
              {showOtp
                ? `Enter the 6-digit code sent to ${formData.email}`
                : (isLogin ? 'Welcome back to GriDox.' : 'Start your journey with us today.')}
            </p>
          </div>

          {/* Form area */}
          <div className="space-y-4 lg:space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              {!showOtp && (
                <div className="flex bg-muted p-1 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${!isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {!isLogin && !showOtp && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      className="pl-7 h-10 border-0 border-b border-border rounded-none bg-transparent focus:ring-0 focus:border-primary transition-all text-sm text-foreground"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {!showOtp && (
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-7 h-10 border-0 border-b border-border rounded-none bg-transparent focus:ring-0 focus:border-primary transition-all text-sm text-foreground"
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
                    <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                    {isLogin && (
                      <button type="button" className="text-[9px] text-muted-foreground hover:text-primary uppercase tracking-wider font-bold">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-7 pr-10 h-10 border-0 border-b border-border rounded-none bg-transparent focus:ring-0 focus:border-primary transition-all text-sm text-foreground"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {!isLogin && !isGoogleOtp && !showOtp && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-7 h-10 border-0 border-b border-border rounded-none bg-transparent focus:ring-0 focus:border-primary transition-all text-sm text-foreground"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {showOtp && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Input
                      id="otp"
                      placeholder="000000"
                      className="h-14 border-0 border-b-2 border-primary rounded-none bg-transparent focus:ring-0 text-center tracking-[0.5em] font-heading font-bold text-2xl text-foreground"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="w-full text-[10px] text-muted-foreground hover:text-primary uppercase tracking-widest font-bold"
                  >
                    Change Details
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-black text-primary-foreground font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-primary/10 group"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-[11px]">{showOtp ? 'Verify Account' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                    {!showOtp && <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </>
                )}
              </Button>
            </form>

            {!showOtp && (
              <div className="space-y-4">
                <div className="relative pt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
                    <span className="bg-[#fffbf7] px-4 text-muted-foreground font-bold">Secure Social Access</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 rounded-none border-border hover:bg-muted flex items-center justify-center gap-3 transition-all group"
                  onClick={handleGoogleLogin}
                >
                  <Chrome className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold uppercase tracking-wider text-[10px]">Continue with Google</span>
                </Button>
              </div>
            )}
          </div>

          {/* Footer area */}
          <div className="mt-8 pt-4 border-t border-border/30 shrink-0">
            <p className="text-center text-[9px] text-muted-foreground uppercase tracking-[0.15em] leading-loose">
              © {new Date().getFullYear()} GridOx Ecommerce. Operated by MKG OCEANS <br />
              By continuing, you agree to our <br />
              <a href="/terms-and-conditions" className="text-foreground hover:text-primary underline">Terms of Service & Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
