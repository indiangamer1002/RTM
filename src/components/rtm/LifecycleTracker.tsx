import { FileText, FileEdit, Search, Settings, Layout, Code, TestTube, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface LifecycleStage {
  _id: string;
  workItem: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isInitial: boolean;
  isFinal: boolean;
  active: boolean;
}

interface Status {
  _id: string;
  status: string;
  workItem: string;
  category: string;
  color: string;
  mappedLifecycleState: string | null;
  marksCompletion: boolean;
  order: number;
  active: boolean;
}

interface LifecycleTrackerProps {
  currentStatus: string;
  lifecycleStages: LifecycleStage[];
  statuses: Status[];
}

const iconMap: { [key: string]: any } = {
  'file-text': FileText,
  'file-edit': FileEdit,
  'search': Search,
  'settings': Settings,
  'layout': Layout,
  'code': Code,
  'test-tube': TestTube,
  'check-circle': CheckCircle,
};

export const LifecycleTracker = ({ currentStatus, lifecycleStages, statuses }: LifecycleTrackerProps) => {
  // Find current status object
  const currentStatusObj = statuses.find(s => s.status === currentStatus && s.workItem === 'Requirement');
  
  // Get current lifecycle stage
  const currentLifecycleStageId = currentStatusObj?.mappedLifecycleState;
  const currentLifecycleStage = lifecycleStages.find(stage => stage._id === currentLifecycleStageId);
  
  // Determine stage status based on current position
  const getStageStatus = (stage: LifecycleStage) => {
    if (!currentLifecycleStage) return 'pending';
    
    // If this is the current stage
    if (stage._id === currentLifecycleStageId) {
      // Check if status marks completion
      return currentStatusObj?.marksCompletion ? 'completed' : 'active';
    }
    
    // If stage order is less than current, it's completed
    if (stage.order < currentLifecycleStage.order) {
      return 'completed';
    }
    
    // Otherwise pending
    return 'pending';
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="mb-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium text-foreground">Requirement Lifecycle (RTM)</Label>
        {currentStatusObj && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Current Status:</span>
            <span 
              className="text-xs font-medium px-2 py-1 rounded"
              style={{ 
                backgroundColor: currentStatusObj.color + '20',
                color: currentStatusObj.color 
              }}
            >
              {currentStatus}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {lifecycleStages
          .sort((a, b) => a.order - b.order)
          .map((stage, index) => {
            const IconComponent = iconMap[stage.icon] || FileText;
            const status = getStageStatus(stage);
            
            return (
              <div key={stage._id} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStageColor(status)}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-center whitespace-nowrap">{stage.title}</span>
                </div>
                {index < lifecycleStages.length - 1 && (
                  <div className={`w-8 h-px mt-[-12px] ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
