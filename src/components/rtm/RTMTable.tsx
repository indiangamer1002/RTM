import { useRef, useState, useEffect, useCallback } from 'react';
import { Requirement, Priority, RequirementStatus, RequirementType } from '@/types/rtm';
import { StatusBadge } from './StatusBadge';
import { StatusBar, StatusSegment } from './StatusBar';
import { RTMHoverCard } from './HoverCard';
import { cn } from '@/lib/utils';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RTMTableProps {
  requirements: Requirement[];
  onRequirementClick: (req: Requirement, tab?: string) => void;
  visibleColumns?: string[];
}

const priorityMap: Record<Priority, 'error' | 'warning' | 'success'> = {
  'High': 'error',
  'Medium': 'warning',
  'Low': 'success',
};

// Minimum widths for each column to ensure data visibility
const MIN_COLUMN_WIDTHS = [
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
    { label: 'Performed', count: performed.length, color: 'teal', items: performed.map(tc => ({ id: tc.id, title: tc.title, status: `Planned to: ${tc.dueDate}` })) },
    { label: 'Approved', count: approved.length, color: 'green', items: approved.map(tc => ({ id: tc.id, title: tc.title, status: `Planned to: ${tc.dueDate}` })) },
    { label: 'Defect', count: defect.length, color: 'purple', items: defect.map(tc => ({ id: tc.id, title: tc.title, status: `Planned to: ${tc.dueDate}` })) },
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
    { label: 'Approved', count: approved.length, color: 'teal', items: approved.map(s => ({ id: s.id, title: s.stakeholder, status: `Planned to: ${s.dueDate}` })) },
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

export function RTMTable({ requirements, onRequirementClick, visibleColumns = [
  "Req ID", "Req Title", "Type", "Source Owner", "Priority", "Status",
  "Task", "TESTCASES", "Issues", "Sign-offs", "CTA", "Meetings"
] }: RTMTableProps) {
  // Initial widths matching the minimums to prevent gaps
  const [colWidths, setColWidths] = useState<number[]>([...MIN_COLUMN_WIDTHS]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [activeFilterCol, setActiveFilterCol] = useState<number | null>(null);

  const filteredRequirements = requirements.filter(req => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const searchStr = value.toLowerCase();
      switch (key) {
        case 'Req ID': return req.reqId.toLowerCase().includes(searchStr);
        case 'Req Title': return req.title.toLowerCase().includes(searchStr) || req.sourceOwner.toLowerCase().includes(searchStr);
        case 'Type': return req.type.toLowerCase().includes(searchStr);
        case 'Source Owner': return req.sourceOwner.toLowerCase().includes(searchStr);
        case 'Priority': return req.priority.toLowerCase().includes(searchStr);
        case 'Status': return req.status.toLowerCase().includes(searchStr);
        default: return true;
      }
    });
  });

  const startResize = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = colWidths[index];
    const minWidth = MIN_COLUMN_WIDTHS[index];

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

  const renderHeader = (label: string, index: number, className: string = '') => {
    if (!visibleColumns.includes(label)) return null;
    return (
      <th
        className={cn("sticky top-0 z-20 bg-muted/90 backdrop-blur-sm border-b border-r border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500", className)}
        style={{ width: colWidths[index] }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between h-full overflow-hidden group">
            <span className="truncate">{label}</span>
            <button
              onClick={() => setActiveFilterCol(activeFilterCol === index ? null : index)}
              className={cn(
                "p-1 rounded hover:bg-slate-200 transition-colors",
                filters[label] ? "text-primary" : "text-slate-400 opacity-0 group-hover:opacity-100"
              )}
            >
              <Filter className="h-3 w-3" />
            </button>
          </div>
          {activeFilterCol === index && (
            <div className="relative">
              <Input
                autoFocus
                value={filters[label] || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, [label]: e.target.value }))}
                placeholder={`Filter ${label}...`}
                className="h-7 text-[10px] px-2 py-1 bg-white border-slate-200 focus:ring-1 focus:ring-primary/20"
              />
              {filters[label] && (
                <button
                  onClick={() => setFilters(prev => {
                    const next = { ...prev };
                    delete next[label];
                    return next;
                  })}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="h-2.5 w-2.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
          )}
        </div>
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border hover:bg-primary/50 transition-colors"
          onMouseDown={startResize(index)}
        />
      </th>
    );
  };

  return (
    <div className="h-full w-full overflow-auto custom-scrollbar bg-background">
      <table className="w-full border-collapse bg-background table-fixed border-spacing-0">
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
            {renderHeader("CTA", 10, "text-center min-w-[100px]")}
            {renderHeader("Meetings", 11, "text-center min-w-[100px]")}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredRequirements.map((req) => {
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
                {visibleColumns.includes("Req ID") && (
                  <td className="px-4 py-2 border-b border-r border-border truncate" style={{ width: colWidths[0] }}>
                    <span
                      className="text-foreground font-medium text-xs whitespace-nowrap hover:underline cursor-pointer"
                      onClick={() => onRequirementClick(req)}
                    >
                      {req.reqId}
                    </span>
                  </td>
                )}

                {visibleColumns.includes("Req Title") && (
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
                )}

                {visibleColumns.includes("Type") && (
                  <td className="px-4 py-2 border-b border-r border-border truncate text-center" style={{ width: colWidths[2] }}>
                    <div className="flex justify-center">
                      <StatusBadge label={req.type} type={typeMap[req.type]} />
                    </div>
                  </td>
                )}

                {visibleColumns.includes("Source Owner") && (
                  <td className="px-4 py-2 border-b border-r border-border text-sm truncate" style={{ width: colWidths[3] }}>
                    {req.sourceOwner}
                  </td>
                )}

                {visibleColumns.includes("Priority") && (
                  <td className="px-4 py-2 border-b border-r border-border text-center truncate" style={{ width: colWidths[4] }}>
                    <div className="flex justify-center">
                      <StatusBadge label={req.priority} type={priorityMap[req.priority]} />
                    </div>
                  </td>
                )}

                {visibleColumns.includes("Status") && (
                  <td className="px-4 py-2 border-b border-r border-border text-center truncate" style={{ width: colWidths[5] }}>
                    <div className="flex justify-center">
                      <StatusBadge label={req.status} type={statusMap[req.status]} />
                    </div>
                  </td>
                )}

                {visibleColumns.includes("Task") && (
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
                )}

                {visibleColumns.includes("TESTCASES") && (
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
                )}

                {visibleColumns.includes("Issues") && (
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
                )}

                {visibleColumns.includes("Sign-offs") && (
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
                )}

                {visibleColumns.includes("CTA") && (
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
                )}

                {visibleColumns.includes("Meetings") && (
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
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
