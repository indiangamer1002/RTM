import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Folder, FileText, Layout, Users, Settings, Plus, FolderPlus, FileTextIcon, MoreVertical } from 'lucide-react';
import { NavigationNode } from '@/types/rtm';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddFolderDialog } from '@/components/dialogs/AddFolderDialog';
import { AddRequirementDialog } from '@/components/dialogs/AddRequirementDialog';

interface FocusDrillSidebarProps {
  data: NavigationNode[];
  onSelect: (node: NavigationNode) => void;
  onOpenFinder: () => void;
  selectedId: string | null;
  onContextChange?: (context: NavigationNode | null) => void;
  externalPath?: NavigationNode[];
  onAddFolder?: (data: any) => void;
  onAddRequirement?: (data: any) => void;
  onDataUpdate?: (newData: NavigationNode[]) => void;
  onNavigateToNewRequirement?: () => void;
}

export function FocusDrillSidebar({
  data,
  onSelect,
  onOpenFinder,
  selectedId,
  onContextChange,
  externalPath,
  onAddFolder,
  onAddRequirement,
  onDataUpdate,
  onNavigateToNewRequirement
}: FocusDrillSidebarProps) {
  const [history, setHistory] = useState<NavigationNode[][]>([data]);
  const [currentPath, setCurrentPath] = useState<NavigationNode[]>([]);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [activeTab, setActiveTab] = useState('process');
  const [showAddFolder, setShowAddFolder] = useState(false);

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

  // Update history when data changes to reflect new additions
  useEffect(() => {
    if (currentPath.length === 0) {
      setHistory([data]);
    } else {
      // Rebuild history based on current path
      const newHistory: NavigationNode[][] = [data];
      let currentLevel = data;

      for (const pathNode of currentPath) {
        const foundNode = currentLevel.find(n => n.id === pathNode.id);
        if (foundNode && foundNode.children) {
          currentLevel = foundNode.children;
          newHistory.push(currentLevel);
        }
      }
      setHistory(newHistory);
    }
  }, [data]);

  const currentLevelItems = useMemo(() => history[history.length - 1], [history]);
  const parentFolder = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  // Notify parent ONLY when the user manually drills in the SIDEBAR
  // To avoid circular loops, we check if the change was manual
  const notifyContextChange = (folder: NavigationNode | null) => {
    onContextChange?.(folder);
  };

  const handleDrillDown = (folder: NavigationNode) => {
    if (folder.children !== undefined) {
      // First notify parent about the selection to update table
      onSelect(folder);
      
      setSlideDirection('right');
      setTimeout(() => {
        setHistory(prev => [...prev, folder.children || []]);
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

  const handleAddFolder = (folderData: any) => {
    const newFolder: NavigationNode = {
      id: `folder-${Date.now()}`,
      name: folderData.title,
      type: 'process',
      children: [],
      status: 'in-scope'
    };

    const updatedData = addNodeToPath([...data], folderData.path, newFolder);
    onDataUpdate?.(updatedData);
    onAddFolder?.(folderData);
  };

  const handleAddRequirement = () => {
    onNavigateToNewRequirement?.();
  };

  const addNodeToPath = (rootData: NavigationNode[], path: NavigationNode[], newNode: NavigationNode): NavigationNode[] => {
    if (path.length === 0) {
      return [...rootData, newNode];
    }

    return rootData.map(node => {
      if (node.id === path[0].id) {
        return {
          ...node,
          children: addNodeToPath(node.children || [], path.slice(1), newNode)
        };
      }
      return node;
    });
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-sidebar-background/40 backdrop-blur-md overflow-hidden border-r border-sidebar-border relative">
        {/* Static Sidebar Title with Toolbar - Always visible */}
        <div className="px-4 pt-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-foreground/90 tracking-tight flex items-center gap-2">
              Requirements Explorer
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowAddFolder(true)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Add Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddRequirement}>
                  <FileTextIcon className="mr-2 h-4 w-4" />
                  Add Requirement
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Unified Interactive Header - Only visible when drilled down */}
        {depth > 0 && (
          <div className="border-b border-sidebar-border/30 shrink-0">
            <div
              className="h-14 flex items-center px-4 gap-3 transition-colors hover:bg-slate-50/80 cursor-pointer"
              onClick={handleBack}
            >
              <ArrowLeft className="h-[18px] w-[18px] text-slate-500 shrink-0" />
              <span className="text-sm font-semibold truncate text-slate-900">
                {currentFolderName}
              </span>
            </div>
            <div className="px-4 pb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground/70 truncate cursor-help">
                    {currentPath.length > 0 ? currentPath.map(node => node.name).join(' > ') : 'Home'}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="text-xs">
                    {currentPath.length > 0 ? currentPath.map(node => node.name).join(' > ') : 'Home'}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {/* List Area - Only this part animates */}
        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-16 custom-scrollbar transition-all duration-300 ease-in-out px-2 space-y-1",
          slideDirection === 'right' && "opacity-0 translate-x-4",
          slideDirection === 'left' && "opacity-0 -translate-x-4",
          !slideDirection && "opacity-100 translate-x-0"
        )}>
          {currentLevelItems.map((node) => {
            const isFolder = node.children !== undefined;
            const isActive = selectedId === node.id;
            const isInScope = node.status === 'in-scope';

            return (
              <div
                key={node.id}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all relative group text-left",
                  isActive
                    ? "bg-secondary/80 text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <button
                  onClick={() => isFolder ? handleDrillDown(node) : onSelect(node)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  {isFolder ? (
                    <Folder className={cn("h-4 w-4 shrink-0", isActive ? "text-primary/70" : "text-muted-foreground/60 transition-colors group-hover:text-primary/60")} />
                  ) : (
                    <FileText className={cn("h-4 w-4 shrink-0", isActive ? "text-primary/70" : "text-muted-foreground/40")} />
                  )}
                  <span className="truncate flex-1">{node.name}</span>
                </button>

                <div className="flex items-center gap-1 shrink-0">
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
                </div>

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-sidebar-background/60 backdrop-blur-xl border-t border-sidebar-border/30 z-10">
          <div className="px-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
            Context: <span className="text-foreground/80">MDLP FY25</span>
          </div>
        </div>

        {/* Dialogs */}
        <AddFolderDialog
          open={showAddFolder}
          onOpenChange={setShowAddFolder}
          data={data}
          onSubmit={handleAddFolder}
        />
      </div>
    </TooltipProvider>
  );
}
