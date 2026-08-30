import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, User } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireApproval?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  requireApproval = false 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate('/auth');
    }
  }, [user, loading, requireAuth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050814] text-white">
        <div className="flex flex-col items-center space-y-4">
          <img 
            src="/ghumo-firoo-logo.png" 
            alt="Ghumo Firoo" 
            className="h-10 w-auto brightness-0 invert opacity-90 mb-1" 
          />
          <div className="w-8 h-8 border-2 border-[#C9A25A]/20 border-t-[#C9A25A] rounded-full animate-spin"></div>
          <p className="text-[11px] font-bold tracking-[0.15em] text-[#C9A25A] uppercase">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050814] text-white p-4">
        <Card className="w-96 bg-[#0B1026] border border-[#C9A25A]/30 text-white shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#C9A25A]/10 text-[#C9A25A] flex items-center justify-center mx-auto border border-[#C9A25A]/30">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white">Authentication Required</h2>
            <p className="text-xs text-slate-400">Please sign in to access the agent portal & CRM workspace.</p>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-[#C9A25A] hover:bg-[#B8924A] text-slate-950 font-bold text-xs h-10 rounded-xl"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};