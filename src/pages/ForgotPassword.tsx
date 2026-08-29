import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) return;

    setLoading(true);
    try {
      // Send password reset link via Resend API (High-Deliverability Provider)
      const res = await fetch('/php-backend/auth/send_password_reset.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      if (!res.ok) {
        // Fallback to Supabase auth reset if PHP backend endpoint not available
        const redirectUrl = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl
        });
        if (error) throw error;
      }

      setSuccess(true);
      toast({
        title: "Reset Email Sent!",
        description: `Please check your inbox at ${email} for your secure password reset link.`,
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(err.message || 'Could not send recovery email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans">
      {/* Background glow overlay */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />

      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/60 backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Branding Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-8 w-auto brightness-0 invert" />
          </div>
          <span className="text-[11px] font-black tracking-widest text-amber-400 uppercase block mb-1">
            ✦ GHUMO FIROO TRAVELS ✦
          </span>
          <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-widest block mb-4">
            Where Dreams Become Itineraries
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">Forgot Password?</h2>
          <p className="text-slate-400 text-xs mt-1">Enter your registered email below, and we will send you a secure link to reset your password.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs leading-relaxed font-semibold">
              Reset email sent! Please check your inbox at <strong className="text-white">{email}</strong> and follow the link to create a new password.
            </div>
            <Link to="/crm" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg">
              Return to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="text-[10px] font-extrabold text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input autoComplete="email"
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-accent font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending link...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <Link to="/crm" className="w-full py-3 border border-white/10 hover:bg-white/5 text-slate-300 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </form>
        )}

        <div className="pt-4 border-t border-white/5 text-center text-[10px] text-slate-500 font-semibold">
          Secure Login Powered by Ghumo Firoo Travels
        </div>
      </div>
    </div>
  );
}
