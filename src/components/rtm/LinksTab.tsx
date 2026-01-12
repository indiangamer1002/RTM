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
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinksTabProps {
  requirementId: string;
}

interface LinkItem {
  id: string;
  title: string;
  type: string;
  status: 'active' | 'in-progress' | 'missing' | 'broken' | 'changed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  lastModified: string;
  riskLevel?: 'high' | 'medium' | 'low';
}

const mockUpstreamLinks: LinkItem[] = [
  {
    id: 'BR-001',
    title: 'Calendar Integration Business Requirement',
    type: 'Business Requirement',
    status: 'active',
    priority: 'critical',
    owner: 'John Smith',
    lastModified: '2025-01-10',
    riskLevel: 'low'
  },
  {
    id: 'EPIC-045',
    title: 'Outlook Calendar Enhancement Epic',
    type: 'Epic',
    status: 'in-progress',
    priority: 'high',
    owner: 'Sarah Johnson',
    lastModified: '2025-01-09',
    riskLevel: 'medium'
  },
  {
    id: 'REG-012',
    title: 'Data Privacy Compliance Requirement',
    type: 'Regulatory Input',
    status: 'changed',
    priority: 'critical',
    owner: 'Mike Davis',
    lastModified: '2025-01-08',
    riskLevel: 'high'
  }
];

const mockDownstreamLinks: LinkItem[] = [
  {
    id: 'FS-089',
    title: 'Calendar Event Creation Functional Spec',
    type: 'Functional Specification',
    status: 'active',
    priority: 'high',
    owner: 'Alice Brown',
    lastModified: '2025-01-11'
  },
  {
    id: 'TD-156',
    title: 'Outlook API Integration Design',
    type: 'Technical Design',
    status: 'in-progress',
    priority: 'high',
    owner: 'Bob Wilson',
    lastModified: '2025-01-10'
  },
  {
    id: 'TC-234',
    title: 'Calendar Blocking Test Cases',
    type: 'Test Case',
    status: 'missing',
    priority: 'medium',
    owner: 'Lisa Chen',
    lastModified: '2025-01-05',
    riskLevel: 'medium'
  },
  {
    id: 'DEF-078',
    title: 'Calendar Sync Failure Defect',
    type: 'Defect',
    status: 'broken',
    priority: 'critical',
    owner: 'Tom Anderson',
    lastModified: '2025-01-12',
    riskLevel: 'high'
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
          {getTypeIcon(link.type)}
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

  const renderSection = (title: string, links: LinkItem[], icon: React.ReactNode, description: string) => {
    const riskCount = links.filter(link => link.riskLevel === 'high').length;
    const issueCount = links.filter(link => link.status === 'missing' || link.status === 'broken').length;

    return (
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-base font-medium text-foreground">{title}</h3>
            <Badge variant="secondary" className="text-xs h-5">
              {links.length}
            </Badge>
            {(riskCount > 0 || issueCount > 0) && (
              <div className="flex items-center gap-1">
                {riskCount > 0 && (
                  <Badge variant="destructive" className="text-xs h-5">
                    {riskCount} risk
                  </Badge>
                )}
                {issueCount > 0 && (
                  <Badge variant="outline" className="text-xs h-5 border-yellow-500 text-yellow-700">
                    {issueCount} issues
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">{description}</p>
        
        <div className="bg-white border border-border rounded-lg">
          {links.length > 0 ? (
            links.map(renderLinkItem)
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No {title.toLowerCase()} found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 pt-0 pb-6 space-y-6">
      {/* Upstream Links Section */}
      {renderSection(
        "Upstream Links",
        mockUpstreamLinks,
        <ArrowUp className="h-4 w-4 text-blue-600" />,
        "Source artifacts and predecessor requirements that drive this requirement"
      )}

      {/* Downstream Links Section */}
      {renderSection(
        "Downstream Links", 
        mockDownstreamLinks,
        <ArrowDown className="h-4 w-4 text-green-600" />,
        "Dependent artifacts and successor items derived from this requirement"
      )}
    </div>
  );
};