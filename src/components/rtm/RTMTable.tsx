import { Requirement, Priority, RequirementStatus, RequirementType } from '@/types/rtm';
import { StatusBadge } from './StatusBadge';
import { StatusBar, StatusSegment } from './StatusBar';
import { RTMHoverCard } from './HoverCard';
import { cn } from '@/lib/utils';

interface RTMTableProps {
  requirements: Requirement[];
  onRequirementClick: (req: Requirement) => void;
}

const priorityMap: Record<Priority, 'error' | 'warning' | 'success'> = {
  'High': 'error',
  'Medium': 'warning',
  'Low': 'success',
};

const statusMap: Record<RequirementStatus, 'neutral' | 'info' | 'success' | 'success'> = {
  'New': 'neutral',
  'Active': 'info',
  'Completed': 'success',
  'Approved': 'success',
};

const typeMap: Record<RequirementType, 'info' | 'warning' | 'neutral'> = {
  'Business': 'info',
  'Functional': 'warning',
  'Technical': 'neutral',
};

function getTaskSegments(req: Requirement): StatusSegment[] {
  const completed = req.tasks.filter(t => t.status === 'Completed');
  const inProgress = req.tasks.filter(t => t.status === 'In Progress');
  const open = req.tasks.filter(t => t.status === 'Open');

  return [
    { label: 'Completed', count: completed.length, color: 'green', items: completed.map(t => ({ id: t.id, title: t.title, status: `Assignee: ${t.assignee}` })) },
    { label: 'In Progress', count: inProgress.length, color: 'blue', items: inProgress.map(t => ({ id: t.id, title: t.title, status: `Assignee: ${t.assignee}` })) },
    { label: 'Open', count: open.length, color: 'gray', items: open.map(t => ({ id: t.id, title: t.title, status: `Due: ${t.dueDate}` })) },
  ];
}

function getTestPrepSegments(req: Requirement): StatusSegment[] {
  const ready = req.testCases.filter(tc => tc.status === 'Ready');
  const inProgress = req.testCases.filter(tc => tc.status === 'In Progress');
  const notStarted = req.testCases.filter(tc => tc.status === 'Not Started');

  return [
    { label: 'Ready', count: ready.length, color: 'green', items: ready.map(tc => ({ id: tc.id, title: tc.title, status: tc.tester ? `Tester: ${tc.tester}` : 'Ready for execution' })) },
    { label: 'In Progress', count: inProgress.length, color: 'blue', items: inProgress.map(tc => ({ id: tc.id, title: tc.title, status: tc.tester ? `Tester: ${tc.tester}` : 'In preparation' })) },
    { label: 'Not Started', count: notStarted.length, color: 'gray', items: notStarted.map(tc => ({ id: tc.id, title: tc.title, status: 'Pending preparation' })) },
  ];
}

function getExecutionSegments(req: Requirement): StatusSegment[] {
  const pass = req.testCases.filter(tc => tc.executionResult === 'Pass');
  const fail = req.testCases.filter(tc => tc.executionResult === 'Fail');
  const blocked = req.testCases.filter(tc => tc.executionResult === 'Blocked');
  const notRun = req.testCases.filter(tc => !tc.executionResult || tc.executionResult === 'Not Run');

  return [
    { label: 'Pass', count: pass.length, color: 'green', items: pass.map(tc => ({ id: tc.id, title: tc.title, status: tc.lastRun ? `Last run: ${tc.lastRun}` : 'Passed' })) },
    { label: 'Fail', count: fail.length, color: 'red', items: fail.map(tc => ({ id: tc.id, title: tc.title, status: tc.lastRun ? `Last run: ${tc.lastRun}` : 'Failed' })) },
    { label: 'Blocked', count: blocked.length, color: 'blue', items: blocked.map(tc => ({ id: tc.id, title: tc.title, status: 'Blocked' })) },
    { label: 'Not Run', count: notRun.length, color: 'gray', items: notRun.map(tc => ({ id: tc.id, title: tc.title, status: 'Not executed' })) },
  ];
}

function getIssueSegments(req: Requirement): StatusSegment[] {
  const critical = req.issues.filter(i => i.severity === 'Critical' || i.severity === 'High');
  const medium = req.issues.filter(i => i.severity === 'Medium');
  const low = req.issues.filter(i => i.severity === 'Low');

  return [
    { label: 'Critical/High', count: critical.length, color: 'red', items: critical.map(i => ({ id: i.id, title: i.title, status: `${i.severity} - ${i.status}` })) },
    { label: 'Medium', count: medium.length, color: 'blue', items: medium.map(i => ({ id: i.id, title: i.title, status: `${i.severity} - ${i.status}` })) },
    { label: 'Low', count: low.length, color: 'green', items: low.map(i => ({ id: i.id, title: i.title, status: `${i.severity} - ${i.status}` })) },
  ];
}

