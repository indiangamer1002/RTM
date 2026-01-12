import { ReactNode, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface StatusSegment {
  label: string;
  count: number;
  color: 'blue' | 'green' | 'red' | 'gray' | 'purple' | 'teal' | 'orange';
  items?: { id: string; title: string; status: string }[];
}

interface StatusBarProps {
  segments: StatusSegment[];
  total: number;
  title: string;
  emptyText?: string;
  onViewDetails?: () => void;
  reqId?: string;
  reqTitle?: string;
}

const colorClasses: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-white', border: 'data-[state=active]:border-blue-500', activeBg: 'data-[state=active]:bg-blue-50' },
  green: { bg: 'bg-green-500', text: 'text-white', border: 'data-[state=active]:border-green-500', activeBg: 'data-[state=active]:bg-green-50' },
  red: { bg: 'bg-red-500', text: 'text-white', border: 'data-[state=active]:border-red-500', activeBg: 'data-[state=active]:bg-red-50' },
  gray: { bg: 'bg-gray-500', text: 'text-white', border: 'data-[state=active]:border-gray-500', activeBg: 'data-[state=active]:bg-gray-50' },
  purple: { bg: 'bg-purple-500', text: 'text-white', border: 'data-[state=active]:border-purple-500', activeBg: 'data-[state=active]:bg-purple-50' },
  teal: { bg: 'bg-teal-500', text: 'text-white', border: 'data-[state=active]:border-teal-500', activeBg: 'data-[state=active]:bg-teal-50' },
  orange: { bg: 'bg-orange-500', text: 'text-white', border: 'data-[state=active]:border-orange-500', activeBg: 'data-[state=active]:bg-orange-50' },
};

export function StatusBar({ segments, total, title, emptyText = '-', onViewDetails, reqId, reqTitle }: StatusBarProps) {
  const [activeTab, setActiveTab] = useState<string>(segments[0]?.label || '');
  const [isOpen, setIsOpen] = useState(false);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-6 text-xs text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  // Filter segments with count > 0
  const activeSegments = segments.filter(s => s.count > 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center h-6 w-full max-w-[180px] cursor-pointer rounded overflow-hidden">
          {activeSegments.map((segment, idx) => {
            const widthPercent = (segment.count / total) * 100;
            const colors = colorClasses[segment.color];

            return (
              <div
                key={segment.label}
                title={segment.label}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(segment.label);
                  setIsOpen(true);
                }}
                className={cn(
                  'h-full flex items-center justify-center text-xs font-medium transition-all',
                  colors.bg,
                  colors.text,
                  idx === 0 && 'rounded-l',
                  idx === activeSegments.length - 1 && 'rounded-r'
                )}
                style={{ width: `${widthPercent}%`, minWidth: segment.count > 0 ? '24px' : 0 }}
              >
                {segment.count}
              </div>
            );
          })}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[550px] p-0 shadow-2xl border-2 bg-popover"
        collisionPadding={16}
        side="left"
        align="center"
      >
        <div className="p-4 border-b border-border bg-muted/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded whitespace-nowrap">{reqId}</span>
                <h4 className="font-semibold text-sm text-foreground truncate">{reqTitle}</h4>
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</span>
            </div>
            {onViewDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                  setIsOpen(false);
                }}
                className="text-muted-foreground hover:text-primary transition-all p-1 hover:scale-110"
                title="View Full Traceability"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 overflow-x-auto flex-nowrap no-scrollbar">
            {segments.map((segment) => {
              const colors = colorClasses[segment.color];
              const isActive = activeTab === segment.label;

              return (
                <TabsTrigger
                  key={segment.label}
                  value={segment.label}
                  className={cn(
                    'flex-1 min-w-fit rounded-none border-b-2 border-transparent py-2 px-3 text-xs font-medium transition-all whitespace-nowrap',
                    colors.border,
                    colors.activeBg,
                    'hover:bg-muted/50'
                  )}
                >
                  <span className="truncate">{segment.label}</span>
                  <span className={cn(
                    'ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold',
                    isActive ? `${colors.bg} ${colors.text}` : 'bg-muted text-muted-foreground'
                  )}>
                    {segment.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {segments.map((segment) => (
            <TabsContent
              key={segment.label}
              value={segment.label}
              className="p-0 m-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 mt-0"
            >
              <div className="h-[200px] overflow-y-auto">
                {segment.items && segment.items.length > 0 ? (
                  <div className="divide-y divide-border">
                    {segment.items.map((item) => (
                      <div key={item.id} className="px-3 py-2 hover:bg-muted/30 transition-colors">
                        <p className="text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.status}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No items in this category
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
