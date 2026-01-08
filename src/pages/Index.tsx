import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalHeader } from '@/components/rtm/GlobalHeader';
import { NavigationTree } from '@/components/rtm/NavigationTree';
import { FilterBar } from '@/components/rtm/FilterBar';
import { RTMTable } from '@/components/rtm/RTMTable';
import { navigationData, requirementsData } from '@/data/mockData';
import { NavigationNode, Requirement } from '@/types/rtm';
import { ChevronLeft, ChevronRight, LayoutGrid, Link, List, BarChart3, GitBranch, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NavigationNode | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('admin');

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

  const handleRequirementClick = (req: Requirement) => {
    navigate(`/requirement/${req.reqId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Header */}
      <GlobalHeader breadcrumb={breadcrumb} />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation */}
        <div
          className={cn(
            'transition-all duration-300 ease-in-out flex-shrink-0',
            isNavCollapsed ? 'w-0' : 'w-64'
          )}
        >
          {!isNavCollapsed && (
            <NavigationTree
              data={navigationData}
              selectedId={selectedNode?.id || null}
              onSelect={handleNodeSelect}
            />
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="relative flex-shrink-0 min-w-[24px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
            className="absolute top-4 -left-3 z-20 h-6 w-6 rounded-full border border-border bg-background shadow-sm hover:bg-muted"
          >
            {isNavCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* View Title */}
          <div className="px-6 py-4 border-b border-border bg-background">
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
          <div className="flex-1 overflow-auto bg-background pt-4">
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
