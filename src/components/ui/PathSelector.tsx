import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { NavigationNode } from '@/types/rtm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PathSelectorProps {
  data: NavigationNode[];
  selectedPath: NavigationNode[];
  onPathSelect: (path: NavigationNode[]) => void;
  className?: string;
}

export function PathSelector({ data, selectedPath, onPathSelect, className }: PathSelectorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const buildPathToNode = (targetNode: NavigationNode, nodes: NavigationNode[], currentPath: NavigationNode[] = []): NavigationNode[] | null => {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === targetNode.id) {
        return newPath;
      }
      if (node.children) {
        const result = buildPathToNode(targetNode, node.children, newPath);
        if (result) return result;
      }
    }
    return null;
  };

  const handleNodeSelect = (node: NavigationNode) => {
    const path = buildPathToNode(node, data) || [];
    onPathSelect(path);
  };

  const renderNode = (node: NavigationNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedPath.some(p => p.id === node.id);

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded text-sm transition-colors",
            isSelected && "bg-primary/10 text-primary font-medium"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <div className="w-4 flex justify-center">
            {hasChildren && (
              <button
                className="h-4 w-4 flex items-center justify-center hover:bg-muted rounded"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
          
          <Folder className="h-4 w-4 text-muted-foreground" />
          
          <button
            className="flex-1 truncate text-left hover:text-primary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNodeSelect(node);
            }}
          >
            {node.name}
          </button>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="p-2 border-b bg-muted/30">
        <div className="text-xs font-medium text-muted-foreground">
          Selected: {selectedPath.length > 0 ? selectedPath.map(p => p.name).join(' / ') : 'Root'}
        </div>
      </div>
      <ScrollArea className="h-48">
        <div className="p-1">
          <div
            className={cn(
              "flex items-center gap-2 py-1.5 px-2 rounded text-sm cursor-pointer hover:bg-muted/60 transition-colors",
              selectedPath.length === 0 && "bg-primary/10 text-primary font-medium"
            )}
            onClick={() => onPathSelect([])}
          >
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span>Root</span>
          </div>
          {data.map(node => renderNode(node))}
        </div>
      </ScrollArea>
    </div>
  );
}