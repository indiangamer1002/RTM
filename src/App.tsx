import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalHeader } from '@/components/rtm/GlobalHeader';
import { FilterBar } from '@/components/rtm/FilterBar';
import { FocusDrillSidebar } from '@/components/navigation/FocusDrillSidebar';
import { RTMTreeTable } from '@/components/rtm/RTMTreeTable';
import { RTMTraceView } from '@/components/rtm/RTMTraceView';
import { navigationData, requirementsData } from '@/data/mockData';
import { NavigationNode, Requirement } from '@/types/rtm';
import { Button } from '@/components/ui/button';
import { Eye, ChevronDown, RefreshCw, Filter, Upload, Download, Maximize, Layout, Plus, Save } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import RequirementDetail from "./pages/RequirementDetail";
import NewRequirement from "./pages/NewRequirement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function MainLayout() {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NavigationNode | null>(null);
  const [drillContext, setDrillContext] = useState<NavigationNode | null>(null);
  const [sidebarPath, setSidebarPath] = useState<NavigationNode[]>([]);
  const [currentView, setCurrentView] = useState('admin');
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
      return [...base, selectedNode.name];
    }

    if (drillContext) {
      return [...base, drillContext.name];
    }

    return [...base, 'Home'];
  }, [drillContext, selectedNode]);

  const handleNodeSelect = (node: NavigationNode) => {
    // If it's a requirement (leaf node), navigate to RequirementDetail page
    if (node.type === 'requirement') {
      navigate(`/requirement/${node.id}`);
      return;
    }
    
    // If it's a folder, show its children in the table
    setSelectedNode(node);
    setDrillContext(node);
  };

  // Handle context change from sidebar
  const handleContextChange = (context: NavigationNode | null) => {
    setDrillContext(context);
    setSelectedNode(null);
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* GlobalHeader */}
      <GlobalHeader breadcrumb={globalBreadcrumb} />

      {/* Row 1: FilterBar */}
      <div className="flex-shrink-0 bg-background border-b border-border">
        <FilterBar
          onViewChange={setCurrentView}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          tableView={tableView}
          onTableViewChange={setTableView}
        />
      </div>

      {/* Row 2: Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Col 1: FocusDrillSidebar */}
        <div className="w-72 flex-shrink-0 border-r border-border overflow-hidden">
          <FocusDrillSidebar
            data={enhancedNavigationData[0]?.children || []}
            selectedId={selectedNode?.id || null}
            onSelect={handleNodeSelect}
            onOpenFinder={() => {}}
            onContextChange={handleContextChange}
            externalPath={sidebarPath}
            onNavigateToNewRequirement={() => navigate('/requirements/new')}
          />
        </div>

        {/* Col 2: Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Row 1: Toolbar */}
          <div className="flex-shrink-0 bg-background border-b border-border px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Left: Views */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 border border-muted-foreground/20 hover:border-muted-foreground/40">
                      <Eye className="h-4 w-4" />
                      Admin View
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => setCurrentView('admin')}>Admin View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('tester')}>Tester View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('business')}>Business View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('filtered')}>Filtered View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('sorted')}>Sorted View</DropdownMenuItem>
                    <div className="border-t border-border mt-1 pt-1">
                      <div className="flex items-center gap-1">
                        <DropdownMenuItem className="text-primary flex-1">
                          <Plus className="h-3 w-3 mr-2" />
                          Add View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-primary flex-1">
                          <Save className="h-3 w-3 mr-2" />
                          Save As
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Center: Item Count */}
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">Showing 20 of 245 Items</span>
              </div>

              {/* Right: Table View Dropdown and Action Buttons */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 border border-muted-foreground/20">
                      {tableView === 'explorer' ? 'Explorer View' : 'Trace View'}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTableView('explorer')}>Explorer View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTableView('trace')}>Trace View</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Refresh">
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Filter">
                  <Filter className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Import">
                  <Upload className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Export">
                      <Download className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Export to Excel</DropdownMenuItem>
                    <DropdownMenuItem>Export to CSV</DropdownMenuItem>
                    <DropdownMenuItem>Export to PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Fullscreen">
                  <Maximize className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20" title="Columns">
                      <Layout className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {[
                      "Req ID", "Req Title", "Type", "Source Owner", "Priority", "Status",
                      "Task", "TESTCASES", "Issues", "Sign-offs", "CTA", "Meetings"
                    ].map((col) => (
                      <div key={col} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer" onClick={() => handleColumnToggle(col)}>
                        <Checkbox checked={visibleColumns.includes(col)} id={`col-${col}`} />
                        <label htmlFor={`col-${col}`} className="text-xs flex-1 cursor-pointer">{col}</label>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Row 2: Data Views */}
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
      </div>
    </div>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/requirement/:id" element={<RequirementDetail />} />
            <Route path="/requirements/new" element={<NewRequirement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
