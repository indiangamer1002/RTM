import { Requirement, Priority, RequirementStatus, RequirementType } from '@/types/rtm';
import { StatusBadge } from './StatusBadge';
import { ChevronRight, CheckSquare, Bug, Users, ClipboardList } from 'lucide-react';

interface RequirementCardProps {
    requirement: Requirement;
    onClick: (req: Requirement, tab?: string) => void;
}

const priorityMap: Record<Priority, 'error' | 'warning' | 'success'> = {
    'High': 'error',
    'Medium': 'warning',
    'Low': 'success',
};

const statusMap: Record<RequirementStatus, 'neutral' | 'info' | 'success'> = {
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

/**
 * Mobile-optimized card view for a requirement
 * Displays essential info with touch-friendly tap targets
 */
export function RequirementCard({ requirement: req, onClick }: RequirementCardProps) {
    const taskCount = req.tasks.length;
    const testCount = req.testCases.length;
    const issueCount = req.issues.length;
    const signOffCount = req.signOffs.length;

    return (
        <div
            className="bg-card border border-border rounded-lg p-4 mb-3 shadow-sm active:bg-muted/50 transition-colors cursor-pointer touch-target"
            onClick={() => onClick(req)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick(req)}
        >
            {/* Header: ID + Title */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {req.reqId}
                        </span>
                        <StatusBadge label={req.type} type={typeMap[req.type]} />
                    </div>
                    <h3 className="text-sm font-medium text-foreground line-clamp-2">
                        {req.title}
                    </h3>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>

            {/* Status Row: Priority + Status */}
            <div className="flex items-center gap-2 mb-3">
                <StatusBadge label={req.priority} type={priorityMap[req.priority]} />
                <StatusBadge label={req.status} type={statusMap[req.status]} />
            </div>

            {/* Owner */}
            <div className="text-xs text-muted-foreground mb-3">
                <span className="font-medium">Owner:</span> {req.sourceOwner}
            </div>

            {/* Quick Stats Row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                <div className="flex items-center gap-1" onClick={(e) => { e.stopPropagation(); onClick(req, 'tasks'); }}>
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span>{taskCount}</span>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => { e.stopPropagation(); onClick(req, 'test-cases'); }}>
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{testCount}</span>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => { e.stopPropagation(); onClick(req, 'issues'); }}>
                    <Bug className="h-3.5 w-3.5" />
                    <span>{issueCount}</span>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => { e.stopPropagation(); onClick(req, 'signoffs'); }}>
                    <Users className="h-3.5 w-3.5" />
                    <span>{signOffCount}</span>
                </div>
            </div>
        </div>
    );
}

interface RequirementCardListProps {
    requirements: Requirement[];
    onRequirementClick: (req: Requirement, tab?: string) => void;
}

/**
 * Mobile list of requirement cards with vertical scrolling
 */
export function RequirementCardList({ requirements, onRequirementClick }: RequirementCardListProps) {
    if (requirements.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No requirements found
            </div>
        );
    }

    return (
        <div className="p-4 pb-20">
            {requirements.map((req) => (
                <RequirementCard
                    key={req.id}
                    requirement={req}
                    onClick={onRequirementClick}
                />
            ))}
        </div>
    );
}
