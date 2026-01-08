import { useRef, useState, useEffect, useCallback } from 'react';
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
  // Minimum widths for each column to ensure data visibility
  const minColumnWidths = [
    90,  // Req ID
    300, // Req Title
    110, // Type
    130, // Source Owner
    110, // Priority
    110, // Status
    140, // Task
    140, // Testcase
    140, // Issues
    140, // Sign-offs
  ];

  // Initial widths matching the minimums to prevent gaps
  const [colWidths, setColWidths] = useState<number[]>([...minColumnWidths]);

  const startResize = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = colWidths[index];
    const minWidth = minColumnWidths[index];

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(minWidth, startWidth + (e.pageX - startX));
      setColWidths(prev => {
        const next = [...prev];
        next[index] = newWidth;
        return next;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [colWidths]);

  const renderHeader = (label: string, index: number, className: string = '') => (
    <th
      className={cn("relative border-b border-r border-border px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}
      style={{ width: colWidths[index] }}
    >
      <div className="flex items-center h-full overflow-hidden">
        {label}
      </div>
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors"
        onMouseDown={startResize(index)}
      />
    </th>
  );

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full border-collapse bg-background table-fixed">
        <thead>
          <tr className="bg-muted/50">
            {renderHeader("Req ID", 0, "whitespace-nowrap")}
            {renderHeader("Req Title", 1, "min-w-[200px]")}
            {renderHeader("Type", 2, "text-center whitespace-nowrap")}
            {renderHeader("Source Owner", 3, "whitespace-nowrap")}
            {renderHeader("Priority", 4, "text-center whitespace-nowrap")}
            {renderHeader("Status", 5, "text-center whitespace-nowrap")}
            {renderHeader("Task", 6, "text-center whitespace-nowrap")}
            {renderHeader("TESTCASES", 7, "text-center min-w-[140px]")}
            {renderHeader("Issues", 8, "text-center min-w-[100px]")}
            {renderHeader("Sign-offs", 9, "text-center min-w-[100px]")}
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
                className="hover:bg-muted/30 transition-colors"
              >
                {/* Req ID */}
                <td className="px-4 py-2 border-b border-r border-border truncate" style={{ width: colWidths[0] }}>
                  <span
                    className="text-foreground font-medium text-xs whitespace-nowrap hover:underline cursor-pointer"
                    onClick={() => onRequirementClick(req)}
                  >
                    {req.reqId}
                  </span>
                </td>

                {/* Req Title with sub-info */}
                <td className="px-4 py-2 border-b border-r border-border" style={{ width: colWidths[1] }}>
                  <div className="truncate">
                    <RTMHoverCard
                      trigger={
                        <div className="flex flex-col">
                          <span
                            className="text-foreground hover:underline cursor-pointer font-medium text-sm truncate"
                            onClick={() => onRequirementClick(req)}
                          >
                            {req.title}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">{req.sourceOwner}</span>
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
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-2 border-b border-r border-border truncate text-center" style={{ width: colWidths[2] }}>
                  <div className="flex justify-center">
                    <StatusBadge label={req.type} type={typeMap[req.type]} />
                  </div>
                </td>

                {/* Source Owner */}
                <td className="px-4 py-2 border-b border-r border-border text-sm truncate" style={{ width: colWidths[3] }}>
                  {req.sourceOwner}
                </td>

                {/* Priority */}
                <td className="px-4 py-2 border-b border-r border-border text-center truncate" style={{ width: colWidths[4] }}>
                  <div className="flex justify-center">
                    <StatusBadge label={req.priority} type={priorityMap[req.priority]} />
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-2 border-b border-r border-border text-center truncate" style={{ width: colWidths[5] }}>
                  <div className="flex justify-center">
                    <StatusBadge label={req.status} type={statusMap[req.status]} />
                  </div>
                </td>

                {/* Task - Status Bar */}
                <td className="px-3 py-2 border-b border-r border-border" style={{ width: colWidths[6] }}>
                  <div className="overflow-hidden">
                    <StatusBar
                      segments={taskSegments}
                      total={req.tasks.length}
                      title="Tasks"
                      onViewDetails={() => onRequirementClick(req)}
                      reqId={req.reqId}
                      reqTitle={req.title}
                    />
                  </div>
                </td>

                {/* Testcase - Status Bar */}
                <td className="px-3 py-2 border-b border-r border-border" style={{ width: colWidths[7] }}>
                  <div className="overflow-hidden">
                    <StatusBar
                      segments={executionSegments}
                      total={req.testCases.length}
                      title="TESTCASES"
                      onViewDetails={() => onRequirementClick(req)}
                      reqId={req.reqId}
                      reqTitle={req.title}
                    />
                  </div>
                </td>

                {/* Issues - Status Bar */}
                <td className="px-3 py-2 border-b border-r border-border" style={{ width: colWidths[8] }}>
                  <div className="overflow-hidden">
                    <StatusBar
                      segments={issueSegments}
                      total={req.issues.length}
                      title="Issues"
                      onViewDetails={() => onRequirementClick(req)}
                      reqId={req.reqId}
                      reqTitle={req.title}
                    />
                  </div>
                </td>

                {/* Sign-offs - Status Bar */}
                <td className="px-3 py-2 border-b border-r border-border" style={{ width: colWidths[9] }}>
                  <div className="overflow-hidden">
                    <StatusBar
                      segments={signOffSegments}
                      total={req.signOffs.length}
                      title="Sign-offs"
                      onViewDetails={() => onRequirementClick(req)}
                      reqId={req.reqId}
                      reqTitle={req.title}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
