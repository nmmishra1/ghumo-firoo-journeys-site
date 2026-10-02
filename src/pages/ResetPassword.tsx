import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, XCircle, Sparkles, KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        const resData = await res.json().catch(() => ({}));
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
            ip_address: ip
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
        navigate('/auth');
      }, 2500);

    } catch (err: any) {
      console.error('Error updating password:', err);
      setErrorMsg(err.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1026] flex flex-col lg:flex-row overflow-x-hidden font-poppins">
      {/* Left Side - Agency Branding & Travel Visual */}
      <div 
        className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-cover bg-center relative p-12 overflow-hidden border-r border-white/5 min-h-screen sticky top-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1600')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1026] via-[#0B1026]/85 to-transparent z-0" />
        
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-[100px] z-0 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D8B97A]/10 rounded-full blur-[100px] z-0 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/20 text-accent">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <img
            src="/ghumo-firoo-logo.png"
            alt="Ghumo Firoo Travels"
            className="h-9 w-auto brightness-0 invert"
          />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            Security Verification
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-montserrat">
            Create Your New Secure Password
          </h1>
          <p className="text-base text-slate-300 font-medium">
            Choose a strong password to safeguard your travel agency account, custom client itineraries, and sensitive quote financials.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 font-semibold">
          © {new Date().getFullYear()} GhumoFiroo Travels. All rights reserved.
        </div>
      </div>

      {/* Right Side - Reset Password Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-[#0B1026] relative min-h-screen py-10 overflow-y-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10 my-auto">
          {/* Mobile Back & Brand */}
          <div className="mb-6 flex justify-between items-center">
            <Link to="/auth" className="inline-flex items-center text-sm font-semibold text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2 text-accent" />
              Back to Sign In
            </Link>
            <img
              src="/ghumo-firoo-logo.png"
              alt="Ghumo Firoo Travels"
              className="h-7 w-auto brightness-0 invert lg:hidden"
            />
          </div>

          <Card className="shadow-glass-lg border border-white/10 bg-[#1A2342]/60 backdrop-blur-2xl rounded-3xl text-white">
            <CardHeader className="space-y-4 text-center pb-4">
              {/* Brand Key Insignia */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-warm rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20 rotate-3 hover:rotate-0 transition-all duration-300">
                  <KeyRound className="w-7 h-7 text-[#0B1026]" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-extrabold tracking-tight font-montserrat text-white">
                  New Password
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-300 max-w-xs mx-auto">
                  Please enter and verify your new account credentials below.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {success ? (
                <div className="space-y-5 text-center py-4">
                  <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-7 h-7 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white font-montserrat">
                      Password Reset Successfully!
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your new password has been verified and saved. Redirecting you to the sign in portal...
                    </p>
                  </div>

                  <Button 
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="w-full h-11 text-sm font-bold bg-gradient-warm hover:scale-[1.02] active:scale-95 text-[#0B1026] rounded-xl shadow-lg shadow-accent/10 transition-all duration-300 border-0 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    Go to Sign In <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-new-password" className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        autoComplete="new-password"
                        id="reset-new-password"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={e => evaluatePassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 pl-11 pr-12 focus-visible:ring-accent border-white/10 bg-white/5 text-white placeholder-white/20 rounded-xl font-medium text-sm focus-visible:outline-none"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-slate-400 hover:text-white"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-1 bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
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
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            Missing: {feedback.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-confirm-password" className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        autoComplete="new-password"
                        id="reset-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`h-12 pl-11 pr-12 bg-white/5 rounded-xl font-medium text-sm focus-visible:outline-none transition-all ${
                          confirmPassword.length > 0
                            ? confirmPassword === newPassword
                              ? 'border-emerald-500/80 focus-visible:ring-emerald-500/50 text-white'
                              : 'border-red-500/80 focus-visible:ring-red-500/50 text-white'
                            : 'border-white/10 focus-visible:ring-accent text-white placeholder-white/20'
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-slate-400 hover:text-white"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>

                    {confirmPassword.length > 0 && (
                      confirmPassword === newPassword ? (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Passwords match
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-red-400">
                          <XCircle className="w-3.5 h-3.5 text-red-400" /> Passwords do not match
                        </div>
                      )
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || (confirmPassword.length > 0 && confirmPassword !== newPassword)}
                    className="w-full h-12 text-sm font-bold bg-gradient-warm hover:scale-[1.02] active:scale-95 text-[#0B1026] rounded-xl shadow-lg shadow-accent/10 transition-all duration-300 mt-2 border-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0B1026]" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </Button>

                  <div className="pt-2">
                    <Link 
                      to="/auth" 
                      className="w-full h-11 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4 text-accent" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center border-t border-white/10 pt-4">
                <p className="text-[11px] font-medium text-slate-400">
                  🔒 Protected by <span className="text-[#C9A25A] font-semibold">Ghumo Firoo Security Architecture</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
