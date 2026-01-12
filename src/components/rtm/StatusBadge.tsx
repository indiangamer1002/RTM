import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'teal' | 'purple' | 'orange';

interface StatusBadgeProps {
  label: string;
  type: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-[#945ecf]/10 text-[#945ecf] dark:bg-[#945ecf]/20 border-[#945ecf]/20',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  error: 'bg-[#E74C3C]/10 text-[#E74C3C] dark:bg-[#E74C3C]/20 border-[#E74C3C]/20',
  info: 'bg-[#5899da]/10 text-[#5899da] dark:bg-[#5899da]/20 border-[#5899da]/20',
  neutral: 'bg-[#6c8893]/10 text-[#6c8893] dark:bg-[#6c8893]/20 border-[#6c8893]/20',
  teal: 'bg-[#51aa7a]/10 text-[#51aa7a] dark:bg-[#51aa7a]/20 border-[#51aa7a]/20',
  purple: 'bg-[#808080]/10 text-[#808080] dark:bg-[#808080]/20 border-[#808080]/20',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
};

export function StatusBadge({ label, type, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', statusStyles[type], className)}>
      {label}
    </span>
  );
}
