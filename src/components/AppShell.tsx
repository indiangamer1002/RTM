import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalHeader } from '@/components/rtm/GlobalHeader';
import { FocusDrillSidebar } from '@/components/navigation/FocusDrillSidebar';
import { FinderModal } from '@/components/navigation/FinderModal';
import { FilterBar } from '@/components/rtm/FilterBar';
import { RTMTreeTable } from '@/components/rtm/RTMTreeTable';
import { RTMTraceView } from '@/components/rtm/RTMTraceView';
import { KPIDashboard } from '@/components/dashboard/KPIDashboard';
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
  const [showListView, setShowListView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tableView, setTableView] = useState<'explorer' | 'trace'>('explorer');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "Req ID", "Req Title", "Type", "Source Owner", "Priority", "Status",
    "Task", "TESTCASES", "Issues", "Sign-offs", "CTA", "Meetings"
  ]);

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const breadcrumb = ['MDLP FY25', 'Requirements', 'Home'];
  const viewOptions = [
    { id: 'list', label: 'List View', icon: List },
    // { id: 'grid', label: 'Grid View', icon: LayoutGrid },
    // { id: 'analytics', label: 'Analytics View', icon: BarChart3 },
    // { id: 'trace', label: 'Trace View', icon: GitBranch }
  ];


  // Convert requirements data to navigation format with all fields
  const enhancedNavigationData = useMemo(() => {
    const requirements = requirementsData.map(req => ({
      id: req.id,
      name: req.title,
      type: 'requirement' as const,
      status: 'in-scope' as const,
      requirementStatus: req.status,
      priority: req.priority,
      createdBy: req.createdBy,
      createdOn: req.createdAt,
      phase: req.lifecyclePhase,
      coverage: req.traceabilityStatus === 'fully-traced' ? 'full' as const : 
                req.traceabilityStatus === 'partially-traced' ? 'partial' as const : 'none' as const
    }));
    
    // Group requirements by their process/scope
    const groupedReqs = requirements.reduce((acc, req) => {
      const reqData = requirementsData.find(r => r.id === req.id);
      if (reqData) {
        const key = reqData.processId || 'other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(req);
      }
      return acc;
    }, {} as Record<string, NavigationNode[]>);

    // Update navigation structure with requirements
    return navigationData.map(project => ({
      ...project,
      children: project.children?.map(scope => ({
        ...scope,
        children: scope.children?.map(process => ({
          ...process,
          children: groupedReqs[process.id] || []
        }))
      }))
    }));
  }, []);

  // Get table data based on current context
  const getTableData = (): NavigationNode[] => {
    if (drillContext && drillContext.children) {
      return drillContext.children;
    }
    return enhancedNavigationData[0]?.children || [];
  };

  // Dynamic breadcrumb for GlobalHeader
  const globalBreadcrumb = useMemo(() => {
    const base = ['MDLP FY25', 'Requirements'];
    
    if (selectedNode) {
      const path = findPathToNode(navigationData[0]?.children || [], selectedNode.id);
      if (path) {
        return [...base, ...path.map(n => n.name), selectedNode.name];
      }
      return [...base, selectedNode.name];
    }

    if (showListView && drillContext) {
      const path = findPathToNode(navigationData[0]?.children || [], drillContext.id);
      if (path) {
        return [...base, ...path.map(n => n.name), drillContext.name];
      }
      return [...base, drillContext.name];
    }

    return [...base, 'Home'];
  }, [drillContext, selectedNode, showListView]);

  const handleNodeSelect = (node: NavigationNode) => {
    // If it's a requirement (leaf node), navigate to RequirementDetail page
    if (node.type === 'requirement') {
      navigate(`/requirement/${node.id}`);
      return;
    }
    
    // If it's a folder, show its children in the table
    setSelectedNode(node);
    setDrillContext(node);
    setShowListView(true);
  };

  // Handle context change from sidebar or finder (when drilling in/out)
  const handleContextChange = (context: NavigationNode | null, isFromSidebar?: boolean) => {
    setDrillContext(context);
    setSelectedNode(null);
    
    // Show list view when there's a context (folder selected)
    setShowListView(!!context);

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

  const handleShowInListView = (node: NavigationNode) => {
    setDrillContext(node);
    setSelectedNode(null);
    setShowListView(true); // Explicitly enable list view
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden font-sans text-foreground/90">
      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Fullscreen Filter Bar */}
          <div className="flex-shrink-0 bg-background border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <FilterBar
              onViewChange={setCurrentView}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
              onFullscreenToggle={() => setIsFullscreen(false)}
              tableView={tableView}
              onTableViewChange={setTableView}
            />
          </div>
          
          {/* Fullscreen Table */}
          <div className="flex-1 overflow-hidden">
            {tableView === 'explorer' ? (
              <RTMTreeTable
                data={getTableData()}
                onRequirementSelect={(node) => navigate(`/requirement/${node.id}`)}
              />
            ) : (
              <RTMTraceView
                data={enhancedNavigationData}
                onRequirementSelect={(node) => navigate(`/requirement/${node.id}`)}
                visibleColumns={visibleColumns}
              />
            )}
          </div>
        </div>
      )}
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
      <GlobalHeader breadcrumb={globalBreadcrumb} />

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
            data={enhancedNavigationData[0]?.children || []}
            selectedId={selectedNode?.id || null}
            onSelect={handleNodeSelect}
            onOpenFinder={() => setIsFinderOpen(true)}
            onContextChange={(ctx) => handleContextChange(ctx, true)}
            externalPath={sidebarPath}
            onNavigateToNewRequirement={() => navigate('/requirements/new')}
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
          {/* Conditional Filter Bar - Only show when table is displayed */}
          {showListView && (
            <div className="flex-shrink-0 bg-background border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-30">
              <FilterBar
                onViewChange={setCurrentView}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
                onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                tableView={tableView}
                onTableViewChange={setTableView}
              />
            </div>
          )}

          {/* Dedicated Content Area - Edge to Edge, No Page Scroll */}
          <div className="flex-1 overflow-hidden relative">
            {showListView && !isFullscreen ? (
              tableView === 'explorer' ? (
                <RTMTreeTable
                  data={getTableData()}
                  onRequirementSelect={(node) => navigate(`/requirement/${node.id}`)}
                />
              ) : (
                <RTMTraceView
                  data={enhancedNavigationData}
                  onRequirementSelect={(node) => navigate(`/requirement/${node.id}`)}
                  visibleColumns={visibleColumns}
                />
              )
            ) : !isFullscreen ? (
              <KPIDashboard />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
