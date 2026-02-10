import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink,
  Plus,
  GitBranch,
  Target,
  FileText,
  Code,
  TestTube,
  Bug,
  Rocket,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinksTabProps {
  requirementId: string;
}

interface LinkItem {
  id: string;
  title: string;
  type: string;
  workitemType: 'Tasks' | 'Test cases' | 'Issues' | 'Signoffs' | 'Meetings' | 'Requirements';
  status: 'active' | 'in-progress' | 'missing' | 'broken' | 'changed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  lastModified: string;
  riskLevel?: 'high' | 'medium' | 'low';
  direction: 'upstream' | 'downstream';
}

const allLinks: LinkItem[] = [
  {
    id: 'BR-001',
    title: 'Calendar Integration Business Requirement',
    type: 'Business Requirement',
    workitemType: 'Requirements',
    status: 'active',
    priority: 'critical',
    owner: 'John Smith',
    lastModified: '2025-01-10',
    riskLevel: 'low',
    direction: 'upstream'
  },
  {
    id: 'TASK-123',
    title: 'API Integration Planning Task',
    type: 'Task',
    workitemType: 'Tasks',
    status: 'active',
    priority: 'high',
    owner: 'Mike Davis',
    lastModified: '2025-01-08',
    direction: 'upstream'
  },
  {
    id: 'MEET-456',
    title: 'Requirements Review Meeting',
    type: 'Meeting',
    workitemType: 'Meetings',
    status: 'active',
    priority: 'medium',
    owner: 'Lisa Wilson',
    lastModified: '2025-01-07',
    direction: 'upstream'
  },
  {
    id: 'FS-089',
    title: 'Calendar Event Creation Functional Spec',
    type: 'Functional Requirement',
    workitemType: 'Requirements',
    status: 'active',
    priority: 'high',
    owner: 'Alice Brown',
    lastModified: '2025-01-11',
    direction: 'downstream'
  },
  {
    id: 'TASK-234',
    title: 'Implement Calendar API Integration',
    type: 'Development Task',
    workitemType: 'Tasks',
    status: 'in-progress',
    priority: 'high',
    owner: 'Bob Wilson',
    lastModified: '2025-01-10',
    direction: 'downstream'
  },
  {
    id: 'TC-234',
    title: 'Calendar Blocking Test Cases',
    type: 'Test Case',
    workitemType: 'Test cases',
    status: 'missing',
    priority: 'medium',
    owner: 'Lisa Chen',
    lastModified: '2025-01-05',
    riskLevel: 'medium',
    direction: 'downstream'
  },
  {
    id: 'BUG-078',
    title: 'Calendar Sync Failure Issue',
    type: 'Bug',
    workitemType: 'Issues',
    status: 'broken',
    priority: 'critical',
    owner: 'Tom Anderson',
    lastModified: '2025-01-12',
    riskLevel: 'high',
    direction: 'downstream'
  },
  {
    id: 'SIGN-045',
    title: 'Security Review Signoff',
    type: 'Approval',
    workitemType: 'Signoffs',
    status: 'in-progress',
    priority: 'high',
    owner: 'David Gray',
    lastModified: '2025-01-09',
    direction: 'downstream'
  },
  {
    id: 'MEET-789',
    title: 'Implementation Planning Meeting',
    type: 'Meeting',
    workitemType: 'Meetings',
    status: 'active',
    priority: 'medium',
    owner: 'Emma White',
    lastModified: '2025-01-08',
    direction: 'downstream'
  }
];

export const LinksTab = ({ requirementId }: LinksTabProps) => {

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'in-progress': return <Clock className="h-3 w-3 text-blue-500" />;
      case 'missing': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'broken': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'changed': return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      default: return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'business requirement': return <Target className="h-3 w-3" />;
      case 'epic': return <GitBranch className="h-3 w-3" />;
      case 'functional specification': return <FileText className="h-3 w-3" />;
      case 'technical design': return <Code className="h-3 w-3" />;
      case 'test case': return <TestTube className="h-3 w-3" />;
      case 'defect': return <Bug className="h-3 w-3" />;
      case 'deployment': return <Rocket className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getWorkitemTypeIcon = (workitemType: string) => {
    switch (workitemType) {
      case 'Tasks': return <CheckSquare className="h-3 w-3" />;
      case 'Test cases': return <TestTube className="h-3 w-3" />;
      case 'Issues': return <Bug className="h-3 w-3" />;
      case 'Signoffs': return <CheckCircle className="h-3 w-3" />;
      case 'Meetings': return <Calendar className="h-3 w-3" />;
      case 'Requirements': return <FileText className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderLinkItem = (link: LinkItem) => (
    <div key={link.id} className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded border-b border-border/50 last:border-b-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-1 text-muted-foreground">
          {link.direction === 'upstream' ? <ArrowUp className="h-3 w-3 text-blue-600" /> : <ArrowDown className="h-3 w-3 text-green-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">{link.id}</span>
            <span className={cn("text-xs font-medium", getPriorityColor(link.priority))}>
              {link.priority}
            </span>
            <Badge variant="outline" className="text-xs h-4 px-1">
              {link.status}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{link.type}</span>
            <span>•</span>
            <span>{link.owner}</span>
            <span>•</span>
            <span>{link.lastModified}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
        <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );

  const renderWorkitemTypeSection = (workitemType: string, links: LinkItem[]) => {
    if (links.length === 0) return null;
    
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-muted/30 rounded">
          {getWorkitemTypeIcon(workitemType)}
          <h4 className="text-sm font-medium text-foreground">{workitemType}</h4>
          <Badge variant="secondary" className="text-xs h-4">
            {links.length}
          </Badge>
        </div>
        <div className="bg-white border border-border rounded-lg">
          {links.map(renderLinkItem)}
        </div>
      </div>
    );
  };

  const groupedLinks = allLinks.reduce((acc, link) => {
    if (!acc[link.workitemType]) {
      acc[link.workitemType] = [];
    }
    acc[link.workitemType].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  const workitemTypes = ['Requirements', 'Tasks', 'Test cases', 'Issues', 'Signoffs', 'Meetings'];

  return (
    <div className="px-6 pt-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">Linked Items</h3>
          <Badge variant="secondary" className="text-xs h-5">
            {allLinks.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-7">
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {allLinks.length > 0 ? (
          workitemTypes.map(workitemType => 
            renderWorkitemTypeSection(workitemType, groupedLinks[workitemType] || [])
          )
        ) : (
          <div className="bg-white border border-border rounded-lg">
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No links found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};