import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb as UIBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

interface BreadcrumbItemType {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItemType[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <UIBreadcrumb className={cn("text-[10px] sm:text-[11px] font-bold tracking-wider uppercase", className)}>
      <BreadcrumbList className="gap-1.5 sm:gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={`${item.path}-${index}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-extrabold text-amber-600 dark:text-amber-500 tracking-wider">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={item.path}
                      className="text-slate-400 hover:text-amber-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="text-slate-400/60 shrink-0 scale-75" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </UIBreadcrumb>
  );
};

export default Breadcrumb;