import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength meter
  const [strength, setStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
  const [feedback, setFeedback] = useState<string[]>([]);

  const evaluatePassword = (val: string) => {
    setNewPassword(val);
    const missing: string[] = [];
    if (val.length < 8) missing.push('At least 8 characters');
    if (!/[A-Z]/.test(val)) missing.push('One uppercase letter');
    if (!/[a-z]/.test(val)) missing.push('One lowercase letter');
    if (!/\d/.test(val)) missing.push('One number');
    if (!/[^A-Za-z0-9]/.test(val)) missing.push('One special character');

    setFeedback(missing);
    if (val.length === 0) setStrength('Weak');
    else if (missing.length === 0) setStrength('Strong');
    else if (missing.length <= 2) setStrength('Medium');
    else setStrength('Weak');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      const emailParam = searchParams.get('email');
      let email = emailParam || 'unknown';

      if (token && emailParam) {
        const res = await fetch('/php-backend/auth/update_password.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailParam, token, password: newPassword })
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Failed to reset password');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) email = user.email;
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
      }

      // Log password reset to login_audit_logs
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
        const ipData = ipResponse ? await ipResponse.json() : null;
        const ip = ipData ? ipData.ip : 'Local';

        const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
        await fetch(`${API_BASE}/log_auth_event.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: email,
            action: 'Password Reset',
            ip_address: ip,
            user_id: user?.id
          })
        });
      } catch (auditErr) {
        console.error('Failed to log password reset:', auditErr);
      }

      setSuccess(true);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully reset. Redirecting to login...",
      });

      setTimeout(() => {
        navigate('/crm');
      }, 3000);

    } catch (err: any) {
      console.error('Error updating password:', err);
      setErrorMsg(err.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans">
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
          <h2 className="text-2xl font-black text-white tracking-tight">Create New Password</h2>
          <p className="text-slate-300 text-xs mt-1 font-medium">Please enter and confirm your new secure password below.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-semibold leading-relaxed">
              Password updated successfully! Redirecting you to the CRM login page...
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-new-password" className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wide">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input autoComplete="new-password"
                  id="reset-new-password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={e => evaluatePassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-accent font-semibold placeholder:text-slate-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">Strength:</span>
                    <span className={
                      strength === 'Strong' ? 'text-emerald-400' :
                      strength === 'Medium' ? 'text-amber-400' : 'text-red-400'
                    }>{strength}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${
                      strength === 'Strong' ? 'w-full bg-emerald-500' :
                      strength === 'Medium' ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-red-500'
                    }`} />
                  </div>
                  {feedback.length > 0 && (
                    <p className="text-[9px] text-slate-400 italic mt-1 font-semibold">
                      Missing: {feedback.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reset-confirm-password" className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input autoComplete="new-password"
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border rounded-xl text-xs text-white focus:outline-none font-semibold placeholder:text-slate-500 transition-all ${
                    confirmPassword.length > 0
                      ? confirmPassword === newPassword
                        ? 'border-emerald-500/80 ring-1 ring-emerald-500/40'
                        : 'border-red-500/80 ring-1 ring-red-500/40'
                      : 'border-white/15 focus:ring-2 focus:ring-accent'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Passwords Match / Mismatch Feedback Indicator */}
              {confirmPassword.length > 0 && (
                confirmPassword === newPassword ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Passwords match
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-red-400 animate-fadeIn">
                    <XCircle className="w-3.5 h-3.5 text-red-400" /> Passwords do not match
                  </div>
                )
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (confirmPassword.length > 0 && confirmPassword !== newPassword)}
              className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-xs ${
                confirmPassword.length > 0 && confirmPassword !== newPassword
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25 cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving password...
                </>
              ) : (
                <>
                  Reset Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-white/5 text-center text-[10px] text-slate-500 font-semibold">
          Secure Login Powered by Ghumo Firoo Travels
        </div>
      </div>
    </div>
  );
}
