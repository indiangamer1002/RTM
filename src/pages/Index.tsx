import { useState } from 'react';
import { GlobalHeader } from '@/components/rtm/GlobalHeader';
import { NavigationTree } from '@/components/rtm/NavigationTree';
import { FilterBar } from '@/components/rtm/FilterBar';
import { RTMTable } from '@/components/rtm/RTMTable';
import { DetailPanel } from '@/components/rtm/DetailPanel';
import { navigationData, requirementsData } from '@/data/mockData';
import { NavigationNode, Requirement } from '@/types/rtm';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<NavigationNode | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('admin');

  const breadcrumb = ['MOLP FY25', 'RTM', 'Plan to Produce', 'Production', 'Material Planning'];

  const handleNodeSelect = (node: NavigationNode) => {
    setSelectedNode(node);
  };

  const handleRequirementClick = (req: Requirement) => {
    setSelectedRequirement(req);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
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
        <div className="relative flex-shrink-0">
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
                  <p className="text-sm text-muted-foreground">Trace View - {requirementsData.length} requirements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar onViewChange={setCurrentView} />

          {/* RTM Table */}
          <div className={cn("flex-1 bg-background", isDetailPanelOpen ? "overflow-hidden" : "overflow-auto")}>
            <RTMTable
              requirements={requirementsData}
              onRequirementClick={handleRequirementClick}
            />
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <DetailPanel
        requirement={selectedRequirement}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseDetailPanel}
      />
    </div>
  );
};

export default Index;
