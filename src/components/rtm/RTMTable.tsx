import { useRef, useState, useEffect, useCallback } from 'react';
import { Requirement, Priority, RequirementStatus, RequirementType } from '@/types/rtm';
import { StatusBadge } from './StatusBadge';
import { StatusBar, StatusSegment } from './StatusBar';
import { RTMHoverCard } from './HoverCard';
import { cn } from '@/lib/utils';

interface RTMTableProps {
  requirements: Requirement[];
  onRequirementClick: (req: Requirement, tab?: string) => void;
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
  const newItem = req.tasks.filter(t => t.status === 'New');
  const active = req.tasks.filter(t => t.status === 'Active');
  const completed = req.tasks.filter(t => t.status === 'Completed');
  const approved = req.tasks.filter(t => t.status === 'Approved');

  return [
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(t => ({ id: t.id, title: t.title, status: `Due: ${t.dueDate}` })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(t => ({ id: t.id, title: t.title, status: `Assignee: ${t.assignee}` })) },
    { label: 'Completed', count: completed.length, color: 'teal', items: completed.map(t => ({ id: t.id, title: t.title, status: `Assignee: ${t.assignee}` })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(t => ({ id: t.id, title: t.title, status: 'Approved' })) },
  ];
}

function getTestCaseSegments(req: Requirement): StatusSegment[] {
  const newItem = req.testCases.filter(tc => tc.status === 'New');
  const active = req.testCases.filter(tc => tc.status === 'Active');
  const performed = req.testCases.filter(tc => tc.status === 'performed');
  const approved = req.testCases.filter(tc => tc.status === 'approved');
  const defect = req.testCases.filter(tc => tc.status === 'Defect found');

  return [
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(tc => ({ id: tc.id, title: tc.title, status: 'New' })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(tc => ({ id: tc.id, title: tc.title, status: 'Active' })) },
    { label: 'Performed', count: performed.length, color: 'purple', items: performed.map(tc => ({ id: tc.id, title: tc.title, status: 'Performed' })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(tc => ({ id: tc.id, title: tc.title, status: 'Approved' })) },
    { label: 'Defect', count: defect.length, color: 'red', items: defect.map(tc => ({ id: tc.id, title: tc.title, status: 'Defect Found' })) },
  ];
}

function getExecutionSegments(req: Requirement): StatusSegment[] {
  return getTestCaseSegments(req);
}

function getIssueSegments(req: Requirement): StatusSegment[] {
  const newItem = req.issues.filter(i => i.status === 'New');
  const active = req.issues.filter(i => i.status === 'Active');
  const resolved = req.issues.filter(i => i.status === 'Resolved');
  const approved = req.issues.filter(i => i.status === 'Approved');

  return [
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(i => ({ id: i.id, title: i.title, status: 'New' })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(i => ({ id: i.id, title: i.title, status: 'Active' })) },
    { label: 'Resolved', count: resolved.length, color: 'teal', items: resolved.map(i => ({ id: i.id, title: i.title, status: 'Resolved' })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(i => ({ id: i.id, title: i.title, status: 'Approved' })) },
  ];
}

function getSignOffSegments(req: Requirement): StatusSegment[] {
  const newItem = req.signOffs.filter(s => s.status === 'New');
  const active = req.signOffs.filter(s => s.status === 'Active');
  const approved = req.signOffs.filter(s => s.status === 'Approved');
  const rejected = req.signOffs.filter(s => s.status === 'Rejected');
  const completed = req.signOffs.filter(s => s.status === 'Completed');

  return [
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(s => ({ id: s.id, title: s.stakeholder, status: 'New' })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(s => ({ id: s.id, title: s.stakeholder, status: 'Active' })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(s => ({ id: s.id, title: s.stakeholder, status: 'Approved' })) },
    { label: 'Rejected', count: rejected.length, color: 'red', items: rejected.map(s => ({ id: s.id, title: s.stakeholder, status: 'Rejected' })) },
    { label: 'Completed', count: completed.length, color: 'teal', items: completed.map(s => ({ id: s.id, title: s.stakeholder, status: 'Completed' })) },
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
      className={cn("sticky top-0 z-20 bg-muted/90 backdrop-blur-sm border-b border-r border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500", className)}
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
    <div className="h-full w-full overflow-auto custom-scrollbar bg-background">
      <table className="w-full border-collapse bg-background table-fixed border-separate border-spacing-0">
        <thead className="sticky top-0 z-30">
          <tr className="bg-background">
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
        <tbody className="divide-y divide-border">
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
                        { label: 'Issues', value: req.issues.length },
                        { label: 'Sign-offs', value: req.signOffs.length },
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
                      onViewDetails={() => onRequirementClick(req, 'tasks')}
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
                      onViewDetails={() => onRequirementClick(req, 'test-cases')}
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
                      onViewDetails={() => onRequirementClick(req, 'issues')}
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
                      onViewDetails={() => onRequirementClick(req, 'signoffs')}
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
