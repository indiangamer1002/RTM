import { useState, useEffect } from 'react';
import { 
    Stakeholder, 
    StakeholderSectionData, 
    ActivityFeedItem 
} from '@/types/stakeholder.types';
import { stakeholdersService } from '@/services/stakeholdersService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Plus, LayoutGrid, List as ListIcon, Users } from 'lucide-react';
import { StakeholderFilters } from './stakeholders/StakeholderFilters';
import { StakeholderList } from './stakeholders/StakeholderList';
import { StakeholderModal } from './stakeholders/StakeholderModal';
import { ApprovalWorkflowPanel } from './stakeholders/ApprovalWorkflowPanel';
import { ActivityFeed } from './stakeholders/ActivityFeed';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface StakeholdersTabProps {
  requirementId: string;
}

export const StakeholdersTab = ({ requirementId }: StakeholdersTabProps) => {
  const [data, setData] = useState<StakeholderSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filters State
  const [filters, setFilters] = useState({
      search: '',
      role: '',
      department: ''
  });

  const loadData = async () => {
      setLoading(true);
      try {
          const result = await stakeholdersService.fetchStakeholderData(requirementId);
          setData(result);
      } catch (error) {
          toast.error("Failed to load stakeholders");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    loadData();
  }, [requirementId]);

  const handleAddStakeholder = async (newStakeholder: Omit<Stakeholder, 'id' | 'addedDate'>) => {
      try {
          await stakeholdersService.addStakeholder(requirementId, newStakeholder);
          toast.success(`${newStakeholder.name} added to the team`);
          loadData(); // Reload to get fresh state + activity feed
      } catch (error) {
          toast.error("Failed to add stakeholder");
      }
  };

  const handleRemoveStakeholder = async (id: string) => {
      try {
          await stakeholdersService.removeStakeholder(requirementId, id);
          toast.success("Stakeholder removed");
          loadData();
      } catch (error) {
          toast.error("Failed to remove stakeholder");
      }
  };

  const handleApprove = async (id: string) => {
      try {
          await stakeholdersService.approveRequirement(requirementId, id);
          toast.success("Approval recorded successfully");
          loadData();
      } catch (error) {
          toast.error("Failed to record approval");
      }
  };

  const handleRemindAll = () => {
      toast.success("Reminder emails sent to 2 pending approvers");
  };

  // Filter Logic
  const filteredStakeholders = data ? data.stakeholders.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            s.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRole = !filters.role || s.role === filters.role;
      const matchesDept = !filters.department || s.department === filters.department;
      
      return matchesSearch && matchesRole && matchesDept;
  }) : [];

  if (loading) {
      return (
          <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  if (!data) return null;

  return (
    <div className="w-full h-full px-6 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                Stakeholders 
                <Badge variant="outline" className="ml-1">{data.stakeholders.length}</Badge>
            </h2>
            <p className="text-sm text-muted-foreground">Team members and their responsibilities</p>
          </div>
          
          <div className="flex items-center gap-2">
              <div className="border rounded-md p-1 bg-muted/30 mr-2 hidden sm:block">
                  <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'grid'|'list')}>
                      <ToggleGroupItem value="grid" size="sm" className="h-7 px-2"><LayoutGrid className="h-3.5 w-3.5"/></ToggleGroupItem>
                      <ToggleGroupItem value="list" size="sm" className="h-7 px-2"><ListIcon className="h-3.5 w-3.5"/></ToggleGroupItem>
                  </ToggleGroup>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Add Member
              </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main List Area */}
          <div className="xl:col-span-3 space-y-4">
              <StakeholderFilters 
                  activeFilters={filters}
                  onSearchChange={(v) => setFilters({...filters, search: v})}
                  onRoleChange={(v) => setFilters({...filters, role: v})}
                  onDeptChange={(v) => setFilters({...filters, department: v})}
                  onClear={() => setFilters({ search: '', role: '', department: '' })}
              />

              <StakeholderList 
                  stakeholders={filteredStakeholders}
                  viewMode={viewMode}
                  onRemove={handleRemoveStakeholder}
                  onApprove={handleApprove}
              />
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
              {/* Approval Workflow Widget */}
              {data.approvalWorkflow && (
                  <ApprovalWorkflowPanel 
                      workflow={data.approvalWorkflow}
                      onRequestAll={handleRemindAll}
                  />
              )}

              {/* Activity Feed */}
              <div className="h-[400px]">
                  <ActivityFeed activities={data.activityFeed} />
              </div>
          </div>
      </div>

      {/* Add Modal */}
      <StakeholderModal 
          open={isAddModalOpen} 
          onOpenChange={setIsAddModalOpen}
          onSubmit={handleAddStakeholder}
      />
    </div>
  );
};
