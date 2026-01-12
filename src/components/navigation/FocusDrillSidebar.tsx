import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Folder, FileText, Layout, Users, Settings } from 'lucide-react';
import { NavigationNode } from '@/types/rtm';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FocusDrillSidebarProps {
  data: NavigationNode[];
  onSelect: (node: NavigationNode) => void;
  onOpenFinder: () => void;
  selectedId: string | null;
  onContextChange?: (context: NavigationNode | null) => void;
  externalPath?: NavigationNode[];
}

export function FocusDrillSidebar({
  data,
  onSelect,
  onOpenFinder,
  selectedId,
  onContextChange,
  externalPath
}: FocusDrillSidebarProps) {
  const [history, setHistory] = useState<NavigationNode[][]>([data]);
  const [currentPath, setCurrentPath] = useState<NavigationNode[]>([]);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [activeTab, setActiveTab] = useState('process');

  // Sync internal history with external path changes (e.g. from Finder)
  useEffect(() => {
    if (externalPath && externalPath.length > 0) {
      // Build the history stack from the external path
      const newHistory: NavigationNode[][] = [data];
      let currentLevel = data;

      for (const node of externalPath) {
        const foundNode = currentLevel.find(n => n.id === node.id);
        if (foundNode && foundNode.children) {
          currentLevel = foundNode.children;
          newHistory.push(currentLevel);
        }
      }

      setHistory(newHistory);
      setCurrentPath(externalPath);
    } else if (externalPath === null || (externalPath && externalPath.length === 0)) {
      // Reset to root
      setHistory([data]);
      setCurrentPath([]);
    }
  }, [externalPath, data]);

  const currentLevelItems = useMemo(() => history[history.length - 1], [history]);
  const parentFolder = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  // Notify parent ONLY when the user manually drills in the SIDEBAR
  // To avoid circular loops, we check if the change was manual
  const notifyContextChange = (folder: NavigationNode | null) => {
    onContextChange?.(folder);
  };

  const handleDrillDown = (folder: NavigationNode) => {
    if (folder.children && folder.children.length > 0) {
      setSlideDirection('right');
      setTimeout(() => {
        setHistory(prev => [...prev, folder.children!]);
        setCurrentPath(prev => {
          const newPath = [...prev, folder];
          notifyContextChange(folder);
          return newPath;
        });
        setSlideDirection(null);
      }, 50);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      setSlideDirection('left');
      setTimeout(() => {
        setHistory(prev => prev.slice(0, -1));
        setCurrentPath(prev => {
          const newPath = prev.slice(0, -1);
          const parent = newPath.length > 0 ? newPath[newPath.length - 1] : null;
          notifyContextChange(parent);
          return newPath;
        });
        setSlideDirection(null);
      }, 50);
    }
  };

  const depth = currentPath.length;
  const currentFolderName = parentFolder?.name || 'Process Explorer';

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-sidebar-background/40 backdrop-blur-md overflow-hidden border-r border-sidebar-border relative">
        {/* Static Sidebar Title - Always visible */}
        <div className="px-4 pt-4 shrink-0">
          <h2 className="text-[15px] font-bold text-foreground/90 tracking-tight flex items-center gap-2 mb-3">
            Process Explorer
          </h2>
        </div>

        {/* Unified Interactive Header - Only visible when drilled down */}
        {depth > 0 && (
          <div
            className="h-14 flex items-center border-b border-sidebar-border/30 px-4 gap-3 shrink-0 transition-colors hover:bg-slate-50/80 cursor-pointer"
            onClick={handleBack}
          >
            <ArrowLeft className="h-[18px] w-[18px] text-slate-500 shrink-0" />
            <span className="text-sm font-semibold truncate text-slate-900">
              {currentFolderName}
            </span>
          </div>
        )}

        {/* List Area - Only this part animates */}
        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-16 custom-scrollbar transition-all duration-300 ease-in-out px-2 space-y-0.5",
          slideDirection === 'right' && "opacity-0 translate-x-4",
          slideDirection === 'left' && "opacity-0 -translate-x-4",
          !slideDirection && "opacity-100 translate-x-0"
        )}>
          {currentLevelItems.map((node) => {
            const isFolder = node.children && node.children.length > 0;
            const isActive = selectedId === node.id;
            const isInScope = node.status === 'in-scope';

            return (
              <button
                key={node.id}
                onClick={() => isFolder ? handleDrillDown(node) : onSelect(node)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all relative group text-left",
                  isActive
                    ? "bg-secondary/80 text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isFolder ? (
                    <Folder className={cn("h-4 w-4 shrink-0", isActive ? "text-primary/70" : "text-muted-foreground/60 transition-colors group-hover:text-primary/60")} />
                  ) : (
                    <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-primary/70" : "text-muted-foreground/40")} />
                  )}
                  <span className="truncate flex-1">{node.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isFolder && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "h-2 w-2 rounded-full ring-2 ring-offset-1 ring-offset-background transition-all",
                          isInScope
                            ? "bg-emerald-500 ring-emerald-500/20"
                            : "bg-slate-300 ring-slate-300/20"
                        )} />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {isInScope ? 'In Scope' : 'Out of Scope'}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {isFolder && (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-all group-hover:translate-x-0.5" />
                  )}
                </div>

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-sidebar-background/60 backdrop-blur-xl border-t border-sidebar-border/30 z-10">
          {/* <Button 
            variant="outline" 
            onClick={onOpenFinder}
            className="w-full gap-2 h-10 border-sidebar-border/50 bg-background/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-semibold rounded-lg shadow-sm"
          >
            <Maximize2 className="h-4 w-4" />
            Explore Hierarchy
          </Button> */}
          <div className="px-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
            Context: <span className="text-foreground/80">MDLP FY25</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
