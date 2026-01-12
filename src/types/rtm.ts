// RTM Type Definitions

export type Priority = 'High' | 'Medium' | 'Low';
export type RequirementStatus = 'New' | 'Active' | 'Completed' | 'Approved';
export type RequirementType = 'Business' | 'Functional' | 'Technical';
export type TestStatus = 'New' | 'Active' | 'performed' | 'approved' | 'Defect found';
export type ExecutionResult = 'Pass' | 'Fail' | 'Blocked' | 'Not Run';
export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type SignOffStatus = 'New' | 'Active' | 'Approved' | 'Rejected' | 'Completed';
export type CTAStatus = 'New' | 'Active' | 'Completed' | 'Pending';
export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';

export interface NavigationNode {
  id: string;
  name: string;
  type: 'project' | 'scope' | 'process' | 'requirement';
  children?: NavigationNode[];
  status?: 'in-scope' | 'out-of-scope';
}

export interface Task {
  id: string;
  title: string;
  status: 'New' | 'Active' | 'Completed' | 'Approved';
  assignee: string;
  dueDate: string;
  priority: Priority;
}

export interface TestCase {
  id: string;
  title: string;
  status: TestStatus;
  executionResult?: ExecutionResult;
  lastRun?: string;
  tester?: string;
  assignee: string;
  dueDate: string;
  priority: Priority;
}

export interface Issue {
  id: string;
  title: string;
  severity: IssueSeverity;
  status: 'New' | 'Active' | 'Resolved' | 'Approved';
  assignee: string;
  dueDate: string;
  priority: Priority;
}

export interface SignOff {
  id: string;
  role: string;
  stakeholder: string;
  status: SignOffStatus;
  date?: string;
  dueDate: string;
  priority: Priority;
}

export interface CTA {
  id: string;
  title: string;
  status: CTAStatus;
  assignee: string;
  dueDate: string;
  priority: Priority;
}

export interface Meeting {
  id: string;
  title: string;
  status: MeetingStatus;
  organizer: string;
  attendees: string[];
  date: string;
  dueDate: string; // Used for "Planned to" consistency
  priority: Priority;
}

export interface AuditEntry {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: 'BA' | 'Dev' | 'QA' | 'Business' | 'PM';
  avatar?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Requirement {
  id: string;
  reqId: string;
  title: string;
  description: string;
  type: RequirementType;
  sourceOwner: string;
  priority: Priority;
  status: RequirementStatus;
  scopeId: string;
  scope: string;
  processId: string;
  businessProcess: string;
  dueDate?: string;
  approver: string;

  // New filter fields
  lifecyclePhase: 'identify' | 'analyze' | 'document' | 'approve' | 'design' | 'build' | 'test' | 'release' | 'support';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'deferred' | 'baseline';
  solutionType: 'configuration' | 'custom-dev' | 'enhancement' | 'integration' | 'workflow';
  traceabilityStatus: 'fully-traced' | 'partially-traced' | 'missing-design' | 'missing-build' | 'missing-test' | 'missing-release';
  releaseVersion: 'rel-1.0' | 'rel-1.1' | 'hotfix' | 'future' | 'not-released';
  owner: 'business' | 'product' | 'functional' | 'technical' | 'qa';
  complianceCategory: 'sox' | 'gdpr' | 'iso' | 'internal-policy' | 'customer-contract' | 'not-applicable';
  riskLevel: 'high' | 'medium' | 'low' | 'none';
  changeImpact: 'changed-after-approval' | 'has-open-cr' | 'versioned' | 'retired' | 'none';
  stageStatus: 'not-started' | 'in-progress' | 'blocked' | 'completed' | 'failed' | 'deferred';
  sprintCycle: 'sprint-1' | 'sprint-2' | 'sprint-3' | 'backlog' | 'unassigned';
  tags: string[];

  // Traceability links
  tasks: Task[];
  testCases: TestCase[];
  issues: Issue[];
  signOffs: SignOff[];
  ctas: CTA[];
  meetings: Meeting[];

  // Resources
  documents: Document[];
  stakeholders: Stakeholder[];

  // Audit
  auditHistory: AuditEntry[];

  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  lastUpdatedBy: string;
}

export interface FilterState {
  release: string;
  businessGroup: string;
  status: string;
  owner: string;
  view: 'Admin View' | 'Tester View' | 'Business View';
}
