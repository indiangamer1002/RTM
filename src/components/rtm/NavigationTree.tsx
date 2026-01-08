import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Folder, 
  FileText, 
  Layers,
  Box,
  Hash} from 'lucide-react';
import { NavigationNode } from '@/types/rtm';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavigationTreeProps {
  data: NavigationNode[];
  selectedId: string | null;
  onSelect: (node: NavigationNode) => void;
}

const getNodeIcon = (type: NavigationNode['type'], isExpanded: boolean) => {
  switch (type) {
    case 'project':
      return <Layers className="h-3.5 w-3.5 text-orange-600/80" />;
    case 'scope':
      return <Box className="h-3.5 w-3.5 text-orange-500/70" />;
    case 'process':
      return <Folder className={cn("h-3.5 w-3.5 text-blue-500/70", isExpanded && "fill-blue-500/5")} />;
    case 'requirement':
      return <FileText className="h-3.5 w-3.5 text-muted-foreground/40" />;
    default:
      return <Hash className="h-3.5 w-3.5 text-muted-foreground/50" />;
  }
};

function TreeNode({
  node,
  level = 0,
  selectedId,
  onSelect,
  expandedIds,
  toggleExpand,
  searchTerm,
  isLastChild = false,
  parentPath = []
}: {
  node: NavigationNode;
  level?: number;
  selectedId: string | null;
  onSelect: (node: NavigationNode) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  searchTerm: string;
  isLastChild?: boolean;
  parentPath?: boolean[];
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id) || searchTerm.length > 0;
  const isSelected = selectedId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleExpand(node.id);
    }
    onSelect(node);
  };

  const filteredChildren = useMemo(() => {
    if (!searchTerm) return node.children;
    return node.children?.filter(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      child.children?.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [node.children, searchTerm]);

  const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
  const hasMatchingChildren = filteredChildren && filteredChildren.length > 0;

  if (searchTerm && !matchesSearch && !hasMatchingChildren) {
    return null;
  }

  return (
    <div className="relative">
      {/* Thread Lines logic */}
      {level > 0 && (
        <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: '10px' }}>
          {parentPath.slice(0, -1).map((isLast, i) => (
             !isLast && (
               <div 
                 key={i} 
                 className="absolute top-0 bottom-0 w-px bg-border/80" 
                 style={{ left: `${i * 20}px` }} 
               />
             )
          ))}
          <div 
            className="absolute top-0 w-px bg-border/80" 
            style={{ 
              left: `${(level - 1) * 20}px`,
              height: isLastChild ? '1.125rem' : '100%'
            }} 
          />
          <div 
            className="absolute top-[1.125rem] w-[16px] border-t border-border/80" 
            style={{ left: `${(level - 1) * 20}px` }} 
          />
        </div>
      )}

      <div
        className={cn(
          'group relative flex items-center gap-2 px-3 py-1.5 mx-1 my-0.5 text-sm cursor-pointer transition-all duration-150 rounded-md',
          isSelected 
            ? 'text-foreground font-semibold bg-slate-200/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]' 
            : 'text-foreground/60 hover:bg-muted/40 hover:text-foreground/90'
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleClick}
      >
        {/* Active Indicator Bar */}
        {isSelected && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(225,63,0,0.3)]" />
        )}

        {/* Toggle Indicator */}
        <div className="flex items-center justify-center w-5 h-5 -ml-1">
          {hasChildren ? (
            <div className="p-0.5 rounded-sm hover:bg-muted/80 transition-colors">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
              )}
            </div>
          ) : (
             <div className="w-3" />
          )}
        </div>

        {/* Icon */}
        <div className="flex items-center justify-center w-5 h-5 shrink-0 transition-transform group-hover:scale-110">
          {getNodeIcon(node.type, isExpanded)}
        </div>
        
        {/* Name */}
        <span className="truncate flex-1 py-0.5 text-[13px] tracking-tight transition-colors">
          {node.name}
        </span>
        
        {/* Indicators */}
        <div className="flex items-center gap-1.5 ml-auto translate-x-1">
          {/* Scope Tooltip Dots - ONLY for terminal requirement nodes */}
          {node.type === 'requirement' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full cursor-help shadow-[0_0_4px_rgba(0,0,0,0.1)] transition-transform hover:scale-125",
                  node.status === 'in-scope' ? "bg-emerald-500" : "bg-slate-300"
                )} />
              </TooltipTrigger>
              <TooltipContent 
                side="left" 
                align="center"
                sideOffset={10}
                className="text-[11px] font-medium py-1.5 px-3 bg-slate-900 text-slate-50 border-none shadow-xl"
              >
                {node.status === 'in-scope' ? 'In Scope' : 'Out of Scope'}
              </TooltipContent>
            </Tooltip>
          )}
          
          {hasChildren && !isExpanded && (
            <span className="text-[9px] font-bold bg-muted/60 text-muted-foreground/70 px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-0.5">
              {node.children?.length}
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="transition-all duration-300">
          {filteredChildren!.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              searchTerm={searchTerm}
              isLastChild={index === filteredChildren!.length - 1}
              parentPath={[...parentPath, index === filteredChildren!.length - 1]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function NavigationTree({ data, selectedId, onSelect }: NavigationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['proj-1', 'scope-1', 'scope-2']));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProject, setCurrentProject] = useState<string>('');

  useEffect(() => {
    if (data.length > 0 && !currentProject) {
      setCurrentProject(data[0].id);
    }
  }, [data, currentProject]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedProjectNode = data.find(n => n.id === currentProject);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full bg-sidebar-background/30 backdrop-blur-md border-r border-sidebar-border overflow-hidden flex flex-col">
        {/* Optimized Header Spacing */}
        <div className="px-4 pt-3 pb-3 space-y-3 border-b border-sidebar-border/20 shrink-0">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-bold text-foreground/90 tracking-tight">
              Process Explorer
            </h2>
          </div>
          
          <div className="relative group px-0.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-muted-foreground/80 transition-colors" />
            <Input
              placeholder="Search processes..."
              className="pl-9 h-10 bg-muted/40 border-sidebar-border/30 hover:bg-muted/50 focus:bg-background focus:border-border transition-all rounded-lg text-sm placeholder:text-muted-foreground/50 shadow-sm ring-0 focus-visible:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Independently Scrollable Tree Area - Reduced top padding */}
        <div className="flex-1 overflow-y-auto pt-1 pb-4 scrollbar-hide">
          {selectedProjectNode?.children && selectedProjectNode.children.length > 0 ? (
            selectedProjectNode.children.map((node, index) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                searchTerm={searchTerm}
                isLastChild={index === selectedProjectNode.children!.length - 1}
                parentPath={[]}
              />
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground/60 font-medium">No processes found</p>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-3 border-t border-sidebar-border/20 bg-sidebar-background/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md bg-muted/20 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
             <FileText className="h-3 w-3 text-muted-foreground/40" />
             <span className="truncate">Context: {selectedProjectNode?.name || 'Loading...'}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
