import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Layers, Target, CheckCircle, XCircle } from 'lucide-react';
import { NavigationNode } from '@/types/rtm';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavigationTreeProps {
  data: NavigationNode[];
  selectedId: string | null;
  onSelect: (node: NavigationNode) => void;
}

function TreeNode({
  node,
  level = 0,
  selectedId,
  onSelect,
  expandedIds,
  toggleExpand
}: {
  node: NavigationNode;
  level?: number;
  selectedId: string | null;
  onSelect: (node: NavigationNode) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const getIcon = () => {
    switch (node.type) {
      case 'project':
        return isExpanded ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-primary" />;
      case 'scope':
        return <Layers className="h-4 w-4 text-status-info" />;
      case 'process':
        return <Target className="h-4 w-4 text-status-warning" />;
      case 'requirement':
        return node.status === 'in-scope'
          ? <CheckCircle className="h-4 w-4 text-status-success" />
          : <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleClick = () => {
    if (hasChildren) {
      toggleExpand(node.id);
    }
    onSelect(node);
  };

  return (
    <div>
      <div
        className={cn(
          'nav-tree-item',
          isSelected && 'active',
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </span>
        ) : (
          <span className="w-4" />
        )}
        {getIcon()}
        <span className="truncate flex-1">{node.name}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className="animate-accordion-down">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function NavigationTree({ data, selectedId, onSelect }: NavigationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['proj-1', 'scope-2', 'proc-3']));
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
    <div className="h-full bg-nav-background border-r border-nav-border overflow-hidden flex flex-col">
      {/* Header with Project Selector */}
      <div className="p-4 border-b border-nav-border min-h-[60px] flex items-center">
        <Select value={currentProject} onValueChange={setCurrentProject}>
          <SelectTrigger className="w-full bg-background border-input">
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {data.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-primary" />
                  <span className="font-medium">{project.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {selectedProjectNode?.children && selectedProjectNode.children.length > 0 ? (
          selectedProjectNode.children.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No items in this project
          </div>
        )}
      </div>
    </div>
  );
}
