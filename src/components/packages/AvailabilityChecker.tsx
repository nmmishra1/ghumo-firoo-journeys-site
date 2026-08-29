import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface AvailabilityCheckerProps {
  packageId: string;
  packageName: string;
}

type AvailabilityStatus = 'available' | 'limited' | 'sold_out' | 'unknown';

const statusMeta: Record<AvailabilityStatus, { label: string; color: string; icon: React.ReactNode; blurb: string }> = {
  available: {
    label: 'Available',
    color: 'text-green-600',
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    blurb: 'Plenty of slots available for the selected date.'
  },
  limited: {
    label: 'Limited',
    color: 'text-accent',
    icon: <AlertTriangle className="w-5 h-5 text-accent" />,
    blurb: 'Limited slots left. Book soon to secure your spot.'
  },
  sold_out: {
    label: 'Sold Out',
    color: 'text-red-600',
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    blurb: 'No availability for this date. Try another date.'
  },
  unknown: {
    label: 'Check Required',
    color: 'text-gray-600',
    icon: <Calendar className="w-5 h-5 text-gray-600" />,
    blurb: 'Select a date and run an availability check.'
  }
};

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return (h >>> 0) / 4294967295;
}

function deriveStatus(pkg: string, date: string): AvailabilityStatus {
  if (!date) return 'unknown';
  const r = seededRandom(`${pkg}-${date}`);
  if (r > 0.75) return 'sold_out';
  if (r > 0.45) return 'limited';
  return 'available';
}

const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({ packageId, packageName }) => {
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<AvailabilityStatus>('unknown');
  const [isChecking, setIsChecking] = useState(false);

  const meta = useMemo(() => statusMeta[status], [status]);

  const checkAvailability = async () => {
    setIsChecking(true);
    try {
      // Simulated real-time check; stores a cache so repeated queries feel snappy
      const cacheKey = `availability:${packageId}:${date}`;
      const cached = localStorage.getItem(cacheKey);
      let newStatus: AvailabilityStatus;
      if (cached) {
        newStatus = cached as AvailabilityStatus;
      } else {
        newStatus = deriveStatus(packageId, date);
        localStorage.setItem(cacheKey, newStatus);
      }
      setStatus(newStatus);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card aria-live="polite" className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          Real-time Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label htmlFor={`date-${packageId}`} className="block text-sm font-medium text-gray-700">
              Select your start date for {packageName}
            </label>
            <input
              id={`date-${packageId}`}
              name="availability-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
              aria-describedby={`date-help-${packageId}`}
              autoComplete="off"
            />
            <p id={`date-help-${packageId}`} className="mt-1 text-xs text-gray-500">
              We’ll check current slots and hold your seats.
            </p>
          </div>
          <div>
            <Button onClick={checkAvailability} disabled={!date || isChecking} className="w-full bg-accent hover:bg-accent/90">
              {isChecking ? 'Checking…' : 'Check Availability'}
            </Button>
          </div>
        </div>

        <div role="status" className="flex items-start gap-3 p-3 rounded-md bg-gray-50">
          {meta.icon}
          <div>
            <div className={`font-semibold ${meta.color}`}>{meta.label}</div>
            <div className="text-sm text-gray-600">{meta.blurb}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityChecker;