import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalHeader } from '@/components/rtm/GlobalHeader';
import { FocusDrillSidebar } from '@/components/navigation/FocusDrillSidebar';
import { FinderModal } from '@/components/navigation/FinderModal';
import { FilterBar } from '@/components/rtm/FilterBar';
import { RTMTable } from '@/components/rtm/RTMTable';
import { navigationData, requirementsData } from '@/data/mockData';
import { NavigationNode, Requirement } from '@/types/rtm';
import { ChevronLeft, ChevronRight, LayoutGrid, Link, List, BarChart3, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DetailPanel } from '@/components/rtm/DetailPanel';

// Helper to collect all node IDs in a subtree (for filtering by scope)
function collectDescendantIds(node: NavigationNode): string[] {
  const ids = [node.id];
  if (node.children) {
    node.children.forEach(child => {
      ids.push(...collectDescendantIds(child));
    });
  }
  return ids;
}


export function AppShell() {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NavigationNode | null>(null);
  const [drillContext, setDrillContext] = useState<NavigationNode | null>(null); // Current folder we're IN
  const [sidebarPath, setSidebarPath] = useState<NavigationNode[]>([]);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('admin');
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [detailPanelTab, setDetailPanelTab] = useState('overview');
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  const breadcrumb = ['MDLP FY25', 'RTM', 'Home'];
  const viewOptions = [
    { id: 'list', label: 'List View', icon: List },
    { id: 'grid', label: 'Grid View', icon: LayoutGrid },
    { id: 'analytics', label: 'Analytics View', icon: BarChart3 },
    { id: 'trace', label: 'Trace View', icon: GitBranch }
  ];

  // Helper to find the path from root to a specific node ID
  const findPathToNode = (nodes: NavigationNode[], targetId: string, currentPath: NavigationNode[] = []): NavigationNode[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) return currentPath;
      if (node.children) {
        const found = findPathToNode(node.children, targetId, [...currentPath, node]);
        if (found) return found;
      }
    }
    return null;
  };

  // Filter requirements based on drill-down context OR specific leaf selection
  const filteredRequirements = useMemo(() => {
    // Priority 1: Specific leaf-node selection (nth layer click)
    if (selectedNode && selectedNode.type === 'requirement') {
      return requirementsData.filter(req => req.id === selectedNode.id);
    }

    // Priority 2: Drill context (folder-level view)
    if (drillContext) {
      const nodeType = drillContext.type;
      const nodeId = drillContext.id;

      if (nodeType === 'scope') {
        return requirementsData.filter(req => req.scopeId === nodeId);
      } else if (nodeType === 'process') {
        return requirementsData.filter(req => req.processId === nodeId);
      }
    }

    // Priority 3: Default root level (show all)
    return requirementsData;
  }, [drillContext, selectedNode]);

  // Dynamic path based on drill context or selection
  const currentPath = useMemo(() => {
    if (selectedNode && selectedNode.type === 'requirement') {
      return ["MDLP FY25", selectedNode.name];
    }
    if (!drillContext) return ["MDLP FY25", "All Requirements"];
    return ["MDLP FY25", drillContext.name];
  }, [drillContext, selectedNode]);

  const handleNodeSelect = (node: NavigationNode) => {
    setSelectedNode(node);

    // If selecting a requirement from FINDER, we want to snap the sidebar to its parent process
    if (node.type === 'requirement') {
      const path = findPathToNode(navigationData[0]?.children || [], node.id);
      if (path) {
        setSidebarPath(path);
        setDrillContext(path[path.length - 1] || null);
      }
    }
  };

  // Handle context change from sidebar or finder (when drilling in/out)
  const handleContextChange = (context: NavigationNode | null, isFromSidebar?: boolean) => {
    setDrillContext(context);
    setSelectedNode(null);

    // If change comes from FINDER, we need to update sidebar history
    if (!isFromSidebar && context) {
      const path = findPathToNode(navigationData[0]?.children || [], context.id);
      if (path) {
        setSidebarPath([...path, context]);
      } else {
        setSidebarPath([context]);
      }
    } else if (!isFromSidebar && !context) {
      setSidebarPath([]);
    }
  };

  const handleRequirementClick = (req: Requirement, tab?: string) => {
    if (tab) {
      setSelectedRequirement(req);
      setDetailPanelTab(tab);
      setIsDetailPanelOpen(true);
    } else {
      navigate(`/requirement/${req.reqId}`);
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden font-sans text-foreground/90">
      {/* Finder Modal Layer */}
      <FinderModal
        isOpen={isFinderOpen}
        onOpenChange={setIsFinderOpen}
        data={navigationData[0]?.children || []}
        onSelect={handleNodeSelect}
        onContextChange={handleContextChange}
        currentContext={drillContext}
        selectedNode={selectedNode}
      />

      <DetailPanel
        requirement={selectedRequirement}
        isOpen={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
        initialTab={detailPanelTab}
      />

      {/* Global Header */}
      <GlobalHeader breadcrumb={breadcrumb} />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation: Focus Drill Pattern */}
        <div
          className={cn(
            'transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 border-r border-border overflow-hidden',
            isNavCollapsed ? 'w-0 opacity-0' : 'w-72 opacity-100'
          )}
        >
          <FocusDrillSidebar
            data={navigationData[0]?.children || []}
            selectedId={selectedNode?.id || null}
            onSelect={handleNodeSelect}
            onOpenFinder={() => setIsFinderOpen(true)}
            onContextChange={(ctx) => handleContextChange(ctx, true)}
            externalPath={sidebarPath}
          />
        </div>

        {/* Collapse Toggle */}
        <div className="relative flex-shrink-0 w-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            className={cn(
              "absolute top-[22px] h-8 w-4 rounded-r border border-l-0 border-border bg-background/90 backdrop-blur-sm shadow-sm hover:bg-muted hover:w-5 transition-all duration-300 group flex items-center justify-center",
              isNavCollapsed
                ? "left-0"
                : "-left-px"
            )}
            title={isNavCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isNavCollapsed ? (
              <ChevronRight className="h-3 w-3 text-muted-foreground/80 group-hover:text-primary transition-colors" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-muted-foreground/80 group-hover:text-primary transition-colors" />
            )}
          </Button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative overflow-hidden">
          {/* Fixed Header Portion (Title + Filter) */}
          <div className="flex-shrink-0 bg-background border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-30">
            {/* View Title */}
            <div className="pl-12 pr-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Requirement Traceability Matrix</h1>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                      <Link className="h-3 w-3" />
                      <span>{currentPath.join(' > ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {viewOptions.map((view) => {
                    const IconComponent = view.icon;
                    return (
                      <Button
                        key={view.id}
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all"
                        title={view.label}
                      >
                        <IconComponent className="h-4 w-4" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Bar - Part of the fixed area */}
            <FilterBar onViewChange={setCurrentView} />
          </div>

          {/* Dedicated Content Area - Edge to Edge, No Page Scroll */}
          <div className="flex-1 overflow-hidden relative">
            <RTMTable
              requirements={filteredRequirements}
              onRequirementClick={handleRequirementClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
