import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, Lock, Mail, Sparkles } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isIdle = searchParams.get('reason') === 'idle';
  const isRevoked = searchParams.get('reason') === 'revoked';
  const revokedMessage = searchParams.get('message');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/crm');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loading_start();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify user session & navigate to CRM
      if (data.session) {
        try {
          const apiBase = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';
          await fetch(`${apiBase}/users.php`, {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`
            }
          }).catch(() => {});
        } catch (ignored) {}
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in to the agent portal.",
      });

      navigate('/crm');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      loading_stop();
    }
  };

  const loading_start = () => setLoading(true);
  const loading_stop = () => setLoading(false);

  return (
    <div className="min-h-screen bg-[#0B1026] flex overflow-hidden font-poppins">
      {/* Left Side - Agency Logo & Branding Cover Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-cover bg-center relative p-12 overflow-hidden border-r border-white/5"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1026] via-[#0B1026]/80 to-transparent z-0" />
        
        {/* Modern glowing ambient blurs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px] z-0 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D8B97A]/5 rounded-full blur-[100px] z-0 pointer-events-none" />
        
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
            <Sparkles className="w-3.5 h-3.5" />
            CRM Portal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight font-montserrat">
            Smart Lead Management & Automated Itinerary Workflows
          </h1>
          <p className="text-base text-slate-300 font-medium">
            Streamline your travel consultancy, automate customer proposals, and optimize bookings with the premium Ghumo Firoo enterprise ecosystem.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-400 font-semibold">
          © {new Date().getFullYear()} GhumoFiroo Travels. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form (Glassmorphic) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0B1026] relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 lg:hidden flex justify-between items-center">
            <Link to="/" className="inline-flex items-center text-sm font-semibold text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2 text-accent" />
              Back to Home
            </Link>
            <img
              src="/ghumo-firoo-logo.png"
              alt="Ghumo Firoo Travels"
              className="h-7 w-auto brightness-0 invert"
            />
          </div>

          <Card className="shadow-glass-lg border border-white/10 bg-[#1A2342]/60 backdrop-blur-2xl rounded-3xl text-white">
            <CardHeader className="space-y-4 text-center pb-4">
              {/* Brand Insignia Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-warm rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20 rotate-3 hover:rotate-0 transition-all duration-300">
                  <Sparkles className="w-7 h-7 text-[#0B1026] animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-extrabold tracking-tight font-montserrat text-white">
                  Agent Sign In
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-300">
                  Access your premium travel CRM dashboard
                </CardDescription>
                {isIdle && (
                  <div className="mt-2 bg-[#C9A25A]/20 border border-[#C9A25A]/45 text-[#C9A25A] rounded-xl p-3 text-[11px] font-semibold text-center animate-pulse">
                    🔒 You have been logged out due to inactivity. Please log in again.
                  </div>
                )}
                {isRevoked && (
                  <div className="mt-2 bg-red-500/15 border border-red-500/40 text-red-300 rounded-xl p-3 text-[11px] font-semibold text-center">
                    🔒 {revokedMessage || 'Your account access has changed. Please contact your administrator.'}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wide">Username / Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input autoComplete="email"
                      id="email"
                      type="email"
                      placeholder="agent@ghumofiroo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11 focus-visible:ring-accent border-white/10 bg-white/5 text-white placeholder-white/20 rounded-xl font-medium text-sm focus-visible:outline-none"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wide">Password</Label>
                    <Button 
                      variant="link" 
                      type="button"
                      className="p-0 h-auto text-xs font-bold text-accent hover:text-[#D8B97A] transition-colors"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input autoComplete="current-password"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-11 pr-12 focus-visible:ring-accent border-white/10 bg-white/5 text-white placeholder-white/20 rounded-xl font-medium text-sm focus-visible:outline-none"
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-slate-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm font-bold bg-gradient-warm hover:scale-[1.02] active:scale-95 text-[#0B1026] rounded-xl shadow-lg shadow-accent/10 transition-all duration-300 mt-2 border-0 cursor-pointer" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center border-t border-white/10 pt-4">
                <p className="text-xs font-medium text-slate-300">
                  🔒 Account registration is <span className="text-accent font-semibold">Admin Invitation</span> only. Contact your CRM administrator for an invite.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;