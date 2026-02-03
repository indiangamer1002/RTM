import { Search, Settings, HelpCircle, Bell, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface GlobalHeaderProps {
  breadcrumb: string[];
}

export function GlobalHeader({ breadcrumb }: GlobalHeaderProps) {
  return (
    <div className="sticky top-0 z-50">
      {/* Main Header */}
      <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
        {/* Left: Breadcrumb only */}
        <div className="flex items-center gap-6">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                <span className={index === breadcrumb.length - 1 ? 'text-foreground font-medium' : 'breadcrumb-item cursor-pointer'}>
                  {item}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Center: Search Removed */}
        <div className="flex-1 max-w-lg mx-8 hidden lg:block" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium">
            Show RTM
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Button>
          <div className="ml-2 pl-4 border-l border-border">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                KA
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Red Accent Bar */}
      <div className="accent-bar" />
    </div>
  );
}
