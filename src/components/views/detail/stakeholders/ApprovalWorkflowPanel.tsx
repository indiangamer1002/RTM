import { ApprovalWorkflow } from '@/types/stakeholder.types';
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ApprovalWorkflowPanelProps {
  workflow: ApprovalWorkflow;
  onRequestAll: () => void;
}

export const ApprovalWorkflowPanel = ({ workflow, onRequestAll }: ApprovalWorkflowPanelProps) => {
  const percentage = workflow.totalApprovers > 0 
      ? Math.round((workflow.approvedCount / workflow.totalApprovers) * 100) 
      : 0;
  
  const isComplete = workflow.approvedCount === workflow.totalApprovers && workflow.totalApprovers > 0;
  
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
         {/* Header */}
         <div className="space-y-2">
             <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-sm">Approval Workflow</h3>
                 {isComplete ? (
                     <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                         <CheckCircle2 className="h-3 w-3" /> 
                         Complete
                     </span>
                 ) : (
                     <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                         <Clock className="h-3 w-3" /> 
                         In Progress
                     </span>
                 )}
             </div>
             <p className="text-xs text-muted-foreground">
                 Last updated: {new Date(workflow.lastActivityDate).toLocaleDateString()}
             </p>
         </div>

         {/* Progress Section */}
         <div className="space-y-3">
             <div className="flex justify-between items-center">
                 <span className="text-sm font-medium">{workflow.approvedCount} of {workflow.totalApprovers} Approvals Received</span>
                 <span className="text-sm font-bold text-primary">{percentage}%</span>
             </div>
             <Progress value={percentage} className="h-2" />
         </div>

         {/* Stats Grid - More spacious */}
         <div className="grid grid-cols-3 gap-3">
             <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                 <div className="flex items-center justify-center text-green-600 mb-1">
                     <CheckCircle2 className="h-5 w-5" />
                 </div>
                 <div className="font-bold text-xl text-green-700">{workflow.approvedCount}</div>
                 <div className="text-xs text-green-600 font-medium">Approved</div>
             </div>
             
             <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                 <div className="flex items-center justify-center text-red-600 mb-1">
                     <XCircle className="h-5 w-5" />
                 </div>
                 <div className="font-bold text-xl text-red-700">{workflow.rejectedCount}</div>
                 <div className="text-xs text-red-600 font-medium">Rejected</div>
             </div>

             <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                 <div className="flex items-center justify-center text-amber-600 mb-1">
                     <AlertCircle className="h-5 w-5" />
                 </div>
                 <div className="font-bold text-xl text-amber-700">{workflow.pendingCount}</div>
                 <div className="text-xs text-amber-600 font-medium">Pending</div>
             </div>
         </div>

         {/* Action Button */}
         {!isComplete && (
             <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onRequestAll}
            >
                 Remind Pending Approvers
             </Button>
         )}
    </div>
  );
};
