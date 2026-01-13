import { useState, useEffect } from 'react';
import { X, FileText, ClipboardList, TestTube, Bug, CheckSquare, History, Users, Calendar, Flag, ArrowLeft, ChevronDown, Check } from 'lucide-react';
import { Requirement, Task, TestCase, Issue, SignOff, AuditEntry, Stakeholder, CTA, Meeting } from '@/types/rtm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from './StatusBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { requirementsData } from '@/data/mockData';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DetailPanelProps {
  requirement: Requirement | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  onRequirementChange?: (req: Requirement) => void;
}


function OverviewTab({ requirement }: { requirement: Requirement }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-1">Description</h3>
        <p className="text-sm text-foreground leading-snug line-clamp-3">{requirement.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Type</h4>
          <StatusBadge label={requirement.type} type={requirement.type === 'Business' ? 'info' : requirement.type === 'Functional' ? 'warning' : 'neutral'} />
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Priority</h4>
          <StatusBadge label={requirement.priority} type={requirement.priority === 'High' ? 'error' : requirement.priority === 'Medium' ? 'warning' : 'success'} />
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</h4>
          <StatusBadge label={requirement.status} type={requirement.status === 'Completed' || requirement.status === 'Approved' ? 'success' : requirement.status === 'Active' ? 'info' : 'neutral'} />
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Owner</h4>
          <span className="text-xs text-foreground font-medium">{requirement.sourceOwner}</span>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Scope</h4>
          <span className="text-xs text-foreground font-medium">{requirement.scope}</span>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Process</h4>
          <span className="text-xs text-foreground font-medium">{requirement.businessProcess}</span>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Approver</h4>
          <span className="text-xs text-foreground font-medium">{requirement.approver}</span>
        </div>
        <div>
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Planned to</h4>
          <span className="text-xs text-foreground font-medium">{requirement.dueDate || '-'}</span>
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Stakeholders</h4>
        <div className="flex flex-wrap gap-1.5">
          {requirement.stakeholders.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 bg-muted/50 rounded-full px-2 py-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
                  {s.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-medium">{s.name}</span>
              <span className="text-[9px] text-muted-foreground">({s.role})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border mt-auto">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Created: {requirement.createdAt} by {requirement.createdBy}</span>
          <span>Updated: {requirement.updatedAt} by {requirement.lastUpdatedBy}</span>
        </div>
      </div>
    </div>
  );
}

// ... TasksTab, TestCasesTab, IssuesTab, SignOffsTab, CTATab, MeetingsTab, AuditHistoryTab ...

// I need to be careful with the context matching for DetailPanel's return as lines are skipped in the example but need to match the file.
// The next chunk will target DetailPanel's render.


function TasksTab({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No tasks linked to this requirement</p>
        <Button variant="outline" size="sm" className="mt-4">Add Task</Button>
      </div>
    );
  }

  const newItem = tasks.filter(t => t.status === 'New').length;
  const active = tasks.filter(t => t.status === 'Active').length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const approved = tasks.filter(t => t.status === 'Approved').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#6c8893]/10 dark:bg-[#6c8893]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6c8893] dark:text-[#6c8893]">{newItem}</p>
          <p className="text-xs text-[#6c8893] dark:text-[#6c8893]">New</p>
        </div>
        <div className="p-3 bg-[#5899da]/10 dark:bg-[#5899da]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#5899da] dark:text-[#5899da]">{active}</p>
          <p className="text-xs text-[#5899da] dark:text-[#5899da]">Active</p>
        </div>
        <div className="p-3 bg-[#51aa7a]/10 dark:bg-[#51aa7a]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#51aa7a] dark:text-[#51aa7a]">{completed}</p>
          <p className="text-xs text-[#51aa7a] dark:text-[#51aa7a]">Completed</p>
        </div>
        <div className="p-3 bg-[#945ecf]/10 dark:bg-[#945ecf]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#945ecf] dark:text-[#945ecf]">{approved}</p>
          <p className="text-xs text-[#945ecf] dark:text-[#945ecf]">Approved</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={task.priority}
                    type={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'neutral'}
                  />
                  <h4 className="text-sm font-medium text-foreground truncate">{task.title}</h4>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Assigned to: {task.assignee}</span>
                  <span>Planned to: {task.dueDate}</span>
                </div>
              </div>
              <StatusBadge
                label={task.status}
                type={task.status === 'Completed' ? 'teal' : task.status === 'Approved' ? 'success' : task.status === 'Active' ? 'info' : 'neutral'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestCasesTab({ testCases }: { testCases: TestCase[] }) {
  if (testCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TestTube className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No test cases linked to this requirement</p>
        <Button variant="outline" size="sm" className="mt-4">Add Test Case</Button>
      </div>
    );
  }

  const newItem = testCases.filter(tc => tc.status === 'New').length;
  const active = testCases.filter(tc => tc.status === 'Active').length;
  const performed = testCases.filter(tc => tc.status === 'performed').length;
  const approved = testCases.filter(tc => tc.status === 'approved').length;
  const defectFound = testCases.filter(tc => tc.status === 'Defect found').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        <div className="p-3 bg-[#6c8893]/10 dark:bg-[#6c8893]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6c8893] dark:text-[#6c8893]">{newItem}</p>
          <p className="text-xs text-[#6c8893] dark:text-[#6c8893]">New</p>
        </div>
        <div className="p-3 bg-[#5899da]/10 dark:bg-[#5899da]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#5899da] dark:text-[#5899da]">{active}</p>
          <p className="text-xs text-[#5899da] dark:text-[#5899da]">Active</p>
        </div>
        <div className="p-3 bg-[#51aa7a]/10 dark:bg-[#51aa7a]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#51aa7a] dark:text-[#51aa7a]">{performed}</p>
          <p className="text-xs text-[#51aa7a] dark:text-[#51aa7a]">Performed</p>
        </div>
        <div className="p-3 bg-[#945ecf]/10 dark:bg-[#945ecf]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#945ecf] dark:text-[#945ecf]">{approved}</p>
          <p className="text-xs text-[#945ecf] dark:text-[#945ecf]">Approved</p>
        </div>
        <div className="p-3 bg-[#808080]/10 dark:bg-[#808080]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#808080] dark:text-[#808080]">{defectFound}</p>
          <p className="text-xs text-[#808080] dark:text-[#808080]">Defect</p>
        </div>
      </div>

      <div className="space-y-3">
        {testCases.map((tc) => (
          <div key={tc.id} className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={tc.priority}
                    type={tc.priority === 'High' ? 'error' : tc.priority === 'Medium' ? 'warning' : 'neutral'}
                  />
                  <h4 className="text-sm font-medium text-foreground truncate">{tc.title}</h4>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Assigned to: {tc.assignee}</span>
                  <span>Planned to: {tc.dueDate}</span>
                </div>
              </div>
              <StatusBadge
                label={tc.status}
                type={tc.status === 'approved' ? 'success' : tc.status === 'Defect found' ? 'purple' : tc.status === 'performed' ? 'teal' : tc.status === 'Active' ? 'info' : 'neutral'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssuesTab({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bug className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No issues linked to this requirement</p>
        <Button variant="outline" size="sm" className="mt-4">Report Issue</Button>
      </div>
    );
  }

  const newItem = issues.filter(i => i.status === 'New').length;
  const active = issues.filter(i => i.status === 'Active').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const approved = issues.filter(i => i.status === 'Approved').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#6c8893]/10 dark:bg-[#6c8893]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6c8893] dark:text-[#6c8893]">{newItem}</p>
          <p className="text-xs text-[#6c8893] dark:text-[#6c8893]">New</p>
        </div>
        <div className="p-3 bg-[#5899da]/10 dark:bg-[#5899da]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#5899da] dark:text-[#5899da]">{active}</p>
          <p className="text-xs text-[#5899da] dark:text-[#5899da]">Active</p>
        </div>
        <div className="p-3 bg-[#51aa7a]/10 dark:bg-[#51aa7a]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#51aa7a] dark:text-[#51aa7a]">{resolved}</p>
          <p className="text-xs text-[#51aa7a] dark:text-[#51aa7a]">Resolved</p>
        </div>
        <div className="p-3 bg-[#945ecf]/10 dark:bg-[#945ecf]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#945ecf] dark:text-[#945ecf]">{approved}</p>
          <p className="text-xs text-[#945ecf] dark:text-[#945ecf]">Approved</p>
        </div>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <div key={issue.id} className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={issue.severity}
                    type={issue.severity === 'Critical' || issue.severity === 'High' ? 'error' : issue.severity === 'Medium' ? 'warning' : 'neutral'}
                  />
                  <h4 className="text-sm font-medium text-foreground truncate">{issue.title}</h4>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Assigned to: {issue.assignee}</span>
                  <span>Planned to: {issue.dueDate}</span>
                </div>
              </div>
              <StatusBadge
                label={issue.status}
                type={issue.status === 'Resolved' ? 'teal' : issue.status === 'Approved' ? 'success' : issue.status === 'Active' ? 'info' : 'neutral'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignOffsTab({ signOffs }: { signOffs: SignOff[] }) {
  if (signOffs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No sign-offs configured</p>
        <Button variant="outline" size="sm" className="mt-4">Add Sign-off</Button>
      </div>
    );
  }

  const newItem = signOffs.filter(s => s.status === 'New').length;
  const active = signOffs.filter(s => s.status === 'Active').length;
  const approved = signOffs.filter(s => s.status === 'Approved').length;
  const rejected = signOffs.filter(s => s.status === 'Rejected').length;
  const completed = signOffs.filter(s => s.status === 'Completed').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        <div className="p-3 bg-[#6c8893]/10 dark:bg-[#6c8893]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6c8893] dark:text-[#6c8893]">{newItem}</p>
          <p className="text-xs text-[#6c8893] dark:text-[#6c8893]">New</p>
        </div>
        <div className="p-3 bg-[#5899da]/10 dark:bg-[#5899da]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#5899da] dark:text-[#5899da]">{active}</p>
          <p className="text-xs text-[#5899da] dark:text-[#5899da]">Active</p>
        </div>
        <div className="p-3 bg-[#51aa7a]/10 dark:bg-[#51aa7a]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#51aa7a] dark:text-[#51aa7a]">{approved}</p>
          <p className="text-xs text-[#51aa7a] dark:text-[#51aa7a]">Approved</p>
        </div>
        <div className="p-3 bg-[#E74C3C]/10 dark:bg-[#E74C3C]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#E74C3C] dark:text-[#E74C3C]">{rejected}</p>
          <p className="text-xs text-[#E74C3C] dark:text-[#E74C3C]">Rejected</p>
        </div>
        <div className="p-3 bg-[#51aa7a]/10 dark:bg-[#51aa7a]/20 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#51aa7a] dark:text-[#51aa7a]">{completed}</p>
          <p className="text-xs text-[#51aa7a] dark:text-[#51aa7a]">Completed</p>
        </div>
      </div>

      <div className="space-y-3">
        {signOffs.map((signOff) => (
          <div key={signOff.id} className="p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={signOff.priority}
                    type={signOff.priority === 'High' ? 'error' : signOff.priority === 'Medium' ? 'warning' : 'neutral'}
                  />
                  <h4 className="text-sm font-medium text-foreground">{signOff.role}</h4>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Assigned to: {signOff.stakeholder}</span>
                  <span>Planned to: {signOff.dueDate}</span>
                </div>
              </div>
              <StatusBadge
                label={signOff.status}
                type={signOff.status === 'Approved' ? 'teal' : signOff.status === 'Completed' ? 'teal' : signOff.status === 'Rejected' ? 'error' : signOff.status === 'Active' ? 'info' : 'neutral'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTATab({ ctas }: { ctas: CTA[] }) {
  if (ctas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Flag className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No CTAs linked to this requirement</p>
        <Button variant="outline" size="sm" className="mt-4">Add CTA</Button>
      </div>
    );
  }

  const newItem = ctas.filter(c => c.status === 'New').length;
  const active = ctas.filter(c => c.status === 'Active').length;
  const completed = ctas.filter(c => c.status === 'Completed').length;
  const pending = ctas.filter(c => c.status === 'Pending').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{newItem}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">New</p>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{active}</p>
          <p className="text-xs text-blue-600 dark:text-blue-500">Active</p>
        </div>
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{pending}</p>
          <p className="text-xs text-orange-600 dark:text-orange-500">Pending</p>
        </div>
        <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-center">
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{completed}</p>
          <p className="text-xs text-teal-600 dark:text-teal-500">Completed</p>
        </div>
      </div>

      <div className="space-y-3">
        {ctas.map((cta) => (
          <div key={cta.id} className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={cta.priority}
                    type={cta.priority === 'High' ? 'error' : cta.priority === 'Medium' ? 'warning' : 'neutral'}
                  />
                  <h4 className="text-sm font-medium text-foreground truncate">{cta.title}</h4>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Assigned to: {cta.assignee}</span>
                  <span>Planned to: {cta.dueDate}</span>
                </div>
              </div>
              <StatusBadge
                label={cta.status}
                type={cta.status === 'Completed' ? 'teal' : cta.status === 'Active' ? 'info' : cta.status === 'Pending' ? 'orange' : 'neutral'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeetingsTab({ meetings }: { meetings: Meeting[] }) {
  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No meetings linked to this requirement</p>
        <Button variant="outline" size="sm" className="mt-4">Schedule Meeting</Button>
      </div>
    );
  }

  const scheduled = meetings.filter(m => m.status === 'Scheduled').length;
  const completed = meetings.filter(m => m.status === 'Completed').length;
  const cancelled = meetings.filter(m => m.status === 'Cancelled').length;
  const pending = meetings.filter(m => m.status === 'Pending').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{scheduled}</p>
          <p className="text-xs text-blue-600 dark:text-blue-500">Scheduled</p>
        </div>
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{pending}</p>
          <p className="text-xs text-orange-600 dark:text-orange-500">Pending</p>
        </div>
        <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-center">
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{completed}</p>
          <p className="text-xs text-teal-600 dark:text-teal-500">Completed</p>
        </div>
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{cancelled}</p>
          <p className="text-xs text-red-600 dark:text-red-500">Cancelled</p>
        </div>
      </div>

      <div className="space-y-3">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={meeting.priority}
                    type={meeting.priority === 'High' ? 'error' : meeting.priority === 'Medium' ? 'warning' : 'neutral'}
                  />
                  <h4 className="text-sm font-medium text-foreground truncate">{meeting.title}</h4>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Organizer: {meeting.organizer}</span>
                  <span>Date: {meeting.date}</span>
                  <span>Planned to: {meeting.dueDate}</span>
                </div>
              </div>
              <StatusBadge
                label={meeting.status}
                type={meeting.status === 'Completed' ? 'teal' : meeting.status === 'Scheduled' ? 'info' : meeting.status === 'Pending' ? 'orange' : 'error'}
              />
            </div>
            <div className="mt-2 pl-2 border-l-2 border-primary/20">
              <p className="text-xs text-muted-foreground">Attendees: {meeting.attendees.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export function DetailPanel({ requirement, isOpen, onClose, initialTab = 'overview', onRequirementChange }: DetailPanelProps) {
  const [reqDropdownOpen, setReqDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'overview');
    }
  }, [isOpen, initialTab, requirement?.id]);

  if (!requirement) return null;

  return (
    <>
      {/* Backdrop overlay - dims the rest of the screen */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Mobile: Full-screen overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background z-50 transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Navigable Req ID Dropdown */}
            <Popover open={reqDropdownOpen} onOpenChange={setReqDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={reqDropdownOpen}
                  className="h-8 px-2 font-mono text-sm hover:bg-muted flex-shrink-0"
                >
                  {requirement.reqId}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search requirements..." className="h-9" />
                  <CommandEmpty>No requirement found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {requirementsData.map((req) => (
                      <CommandItem
                        key={req.id}
                        value={`${req.reqId} ${req.title}`}
                        onSelect={() => {
                          if (onRequirementChange) {
                            onRequirementChange(req);
                          }
                          setReqDropdownOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            requirement.id === req.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-mono text-xs">{req.reqId}</span>
                          <span className="text-xs text-muted-foreground truncate">{req.title}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <h2 className="text-sm font-medium text-foreground truncate">{requirement.title}</h2>
          </div>

          {/* Close button - X visible on both mobile and desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Accent bar */}
        <div className="accent-bar" />

        {/* Content */}
        <ScrollArea className="h-[calc(100%-60px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6 py-4 border-b border-border bg-background">
              <span className="text-xs font-mono text-muted-foreground block">{requirement.reqId}</span>
              <h2 className="text-lg font-semibold text-foreground leading-tight">{requirement.title}</h2>
            </div>
            <TabsList className="w-full flex rounded-none border-b border-border bg-transparent h-auto p-0 overflow-x-auto scrollbar-hide gap-1">
              <TabsTrigger
                value="overview"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Tasks</span> ({requirement.tasks.length})
              </TabsTrigger>
              <TabsTrigger
                value="test-cases"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <TestTube className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Tests</span> ({requirement.testCases.length})
              </TabsTrigger>
              <TabsTrigger
                value="issues"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <Bug className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Issues</span> ({requirement.issues.length})
              </TabsTrigger>
              <TabsTrigger
                value="signoffs"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Sign-offs</span> ({requirement.signOffs.length})
              </TabsTrigger>

              <TabsTrigger
                value="cta"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <Flag className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">CTA</span> ({requirement.ctas?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="meetings"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Meetings</span> ({requirement.meetings?.length || 0})
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab requirement={requirement} />
              </TabsContent>
              <TabsContent value="tasks" className="mt-0">
                <TasksTab tasks={requirement.tasks} />
              </TabsContent>
              <TabsContent value="test-cases" className="mt-0">
                <TestCasesTab testCases={requirement.testCases} />
              </TabsContent>
              <TabsContent value="issues" className="mt-0">
                <IssuesTab issues={requirement.issues} />
              </TabsContent>
              <TabsContent value="signoffs" className="mt-0">
                <SignOffsTab signOffs={requirement.signOffs} />
              </TabsContent>
              <TabsContent value="cta" className="mt-0">
                <CTATab ctas={requirement.ctas || []} />
              </TabsContent>
              <TabsContent value="meetings" className="mt-0">
                <MeetingsTab meetings={requirement.meetings || []} />
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Desktop: Side Panel */}
      <div
        className={cn(
          'fixed bg-background z-50 shadow-panel transform transition-transform duration-300 ease-out hidden md:block',
          'right-0 top-0 h-full w-[800px] max-w-[95vw]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Navigable Req ID Dropdown */}
            <Popover open={reqDropdownOpen} onOpenChange={setReqDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={reqDropdownOpen}
                  className="h-8 px-2 font-mono text-sm hover:bg-muted flex-shrink-0"
                >
                  {requirement.reqId}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search requirements..." className="h-9" />
                  <CommandEmpty>No requirement found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {requirementsData.map((req) => (
                      <CommandItem
                        key={req.id}
                        value={`${req.reqId} ${req.title}`}
                        onSelect={() => {
                          if (onRequirementChange) {
                            onRequirementChange(req);
                          }
                          setReqDropdownOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            requirement.id === req.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-mono text-xs">{req.reqId}</span>
                          <span className="text-xs text-muted-foreground truncate">{req.title}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <h2 className="text-sm font-medium text-foreground truncate">{requirement.title}</h2>
          </div>

          {/* Close button - X visible and prominent */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Accent bar */}
        <div className="accent-bar" />

        {/* Content */}
        <ScrollArea className="h-[calc(100%-60px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6 py-4 border-b border-border bg-background">
              <span className="text-xs font-mono text-muted-foreground block">{requirement.reqId}</span>
              <h2 className="text-lg font-semibold text-foreground leading-tight">{requirement.title}</h2>
            </div>
            <TabsList className="w-full flex rounded-none border-b border-border bg-transparent h-auto p-0 overflow-x-auto scrollbar-hide gap-1">
              <TabsTrigger
                value="overview"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Tasks</span> ({requirement.tasks.length})
              </TabsTrigger>
              <TabsTrigger
                value="test-cases"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <TestTube className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Tests</span> ({requirement.testCases.length})
              </TabsTrigger>
              <TabsTrigger
                value="issues"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <Bug className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Issues</span> ({requirement.issues.length})
              </TabsTrigger>
              <TabsTrigger
                value="signoffs"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Sign-offs</span> ({requirement.signOffs.length})
              </TabsTrigger>

              <TabsTrigger
                value="cta"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <Flag className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">CTA</span> ({requirement.ctas?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="meetings"
                className="flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-4 py-3 text-xs touch-target"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Meetings</span> ({requirement.meetings?.length || 0})
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab requirement={requirement} />
              </TabsContent>
              <TabsContent value="tasks" className="mt-0">
                <TasksTab tasks={requirement.tasks} />
              </TabsContent>
              <TabsContent value="test-cases" className="mt-0">
                <TestCasesTab testCases={requirement.testCases} />
              </TabsContent>
              <TabsContent value="issues" className="mt-0">
                <IssuesTab issues={requirement.issues} />
              </TabsContent>
              <TabsContent value="signoffs" className="mt-0">
                <SignOffsTab signOffs={requirement.signOffs} />
              </TabsContent>
              <TabsContent value="cta" className="mt-0">
                <CTATab ctas={requirement.ctas || []} />
              </TabsContent>
              <TabsContent value="meetings" className="mt-0">
                <MeetingsTab meetings={requirement.meetings || []} />
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </div>
    </>
  );
}
