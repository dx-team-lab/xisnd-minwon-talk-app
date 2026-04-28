import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';
import { TYPE_BADGE_COLORS } from '@/lib/constants';

export interface CategoryBadgeProps extends React.ComponentPropsWithoutRef<typeof Badge> {
  category?: 'region' | 'regionType' | 'phase' | 'type' | 'default';
  children: React.ReactNode;
}

export function CategoryBadge({ category = 'default', children, className, ...props }: CategoryBadgeProps) {
  let colorClass = 'bg-slate-100 text-slate-700'; // Default gray fallback

  const text = String(children);

  if (category === 'region' || category === 'default') {
    colorClass = 'bg-emerald-50 text-emerald-700 border-none';
  } else if (category === 'regionType') {
    // User requested ALL region types to use the identical mint color
    colorClass = 'bg-emerald-50 text-emerald-700 border-none';
  } else if (category === 'phase') {
    // User requested ALL phases use the red/orange color the same as '준공'
    colorClass = 'bg-orange-50 text-orange-700 border-none';
  } else if (category === 'type') {
    // User requested ALL types to use the identical blue color
    colorClass = 'bg-blue-50 text-blue-600 border-none';
  }

  // Check if colorClass explicitly contains border definition, if not, assume border-none.
  const hasBorder = colorClass.includes('border-');

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full text-sm font-bold whitespace-nowrap px-3 py-1",
        hasBorder ? "" : "border-none",
        colorClass,
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  );
}
