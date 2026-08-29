import React from 'react';
import { Shield, Award, Star, Users, Globe, CheckCircle, Clock, Heart, MapPin, Plane } from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'certification' | 'award' | 'membership' | 'guarantee';
  year?: string;
  verified: boolean;
  color: string;
}

const trustBadges: Badge[] = [
  {
    id: '1',
    title: 'ISO 9001:2015 Certified',
    description: 'Quality Management System Certification',
    icon: <Shield className="w-8 h-8" />,
    type: 'certification',
    year: '2023',
    verified: true,
    color: 'blue'
  },
  {
    id: '3',
    title: 'Best Travel Agency 2023',
    description: 'Tourism Excellence Awards Winner',
    icon: <Award className="w-8 h-8" />,
    type: 'award',
    year: '2023',
    verified: true,
    color: 'yellow'
  },
  {
    id: '4',
    title: '4.9/5 Customer Rating',
    description: 'Based on 2,500+ verified reviews',
    icon: <Star className="w-8 h-8" />,
    type: 'award',
    verified: true,
    color: 'orange'
  },
  {
    id: '5',
    title: '50,000+ Happy Travelers',
    description: 'Served customers across 25+ countries',
    icon: <Users className="w-8 h-8" />,
    type: 'guarantee',
    verified: true,
    color: 'green'
  },
  {
    id: '6',
    title: 'Ministry of Tourism Approved',
    description: 'Government of India Recognition',
    icon: <CheckCircle className="w-8 h-8" />,
    type: 'certification',
    year: '2019',
    verified: true,
    color: 'emerald'
  },
  {
    id: '7',
    title: '24/7 Customer Support',
    description: 'Round-the-clock assistance guarantee',
    icon: <Clock className="w-8 h-8" />,
    type: 'guarantee',
    verified: true,
    color: 'purple'
  },
  {
    id: '8',
    title: 'Sustainable Tourism Certified',
    description: 'Committed to responsible travel practices',
    icon: <Heart className="w-8 h-8" />,
    type: 'certification',
    year: '2022',
    verified: true,
    color: 'pink'
  },
  {
    id: '9',
    title: 'Global Destinations Network',
    description: 'Partnerships in 100+ destinations worldwide',
    icon: <Globe className="w-8 h-8" />,
    type: 'membership',
    verified: true,
    color: 'cyan'
  },
  {
    id: '10',
    title: '15+ Years Experience',
    description: 'Established leader in travel industry',
    icon: <MapPin className="w-8 h-8" />,
    type: 'guarantee',
    year: '2008',
    verified: true,
    color: 'slate'
  }
];

const colorClasses: Record<string, { bg: string; border: string; icon: string; title: string; desc: string; badge: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    desc: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'text-indigo-600',
    title: 'text-indigo-900',
    desc: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-800'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    desc: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  orange: {
    bg: 'bg-accent/5',
    border: 'border-accent/30',
    icon: 'text-accent',
    title: 'text-orange-900',
    desc: 'text-accent',
    badge: 'bg-accent/10 text-accent'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    desc: 'text-green-700',
    badge: 'bg-green-100 text-green-800'
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    title: 'text-emerald-900',
    desc: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    title: 'text-purple-900',
    desc: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800'
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    icon: 'text-pink-600',
    title: 'text-pink-900',
    desc: 'text-pink-700',
    badge: 'bg-pink-100 text-pink-800'
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: 'text-cyan-600',
    title: 'text-cyan-900',
    desc: 'text-cyan-700',
    badge: 'bg-cyan-100 text-cyan-800'
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'text-slate-600',
    title: 'text-slate-900',
    desc: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-800'
  }
};

interface TrustBadgesProps {
  variant?: 'grid' | 'horizontal' | 'compact';
  showTitle?: boolean;
  maxItems?: number;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({
  variant = 'grid',
  showTitle = true,
  maxItems = 10
}) => {
  const displayBadges = trustBadges.slice(0, maxItems);

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 py-4">
        {displayBadges.map(badge => (
          <div key={badge.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            {badge.title}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900">Why Travel With Us</h3>
            <p className="text-sm text-slate-600 mt-1">Certified quality, government recognitions, and 24/7 travel support</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayBadges.map((badge) => {
            const colors = colorClasses[badge.color] || colorClasses.slate;
            return (
              <div key={badge.id} className={`p-4 rounded-xl border ${colors.bg} ${colors.border} flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className={colors.icon}>{badge.icon}</div>
                  <h4 className={`font-bold text-sm ${colors.title}`}>{badge.title}</h4>
                  <p className={`text-xs ${colors.desc}`}>{badge.description}</p>
                </div>
                {badge.year && (
                  <span className="text-[10px] text-slate-400 font-mono mt-3 block">Est. {badge.year}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;