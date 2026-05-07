import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export const PromoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'SUCCESS'>('PHONE');
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      setImageUrl(customEvent.detail.src);
      setIsOpen(true);
    };
    
    window.addEventListener("openPromoModal", handleOpen);
    return () => window.removeEventListener("openPromoModal", handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter an email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (phone.replace(/\D/g, '').length < 12) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), otp: newOtp })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.message && data.message.includes('Mock')) {
          alert(`Test Mode (No API Keys set): Your OTP for GriDox is ${newOtp}`);
        }
        setStep('OTP');
      } else {
        setErrorMsg("Failed to send OTP. Try again later.");
      }
    } catch (error) {
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim(), phone: phone.replace(/\s+/g, '') === '+91' ? '' : phone.trim() })
        });
      } catch (err) {
        console.error("Failed to capture lead", err);
      }
      setStep('SUCCESS');
      setErrorMsg("");
    } else {
      setErrorMsg("Invalid OTP. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <style>{`
        @keyframes popupZoomOut {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-zoom-out {
          animation: popupZoomOut 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative bg-secondary rounded-[16px] shadow-2xl w-[90%] max-w-[400px] md:max-w-4xl max-h-[85vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 z-10 mx-auto">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-sm backdrop-blur-md transition-transform duration-300 hover:rotate-90 text-black border border-gray-100"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Image (Hidden on mobile to save space) */}
        <div className="hidden md:block relative w-1/2 h-auto overflow-hidden bg-[#e0d6c8]">
          <img 
            src="/clean_fashion_promo.png" 
            alt="New Collection Promo" 
            className="w-full h-full object-cover animate-zoom-out"
          />
          <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-[#2a1b15]/90 via-[#2a1b15]/40 to-transparent flex flex-col justify-end p-10 pointer-events-none text-left">
            <span className="text-white/80 text-[10px] tracking-[0.4em] font-bold uppercase mb-2">GriDox Exclusive</span>
            <h3 className="text-white text-5xl font-heading mb-3 drop-shadow-lg leading-tight">10% OFF</h3>
            <p className="text-white/90 text-lg font-body tracking-wide drop-shadow-md border-l-2 border-[#8b231a] pl-3">Your Premium Collection</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 bg-secondary p-6 md:p-12 flex flex-col justify-center items-center text-center overflow-y-auto">
          <h2 className="text-xs md:text-sm font-body font-bold text-primary mb-4 md:mb-6 tracking-[0.3em] opacity-90">GriDox</h2>
          
          {step === 'PHONE' && (
            <div className="w-full animate-fade-in flex flex-col items-center">
              <h3 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-3">Get 10% OFF</h3>
              <p className="text-[#5c4a3d] mb-3 text-sm md:text-base px-2 font-medium">Join now for exclusive fashion drops and early access</p>
              
              <div className="mb-8">
                <span className="inline-block bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-full tracking-wide shadow-sm">
                  Limited time offer for new users
                </span>
              </div>
              
              <form className="w-full max-w-[300px] text-left" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#5c4a3d] ml-1 uppercase tracking-widest">Email Address *</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/90 px-5 py-3 border border-[#d2c4b3] rounded-[12px] focus:outline-none focus:border-[#8b231a] focus:bg-white focus:ring-4 focus:ring-[#8b231a]/10 text-base font-medium transition-all text-[#2a1b15] placeholder:text-[#a39485]"
                        placeholder="Enter your mail"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    {errorMsg && <p className="text-red-500 text-xs mt-1 ml-1">{errorMsg}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#5c4a3d] ml-1 uppercase tracking-widest">Phone Number *</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => {
                          if (!e.target.value.startsWith('+91')) {
                             setPhone('+91 ' + e.target.value.replace('+91', '').trim());
                          } else {
                             setPhone(e.target.value);
                          }
                        }}
                        className="w-full bg-white/90 px-5 py-3 border border-[#d2c4b3] rounded-[12px] focus:outline-none focus:border-[#8b231a] focus:bg-white focus:ring-4 focus:ring-[#8b231a]/10 text-base font-medium transition-all text-[#2a1b15] placeholder:text-[#a39485]"
                        placeholder="+91 "
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-[12px] font-bold tracking-wider hover:opacity-90 hover:scale-[1.05] hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
                
                <div className="mt-5 text-center">
                  <p className="text-xs text-[#8b231a] font-bold tracking-wide">
                    Trusted by 10,000+ happy customers
                  </p>
                </div>

                <p className="text-[11px] text-[#8e7f72] mt-6 text-center select-none font-semibold">No spam. Only style updates.</p>
              </form>
            </div>
          )}

          {step === 'OTP' && (
            <div className="w-full max-w-[300px] animate-fade-in flex flex-col items-center">
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-[#2a1b15] mb-3 text-center">Verify OTP</h3>
              <p className="text-[#5c4a3d] font-medium mb-6 text-sm md:text-base px-2 text-center">Enter the one-time password sent to {email}</p>
              
              <form className="w-full text-left" onSubmit={handleOtpSubmit}>
                <div className="flex flex-col gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-black ml-1 uppercase tracking-widest text-center block">One-Time Password</label>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      className="w-full bg-white/90 px-5 py-3.5 border border-[#d2c4b3] rounded-[12px] focus:outline-none focus:bg-white focus:border-[#8b231a] focus:ring-4 focus:ring-[#8b231a]/10 text-center text-xl font-medium transition-all tracking-[0.5em] text-[#2a1b15] placeholder:text-[#a39485]"
                      placeholder="••••"
                      required
                    />
                    {errorMsg && <p className="text-red-500 text-xs mt-1 ml-1 text-center">{errorMsg}</p>}
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-4 rounded-[12px] font-bold tracking-wider hover:opacity-90 hover:scale-[1.05] hover:shadow-xl transition-all duration-300"
                  >
                    Verify & Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                        setStep('PHONE');
                        setErrorMsg("");
                        setOtp("");
                    }}
                    className="w-full text-[#8b231a] hover:text-[#5c1610] text-xs font-bold tracking-wider transition-colors mt-2"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="w-full max-w-[300px] animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 bg-[#e0ece4] rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#2e6e44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-[#2a1b15] mb-3 text-center">Verified!</h3>
              <p className="text-[#5c4a3d] font-medium mb-6 text-sm px-2 text-center">You are verified. Use the coupon code below to get 10% off your order.</p>
              
              <div className="w-full bg-[#fdfaf5] border-2 border-dashed border-[#d2c4b3] rounded-[12px] p-6 mb-6 relative">
                <p className="text-2xl font-bold text-primary tracking-[0.2em] text-center select-all">GRIDOX10</p>
                <p className="text-[10px] text-[#8e7f72] absolute bottom-2 right-0 left-0 text-center uppercase tracking-wider font-bold">Tap code to select</p>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-primary text-primary-foreground py-4 rounded-[12px] font-bold tracking-wider hover:opacity-90 hover:scale-[1.05] hover:shadow-xl transition-all duration-300"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
