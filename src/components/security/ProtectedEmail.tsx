import React, { useState } from 'react';
import { Mail, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProtectedEmailProps {
  user: string; // local-part before @
  domain: string; // domain after @
  label?: string; // optional label to display
  subject?: string; // optional mail subject
  className?: string;
  contactHref?: string; // optional contact form link
}

const ProtectedEmail: React.FC<ProtectedEmailProps> = ({
  user,
  domain,
  label = 'Email (protected)',
  subject,
  className,
  contactHref = '/contact',
}) => {
  const [revealed, setRevealed] = useState(false);
  const { toast } = useToast();

  const address = `${user}@${domain}`;
  const mailto = `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast({ title: 'Copied', description: 'Email address copied to clipboard' });
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually', variant: 'destructive' });
    }
  };

  return (
    <div className={className} aria-live="polite">
      {!revealed ? (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-600" aria-hidden="true" />
          <span className="text-sm text-gray-700" aria-label="Email protected">{label}</span>
          <Button
            type="button"
            onClick={() => setRevealed(true)}
            className="h-8 px-2 py-1 text-xs"
            aria-label="Reveal email address"
          >
            <Eye className="w-3 h-3 mr-1" /> Reveal
          </Button>
          <a href={contactHref} className="text-xs text-blue-600 underline ml-1" aria-label="Open contact form">
            Use contact form
          </a>
          <noscript>
            <span className="text-xs text-gray-600 ml-2">info&#64;ghumofiroo&#46;com (enable JavaScript to reveal)</span>
          </noscript>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-600" aria-hidden="true" />
          <a href={mailto} className="text-sm text-purple-700 underline" aria-label="Open email in mail app">
            {address}
          </a>
          <Button type="button" onClick={copyEmail} className="h-8 px-2 py-1 text-xs" aria-label="Copy email">
            <Copy className="w-3 h-3 mr-1" /> Copy
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProtectedEmail;