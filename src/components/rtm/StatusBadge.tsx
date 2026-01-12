import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'teal' | 'purple' | 'orange';

interface StatusBadgeProps {
  label: string;
  type: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
};

export function StatusBadge({ label, type, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', statusStyles[type], className)}>
      {label}
    </span>
  );
}
