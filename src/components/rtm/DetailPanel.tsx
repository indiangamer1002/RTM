import { useState, useEffect } from 'react';
import { X, FileText, ClipboardList, TestTube, Bug, CheckSquare, History, Users } from 'lucide-react';
import { Requirement, Task, TestCase, Issue, SignOff, AuditEntry, Stakeholder } from '@/types/rtm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface DetailPanelProps {
  requirement: Requirement | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

function OverviewTab({ requirement }: { requirement: Requirement }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
        <p className="text-sm text-foreground leading-relaxed">{requirement.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Type</h4>
          <StatusBadge label={requirement.type} type={requirement.type === 'Business' ? 'info' : requirement.type === 'Functional' ? 'warning' : 'neutral'} />
        </div>
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Priority</h4>
          <StatusBadge label={requirement.priority} type={requirement.priority === 'High' ? 'error' : requirement.priority === 'Medium' ? 'warning' : 'success'} />
        </div>
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Status</h4>
          <StatusBadge label={requirement.status} type={requirement.status === 'Completed' || requirement.status === 'Approved' ? 'success' : requirement.status === 'Active' ? 'info' : 'neutral'} />
        </div>
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Owner</h4>
          <span className="text-sm text-foreground">{requirement.sourceOwner}</span>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Stakeholders</h4>
        <div className="flex flex-wrap gap-2">
          {requirement.stakeholders.map((s) => (
            <div key={s.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
                  {s.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{s.name}</span>
              <span className="text-[10px] text-muted-foreground">({s.role})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created: {requirement.createdAt}</span>
          <span>Last updated: {requirement.updatedAt} by {requirement.lastUpdatedBy}</span>
        </div>
      </div>
    </div>
  );
}

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

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const open = tasks.filter(t => t.status === 'Open').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-status-success-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-success">{completed}</p>
          <p className="text-xs text-status-success">Completed</p>
        </div>
        <div className="p-3 bg-status-info-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-info">{inProgress}</p>
          <p className="text-xs text-status-info">In Progress</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-muted-foreground">{open}</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">{task.title}</h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Assignee: {task.assignee}</span>
                  <span>Due: {task.dueDate}</span>
                </div>
              </div>
              <StatusBadge
                label={task.status}
                type={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'info' : 'neutral'}
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

  const pass = testCases.filter(tc => tc.executionResult === 'Pass').length;
  const fail = testCases.filter(tc => tc.executionResult === 'Fail').length;
  const blocked = testCases.filter(tc => tc.executionResult === 'Blocked').length;
  const notRun = testCases.filter(tc => !tc.executionResult || tc.executionResult === 'Not Run').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-status-success-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-success">{pass}</p>
          <p className="text-xs text-status-success">Passed</p>
        </div>
        <div className="p-3 bg-status-error-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-error">{fail}</p>
          <p className="text-xs text-status-error">Failed</p>
        </div>
        <div className="p-3 bg-status-warning-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-warning">{blocked}</p>
          <p className="text-xs text-status-warning">Blocked</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-muted-foreground">{notRun}</p>
          <p className="text-xs text-muted-foreground">Not Run</p>
        </div>
      </div>

      <div className="space-y-3">
        {testCases.map((tc) => (
          <div key={tc.id} className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">{tc.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {tc.lastRun ? `Last run: ${tc.lastRun} by ${tc.tester}` : `Status: ${tc.status || 'Not Started'}`}
                </p>
              </div>
              <StatusBadge
                label={tc.executionResult || 'Not Run'}
                type={tc.executionResult === 'Pass' ? 'success' : tc.executionResult === 'Fail' ? 'error' : tc.executionResult === 'Blocked' ? 'warning' : 'neutral'}
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

  const critical = issues.filter(i => i.severity === 'Critical' || i.severity === 'High').length;
  const medium = issues.filter(i => i.severity === 'Medium').length;
  const low = issues.filter(i => i.severity === 'Low').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-status-error-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-error">{critical}</p>
          <p className="text-xs text-status-error">Critical/High</p>
        </div>
        <div className="p-3 bg-status-info-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-info">{medium}</p>
          <p className="text-xs text-status-info">Medium</p>
        </div>
        <div className="p-3 bg-status-success-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-success">{low}</p>
          <p className="text-xs text-status-success">Low</p>
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
                <p className="text-xs text-muted-foreground mt-2">Assignee: {issue.assignee}</p>
              </div>
              <StatusBadge
                label={issue.status}
                type={issue.status === 'Resolved' || issue.status === 'Closed' ? 'success' : issue.status === 'In Progress' ? 'info' : 'warning'}
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

  const approved = signOffs.filter(s => s.status === 'Approved').length;
  const pending = signOffs.filter(s => s.status === 'Pending').length;
  const rejected = signOffs.filter(s => s.status === 'Rejected').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-status-success-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-success">{approved}</p>
          <p className="text-xs text-status-success">Approved</p>
        </div>
        <div className="p-3 bg-status-info-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-info">{pending}</p>
          <p className="text-xs text-status-info">Pending</p>
        </div>
        <div className="p-3 bg-status-error-light rounded-lg text-center">
          <p className="text-2xl font-bold text-status-error">{rejected}</p>
          <p className="text-xs text-status-error">Rejected</p>
        </div>
      </div>

      <div className="space-y-3">
        {signOffs.map((signOff) => (
          <div key={signOff.id} className="p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">{signOff.role}</h4>
                <p className="text-xs text-muted-foreground mt-1">{signOff.stakeholder}</p>
                {signOff.date && <p className="text-xs text-muted-foreground">Signed: {signOff.date}</p>}
              </div>
              <StatusBadge
                label={signOff.status}
                type={signOff.status === 'Approved' ? 'success' : signOff.status === 'Pending' ? 'warning' : 'error'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditHistoryTab({ auditHistory }: { auditHistory: AuditEntry[] }) {
  if (auditHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No audit history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {auditHistory.map((entry) => (
        <div key={entry.id} className="p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{entry.changedBy}</span>
                {' changed '}
                <span className="font-medium">{entry.field}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="line-through">{entry.oldValue}</span>
                {' → '}
                <span className="font-medium text-foreground">{entry.newValue}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{entry.changedAt}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailPanel({ requirement, isOpen, onClose, initialTab = 'overview' }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'overview');
    }
  }, [isOpen, initialTab, requirement?.id]);

  if (!requirement) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-foreground/20 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-[800px] max-w-[95vw] bg-background z-50 shadow-panel',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-mono text-foreground">{requirement.reqId}</span>
            <h2 className="text-sm font-medium text-foreground truncate">{requirement.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Accent bar */}
        <div className="accent-bar" />

        {/* Content */}
        <ScrollArea className="h-[calc(100%-60px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="w-full flex rounded-none border-b border-border bg-transparent h-auto p-0">
              <TabsTrigger
                value="overview"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-3 text-xs"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-3 text-xs"
              >
                <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
                Tasks ({requirement.tasks.length})
              </TabsTrigger>
              <TabsTrigger
                value="test-cases"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-3 text-xs"
              >
                <TestTube className="h-3.5 w-3.5 mr-1.5" />
                Test Cases ({requirement.testCases.length})
              </TabsTrigger>
              <TabsTrigger
                value="issues"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-3 text-xs"
              >
                <Bug className="h-3.5 w-3.5 mr-1.5" />
                Issues ({requirement.issues.length})
              </TabsTrigger>
              <TabsTrigger
                value="signoffs"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-3 text-xs"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                Sign-offs
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 py-3 text-xs"
              >
                <History className="h-3.5 w-3.5 mr-1.5" />
                Audit
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
              <TabsContent value="audit" className="mt-0">
                <AuditHistoryTab auditHistory={requirement.auditHistory} />
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </div>
    </>
  );
}
