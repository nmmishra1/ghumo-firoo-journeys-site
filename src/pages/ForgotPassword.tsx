import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowRight, Loader2, ArrowLeft, KeyRound, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setLoading(true);
    try {
      // 1. Primary: Attempt PHP backend mailer
      let backendSuccess = false;
      let backendErrorMsg = '';

      try {
        const res = await fetch('/php-backend/auth/send_password_reset.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail })
        });
        const resData = await res.json().catch(() => ({}));
        if (res.ok && resData.success) {
          backendSuccess = true;
        } else {
          backendErrorMsg = resData.detail || resData.error || '';
        }
      } catch (phpErr) {
        console.warn('PHP backend mailer unreachable, checking Supabase fallback:', phpErr);
      }

      // 2. Fallback: Supabase direct password reset if PHP backend did not complete
      if (!backendSuccess) {
        try {
          const redirectUrl = `${window.location.origin}/reset-password`;
          const { error: supaErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: redirectUrl
          });
          if (supaErr) {
            throw new Error(backendErrorMsg || supaErr.message || 'Could not send recovery email. Please contact administrator.');
          }
        } catch (supaErr: any) {
          throw new Error(backendErrorMsg || supaErr.message || 'Email service not configured. Please contact your CRM administrator.');
        }
      }

      setSuccess(true);
      toast({
        title: "Reset Link Sent",
        description: `Please check your inbox at ${cleanEmail} for your password reset link.`,
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(err.message || 'Could not send recovery email. Please try again or contact your administrator.');
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
            Account Security
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-montserrat">
            Secure Travel Agent Account Recovery
          </h1>
          <p className="text-base text-slate-300 font-medium">
            Restore access to your client itineraries, custom package proposals, and flight & hotel booking vouchers with ease.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 font-semibold">
          © {new Date().getFullYear()} GhumoFiroo Travels. All rights reserved.
        </div>
      </div>

      {/* Right Side - Password Recovery Form Card */}
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
                  Reset Password
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-300 max-w-xs mx-auto">
                  Enter your registered agent email to receive a secure one-time password recovery link.
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
                <div className="space-y-5 text-center py-2">
                  <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-7 h-7 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white font-montserrat">
                      Check Your Inbox
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      We have dispatched a password reset link to <strong className="text-[#C9A25A] font-semibold">{email}</strong>. Please check your inbox and spam folder.
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-slate-400">
                    ⏱️ The link is valid for <strong>60 minutes</strong> for your security.
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <Button 
                      type="button"
                      onClick={() => navigate('/auth')}
                      className="w-full h-11 text-sm font-bold bg-gradient-warm hover:scale-[1.02] active:scale-95 text-[#0B1026] rounded-xl shadow-lg shadow-accent/10 transition-all duration-300 border-0 cursor-pointer flex items-center justify-center gap-2"
                    >
                      Return to Sign In <ArrowRight className="w-4 h-4" />
                    </Button>

                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => { setSuccess(false); setErrorMsg(''); }}
                      className="w-full text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 hover:bg-white/5 h-9 rounded-xl"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try another email address
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                      Registered Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        autoComplete="email"
                        id="forgot-email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="agent@ghumofiroo.com"
                        className="h-12 pl-11 focus-visible:ring-accent border-white/10 bg-white/5 text-white placeholder-white/20 rounded-xl font-medium text-sm focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 text-sm font-bold bg-gradient-warm hover:scale-[1.02] active:scale-95 text-[#0B1026] rounded-xl shadow-lg shadow-accent/10 transition-all duration-300 mt-2 border-0 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0B1026]" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Link</span>
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
