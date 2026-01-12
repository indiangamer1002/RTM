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
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(t => ({ id: t.id, title: t.title, status: `Planned to: ${t.dueDate}` })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(t => ({ id: t.id, title: t.title, status: `Planned to: ${t.dueDate}` })) },
    { label: 'Completed', count: completed.length, color: 'teal', items: completed.map(t => ({ id: t.id, title: t.title, status: `Planned to: ${t.dueDate}` })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(t => ({ id: t.id, title: t.title, status: `Planned to: ${t.dueDate}` })) },
  ];
}

function getTestCaseSegments(req: Requirement): StatusSegment[] {
  const newItem = req.testCases.filter(tc => tc.status === 'New');
  const active = req.testCases.filter(tc => tc.status === 'Active');
  const performed = req.testCases.filter(tc => tc.status === 'performed');
  const approved = req.testCases.filter(tc => tc.status === 'approved');
  const defect = req.testCases.filter(tc => tc.status === 'Defect found');

  return [
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(tc => ({ id: tc.id, title: tc.title, status: `Planned to: ${tc.dueDate}` })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(tc => ({ id: tc.id, title: tc.title, status: `Planned to: ${tc.dueDate}` })) },
    { label: 'Performed', count: performed.length, color: 'purple', items: performed.map(tc => ({ id: tc.id, title: tc.title, status: `Planned to: ${tc.dueDate}` })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(tc => ({ id: tc.id, title: tc.title, status: `Planned to: ${tc.dueDate}` })) },
    { label: 'Defect', count: defect.length, color: 'red', items: defect.map(tc => ({ id: tc.id, title: tc.title, status: `Planned to: ${tc.dueDate}` })) },
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
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(i => ({ id: i.id, title: i.title, status: `Planned to: ${i.dueDate}` })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(i => ({ id: i.id, title: i.title, status: `Planned to: ${i.dueDate}` })) },
    { label: 'Resolved', count: resolved.length, color: 'teal', items: resolved.map(i => ({ id: i.id, title: i.title, status: `Planned to: ${i.dueDate}` })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(i => ({ id: i.id, title: i.title, status: `Planned to: ${i.dueDate}` })) },
  ];
}

function getSignOffSegments(req: Requirement): StatusSegment[] {
  const newItem = req.signOffs.filter(s => s.status === 'New');
  const active = req.signOffs.filter(s => s.status === 'Active');
  const approved = req.signOffs.filter(s => s.status === 'Approved');
  const rejected = req.signOffs.filter(s => s.status === 'Rejected');
  const completed = req.signOffs.filter(s => s.status === 'Completed');

  return [
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(s => ({ id: s.id, title: s.stakeholder, status: `Planned to: ${s.dueDate}` })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(s => ({ id: s.id, title: s.stakeholder, status: `Planned to: ${s.dueDate}` })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(s => ({ id: s.id, title: s.stakeholder, status: `Planned to: ${s.dueDate}` })) },
    { label: 'Rejected', count: rejected.length, color: 'red', items: rejected.map(s => ({ id: s.id, title: s.stakeholder, status: `Planned to: ${s.dueDate}` })) },
    { label: 'Completed', count: completed.length, color: 'teal', items: completed.map(s => ({ id: s.id, title: s.stakeholder, status: `Planned to: ${s.dueDate}` })) },
  ];
}

function getCTASegments(req: Requirement): StatusSegment[] {
  const newItem = req.ctas.filter(c => c.status === 'New');
  const active = req.ctas.filter(c => c.status === 'Active');
  const completed = req.ctas.filter(c => c.status === 'Completed');
  const pending = req.ctas.filter(c => c.status === 'Pending');

  return [
    { label: 'New', count: newItem.length, color: 'gray', items: newItem.map(c => ({ id: c.id, title: c.title, status: `Planned to: ${c.dueDate}` })) },
    { label: 'Active', count: active.length, color: 'blue', items: active.map(c => ({ id: c.id, title: c.title, status: `Planned to: ${c.dueDate}` })) },
    { label: 'Pending', count: pending.length, color: 'orange', items: pending.map(c => ({ id: c.id, title: c.title, status: `Planned to: ${c.dueDate}` })) },
    { label: 'Completed', count: completed.length, color: 'teal', items: completed.map(c => ({ id: c.id, title: c.title, status: `Planned to: ${c.dueDate}` })) },
  ];
}

function getMeetingSegments(req: Requirement): StatusSegment[] {
  const scheduled = req.meetings.filter(m => m.status === 'Scheduled');
  const completed = req.meetings.filter(m => m.status === 'Completed');
  const cancelled = req.meetings.filter(m => m.status === 'Cancelled');
  const pending = req.meetings.filter(m => m.status === 'Pending');

  return [
    { label: 'Scheduled', count: scheduled.length, color: 'blue', items: scheduled.map(m => ({ id: m.id, title: m.title, status: `Planned to: ${m.dueDate}` })) },
    { label: 'Pending', count: pending.length, color: 'orange', items: pending.map(m => ({ id: m.id, title: m.title, status: `Planned to: ${m.dueDate}` })) },
    { label: 'Completed', count: completed.length, color: 'teal', items: completed.map(m => ({ id: m.id, title: m.title, status: `Planned to: ${m.dueDate}` })) },
    { label: 'Cancelled', count: cancelled.length, color: 'red', items: cancelled.map(m => ({ id: m.id, title: m.title, status: `Planned to: ${m.dueDate}` })) },
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
    140, // CTA
    140, // Meetings
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
            {renderHeader("CTA", 10, "text-center min-w-[100px]")}
            {renderHeader("Meetings", 11, "text-center min-w-[100px]")}
          </tr>
        </thead>
        <tbody>
          {requirements.map((req) => {
            const taskSegments = getTaskSegments(req);
            const executionSegments = getExecutionSegments(req);
            const issueSegments = getIssueSegments(req);
            const signOffSegments = getSignOffSegments(req);
            const ctaSegments = getCTASegments(req);
            const meetingSegments = getMeetingSegments(req);

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

                {/* CTA - Status Bar */}
                <td className="px-3 py-2 border-b border-r border-border" style={{ width: colWidths[10] }}>
                  <div className="overflow-hidden">
                    <StatusBar
                      segments={ctaSegments}
                      total={req.ctas.length}
                      title="CTA"
                      onViewDetails={() => onRequirementClick(req, 'cta')}
                      reqId={req.reqId}
                      reqTitle={req.title}
                    />
                  </div>
                </td>

                {/* Meetings - Status Bar */}
                <td className="px-3 py-2 border-b border-border" style={{ width: colWidths[11] }}>
                  <div className="overflow-hidden">
                    <StatusBar
                      segments={meetingSegments}
                      total={req.meetings.length}
                      title="Meetings"
                      onViewDetails={() => onRequirementClick(req, 'meetings')}
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
