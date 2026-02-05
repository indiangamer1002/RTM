import { Task, TestCase, Issue, SignOff, Priority, TestStatus, IssueSeverity, SignOffStatus, Meeting } from '@/types/rtm';

export interface UnlinkedItem {
  id: string;
  title: string;
  type: 'Task' | 'TestCase' | 'Issue' | 'SignOff' | 'Meeting';
  priority: Priority;
  status: string; // Generic status string to cover all types
  assignee?: string;
  dueDate?: string;
  createdOn: string;
  description?: string;
}

export const mockUnlinkedItems: UnlinkedItem[] = [
  {
    id: 'orphan-tc-001',
    title: 'Verify Payment Gateway Timeout Handling',
    type: 'TestCase',
    priority: 'High',
    status: 'New',
    assignee: 'Mike Chen',
    dueDate: '2025-02-10',
    createdOn: '2025-01-25',
    description: 'Ensure system handles payment gateway timeouts gracefully without double charging.'
  },
  {
    id: 'orphan-task-012',
    title: 'Design Dark Mode Color Palette',
    type: 'Task',
    priority: 'Medium',
    status: 'Active',
    assignee: 'Sarah Johnson',
    dueDate: '2025-02-15',
    createdOn: '2025-01-28',
    description: 'Create a semantic color palette for dark mode support across the application.'
  },
  {
    id: 'orphan-issue-005',
    title: 'Login page misalignment on iPhone SE',
    type: 'Issue',
    priority: 'Low',
    status: 'Active',
    assignee: 'Sarah Johnson',
    dueDate: '2025-02-05',
    createdOn: '2025-01-30',
    description: 'CSS flexbox issue causing button overlap on small screens.'
  },
  {
    id: 'orphan-so-003',
    title: 'Security Audit Sign-off for Q1',
    type: 'SignOff',
    priority: 'High',
    status: 'Pending',
    assignee: 'Lisa Wilson',
    dueDate: '2025-02-20',
    createdOn: '2025-01-20',
    description: 'Quarterly security review approval required.'
  },
  {
    id: 'orphan-tc-002',
    title: 'Test Invoice PDF Generation with Special Characters',
    type: 'TestCase',
    priority: 'Medium',
    status: 'New',
    assignee: 'Mike Chen',
    dueDate: '2025-02-12',
    createdOn: '2025-01-26',
    description: 'Verify unicode characters are correctly rendered in generated invoice PDFs.'
  },
  {
    id: 'orphan-task-015',
    title: 'Optimize Database Indexing for Order History',
    type: 'Task',
    priority: 'High',
    status: 'New',
    assignee: 'Alex Kumar',
    dueDate: '2025-02-25',
    createdOn: '2025-01-29',
    description: 'Performance degradation observed in order history query. Needs index optimization.'
  },
  // New items that don't match existing requirements well
  {
    id: 'orphan-task-020',
    title: 'Implement Multi-language Support for Notifications',
    type: 'Task',
    priority: 'Medium',
    status: 'New',
    assignee: 'John Smith',
    dueDate: '2025-03-01',
    createdOn: '2025-02-01',
    description: 'Add i18n support for push notifications and email templates. Support English, German, French.'
  },
  {
    id: 'orphan-tc-005',
    title: 'Validate Accessibility Compliance WCAG 2.1',
    type: 'TestCase',
    priority: 'High',
    status: 'New',
    assignee: 'Emily Davis',
    dueDate: '2025-03-05',
    createdOn: '2025-02-02',
    description: 'Ensure all screens meet WCAG 2.1 AA standards for keyboard navigation and screen readers.'
  },
  {
    id: 'orphan-issue-010',
    title: 'Memory leak in real-time chat module',
    type: 'Issue',
    priority: 'High',
    status: 'Active',
    assignee: 'Alex Kumar',
    dueDate: '2025-02-15',
    createdOn: '2025-02-03',
    description: 'Browser memory usage increases over time when chat panel is open for extended periods.'
  },
  {
    id: 'orphan-task-025',
    title: 'Setup Automated Backup for Document Storage',
    type: 'Task',
    priority: 'High',
    status: 'New',
    assignee: 'Lisa Wilson',
    dueDate: '2025-02-28',
    createdOn: '2025-02-04',
    description: 'Configure daily incremental and weekly full backups for S3 document storage with 90-day retention.'
  },
  {
    id: 'orphan-so-007',
    title: 'GDPR Data Processing Agreement Review',
    type: 'SignOff',
    priority: 'High',
    status: 'Pending',
    assignee: 'Legal Team',
    dueDate: '2025-02-25',
    createdOn: '2025-02-01',
    description: 'Legal review and sign-off required for updated data processing agreement with third-party vendors.'
  }
];