function getSignOffSegments(req: Requirement): StatusSegment[] {
  const approved = req.signOffs.filter(s => s.status === 'Approved');
  const pending = req.signOffs.filter(s => s.status === 'Pending');
  const rejected = req.signOffs.filter(s => s.status === 'Rejected');

  return [
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(s => ({ id: s.id, title: s.stakeholder, status: `${s.role} - ${s.date || 'Approved'}` })) },
    { label: 'Pending', count: pending.length, color: 'blue', items: pending.map(s => ({ id: s.id, title: s.stakeholder, status: `${s.role} - Awaiting` })) },
    { label: 'Rejected', count: rejected.length, color: 'red', items: rejected.map(s => ({ id: s.id, title: s.stakeholder, status: `${s.role} - Rejected` })) },
  ];
}

export function RTMTable({ requirements, onRequirementClick }: RTMTableProps) {
  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full border-collapse bg-background">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border whitespace-nowrap">
              Req ID
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border min-w-[200px]">
              Req Title
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border whitespace-nowrap">
              Type
            </th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border whitespace-nowrap">
              Source Owner
            </th>
            <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border whitespace-nowrap">
              Priority
            </th>
            <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border whitespace-nowrap">
              Status
            </th>
            <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border whitespace-nowrap">
              Task
            </th>
            <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border min-w-[140px]">
              Testcase
            </th>
            <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border min-w-[100px]">
              Issues
            </th>
            <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-r border-border min-w-[100px]">
              Sign-offs
            </th>
            <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-border min-w-[140px]">
              Req Approval Status
            </th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((req) => {
            const taskSegments = getTaskSegments(req);
            const executionSegments = getExecutionSegments(req);
            const issueSegments = getIssueSegments(req);
            const signOffSegments = getSignOffSegments(req);

            return (
              <tr
                key={req.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => onRequirementClick(req)}
              >
                {/* Req ID */}
                <td className="px-4 py-3 border-b border-r border-border">
                  <span className="text-foreground font-medium text-sm hover:underline">{req.reqId}</span>
                </td>

                {/* Req Title with sub-info */}
                <td className="px-4 py-3 border-b border-r border-border">
                  <RTMHoverCard
                    trigger={
                      <div className="flex flex-col">
                        <span className="text-foreground hover:underline cursor-pointer font-medium text-sm line-clamp-1">
                          {req.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{req.sourceOwner}</span>
                      </div>
                    }
                    title={req.title}
                    items={[
                      { label: 'Type', value: req.type },
                      { label: 'Priority', value: req.priority },
                      { label: 'Status', value: req.status },
                      { label: 'Tasks', value: req.tasks.length },
                      { label: 'Test Cases', value: req.testCases.length },
                    ]}
                    footer={`Last updated by ${req.lastUpdatedBy} on ${req.updatedAt}`}
                  />
                </td>

                {/* Type */}
                <td className="px-4 py-3 border-b border-r border-border">
                  <StatusBadge label={req.type} type={typeMap[req.type]} />
                </td>

                {/* Source Owner */}
                <td className="px-4 py-3 border-b border-r border-border text-sm">
                  {req.sourceOwner}
                </td>

                {/* Priority */}
                <td className="px-4 py-3 border-b border-r border-border text-center">
                  <StatusBadge label={req.priority} type={priorityMap[req.priority]} />
                </td>

                {/* Status */}
                <td className="px-4 py-3 border-b border-r border-border text-center">
                  <StatusBadge label={req.status} type={statusMap[req.status]} />
                </td>

                {/* Task - Status Bar */}
                <td className="px-3 py-3 border-b border-r border-border">
                  <StatusBar
                    segments={taskSegments}
                    total={req.tasks.length}
                    title="Tasks"
                  />
                </td>

                {/* Testcase - Status Bar */}
                <td className="px-3 py-3 border-b border-r border-border">
                  <StatusBar
                    segments={executionSegments}
                    total={req.testCases.length}
                    title="Testcase"
                  />
                </td>

                {/* Issues - Status Bar */}
                <td className="px-3 py-3 border-b border-r border-border">
                  <StatusBar
                    segments={issueSegments}
                    total={req.issues.length}
                    title="Issues"
                  />
                </td>

                {/* Sign-offs - Status Bar */}
                <td className="px-3 py-3 border-b border-r border-border">
                  <StatusBar
                    segments={signOffSegments}
                    total={req.signOffs.length}
                    title="Sign-offs"
                  />
                </td>

                {/* Requirement Approval Status */}
                <td className="px-4 py-3 border-b border-border text-center">
                  <StatusBadge
                    label={req.signOffs.every(s => s.status === 'Approved') ? 'Approved' : req.signOffs.some(s => s.status === 'Rejected') ? 'Rejected' : 'Pending'}
                    type={req.signOffs.every(s => s.status === 'Approved') ? 'success' : req.signOffs.some(s => s.status === 'Rejected') ? 'error' : 'info'}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
