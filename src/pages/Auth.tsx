import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, User } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        // Check if user is approved
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('approved, role')
            .eq('id', data.user.id)
            .single();

          if (!profile?.approved) {
            await supabase.auth.signOut();
            throw new Error('Your account is pending admin approval. Please wait for approval before logging in.');
          }
        }
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        navigate('/crm');
      } else {
        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) throw error;

        // Send welcome/creation notification
        if (authData.user) {
          try {
            await supabase.functions.invoke('send-user-notification', {
              body: {
                email: email,
                fullName: fullName,
                role: 'user',
                approved: false,
                type: 'creation'
              }
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        }
        
        toast({
          title: "Account created!",
          description: "Your account has been created and is pending admin approval. You'll receive an email once approved.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex">
      {/* Left Side - Agency Logo & Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-gradient-to-b from-primary to-primary/80 p-12">
        <div className="text-center text-white space-y-6">
          <img
            src="/lovable-uploads/dc7c4d6f-9ccd-4614-abea-77d7936b921b.png"
            alt="Ghumo Firoo Travels"
            className="h-20 w-auto mx-auto mb-8 filter brightness-0 invert"
          />
          <h1 className="text-3xl font-bold">Ghumo Firoo</h1>
          <p className="text-lg text-white/90 max-w-md">
            "Solving problems for our travel itinerary, increasing efficiency and leading to optimization by lead management system."
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card className="shadow-xl border-0 bg-background/95 backdrop-blur">
            <CardHeader className="space-y-6 text-center">
              <div className="lg:hidden flex justify-center">
                <img
                  src="/lovable-uploads/dc7c4d6f-9ccd-4614-abea-77d7936b921b.png"
                  alt="Ghumo Firoo Travels"
                  className="h-12 w-auto"
                />
              </div>
              
              {/* User Profile Picture Placeholder */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border-4 border-primary/10">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <CardTitle className="text-2xl font-bold">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </CardTitle>
                <CardDescription className="mt-2">
                  {isLogin 
                    ? 'Access your travel CRM dashboard' 
                    : 'Join our travel management platform'
                  }
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">{isLogin ? 'Username/Email' : 'Email'}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isLogin ? "ghumofiroo" : "Enter your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <Button variant="link" className="p-0 h-auto text-sm text-primary">
                      Forgot Password?
                    </Button>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <Button
                    variant="link"
                    className="p-0 ml-1 h-auto text-primary font-semibold"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </Button>
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