import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalHeader } from '@/components/rtm/GlobalHeader';
import { NavigationTree } from '@/components/rtm/NavigationTree';
import { FilterBar } from '@/components/rtm/FilterBar';
import { RTMTable } from '@/components/rtm/RTMTable';
import { navigationData, requirementsData } from '@/data/mockData';
import { NavigationNode, Requirement } from '@/types/rtm';
import { ChevronLeft, ChevronRight, LayoutGrid, Link, List, BarChart3, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { DetailPanel } from '@/components/rtm/DetailPanel';

const Index = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NavigationNode | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('admin');
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [detailPanelTab, setDetailPanelTab] = useState('overview');

  const breadcrumb = ['MDLP FY25', 'RTM', 'Home'];
  const mockPath = ["MDLP FY25", "Order to cash", "Sales Order Management"];
  const viewOptions = [
    { id: 'list', label: 'List View', icon: List },
    { id: 'grid', label: 'Grid View', icon: LayoutGrid },
    { id: 'analytics', label: 'Analytics View', icon: BarChart3 },
    { id: 'trace', label: 'Trace View', icon: GitBranch }
  ];

  const handleNodeSelect = (node: NavigationNode) => {
    setSelectedNode(node);
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
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
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
        {/* Left Navigation */}
        <div
          className={cn(
            'transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 border-r border-border overflow-hidden',
            isNavCollapsed ? 'w-0 opacity-0' : 'w-72 opacity-100'
          )}
        >
          <NavigationTree
            data={navigationData}
            selectedId={selectedNode?.id || null}
            onSelect={handleNodeSelect}
          />
        </div>

        {/* Collapse Toggle - Tactical placement to avoid header icon overlap */}
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
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* View Title */}
          <div className="pl-12 pr-6 py-4 border-b border-border bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Requirement Traceability Matrix</h1>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Link className="h-3 w-3" />
                    <span>{mockPath.join(' > ')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewOptions.map((view) => {
                  const IconComponent = view.icon;
                  return (
                    <Button
                      key={view.id}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-border hover:bg-muted"
                      title={view.label}
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar onViewChange={setCurrentView} />

          {/* RTM Table */}
          <div className={cn("flex-1 bg-background p-4", isDetailPanelOpen ? "overflow-hidden" : "overflow-auto")}>
            <RTMTable
              requirements={requirementsData}
              onRequirementClick={handleRequirementClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
