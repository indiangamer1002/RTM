import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Change {
    field: string;
    oldValue: string;
    newValue: string;
}

interface HistoryEntry {
    id: string;
    user: {
        name: string;
        initials: string;
    };
    action: string;
    timestamp: string;
    changes: Change[];
}

const mockHistory: HistoryEntry[] = [
    {
        id: '1',
        user: { name: 'John Smith', initials: 'JS' },
        action: 'Status: Review → Approved',
        timestamp: '12 Jan · 10:30 AM',
        changes: [
            { field: 'Status', oldValue: 'Review', newValue: 'Approved' },
            { field: 'Progress', oldValue: '60%', newValue: '100%' },
            { field: 'Tags', oldValue: '', newValue: 'Calendar, Integration' },
        ],
    },
    {
        id: '2',
        user: { name: 'Sarah Johnson', initials: 'SJ' },
        action: 'Priority: Medium → High',
        timestamp: '11 Jan · 04:15 PM',
        changes: [
            { field: 'Priority', oldValue: 'Medium', newValue: 'High' },
        ],
    },
    {
        id: '3',
        user: { name: 'Mike Davis', initials: 'MD' },
        action: 'Description updated',
        timestamp: '11 Jan · 02:00 PM',
        changes: [
            { field: 'Description', oldValue: 'Calendar events not blocking', newValue: 'Outlook calendar is not getting blocked' },
        ],
    },
    {
        id: '4',
        user: { name: 'Lisa Wilson', initials: 'LW' },
        action: 'Added tags',
        timestamp: '10 Jan · 11:45 AM',
        changes: [
            { field: 'Tags', oldValue: '', newValue: 'High Priority' },
        ],
    },
    {
        id: '6',
        user: { name: 'Sarah Johnson', initials: 'SJ' },
        action: 'Added Attachment',
        timestamp: '10 Jan · 02:30 PM',
        changes: [
            { field: 'Attachment', oldValue: '', newValue: 'design_specs_v2.pdf' },
        ],
    },
    {
        id: '7',
        user: { name: 'Mike Davis', initials: 'MD' },
        action: 'Added Stakeholder',
        timestamp: '10 Jan · 11:00 AM',
        changes: [
            { field: 'Stakeholder', oldValue: '', newValue: 'Tom Wilson' },
        ],
    },
    {
        id: '5',
        user: { name: 'John Smith', initials: 'JS' },
        action: 'Requirement created',
        timestamp: '10 Jan · 09:00 AM',
        changes: [],
    },
];

const HistoryTab = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <div className="w-full h-full overflow-y-auto px-4 pt-2 pb-0" style={{ fontFamily: '"Geist Sans", sans-serif' }}>
            <h3 className="text-sm font-semibold text-foreground mb-2 ml-4">History</h3>
            <div className="relative border-l border-gray-200 ml-4 mt-4">
                {mockHistory.map((entry, index) => {
                    const isExpanded = expandedId === entry.id;
                    const hasChanges = entry.changes && entry.changes.length > 0;
                    const isLast = index === mockHistory.length - 1;

                    return (
                        <div key={entry.id} className="relative pl-6">

                            {/* Timeline Connection Line Fix: Stop at last item */}
                            {isLast && (
                                <div className="absolute left-[-1px] top-4 bottom-0 w-[2px] bg-background"></div>
                            )}

                            {/* Timeline Dot */}
                            <div className={cn(
                                "absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full border-2 border-background transition-colors z-10",
                                hasChanges ? "bg-gray-400 group-hover:bg-primary" : "bg-gray-300"
                            )} />

                            <div
                                className={cn(
                                    "group flex flex-col rounded-md transition-all duration-200",
                                    hasChanges ? "cursor-pointer hover:bg-gray-50/80" : "",
                                    !isLast && "mb-1"
                                )}
                                onClick={() => hasChanges && toggleExpand(entry.id)}
                            >
                                {/* Compact Row */}
                                <div className="flex items-center h-11 px-2 gap-3">

                                    {/* User Initials */}
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[10px] font-medium bg-gray-100 text-gray-600">
                                            {entry.user.initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Summary */}
                                    <div className="flex-1 flex items-center gap-2 overflow-hidden text-sm">
                                        <span className="font-semibold text-foreground whitespace-nowrap">
                                            {entry.user.name}
                                        </span>
                                        <span className="text-muted-foreground truncate">
                                            {(() => {
                                                if (!entry.changes || entry.changes.length === 0) return entry.action;

                                                const allAdded = entry.changes.every(c => !c.oldValue && c.newValue);
                                                if (allAdded) return `Added ${entry.changes.map(c => c.field).join(', ')}`;

                                                const allRemoved = entry.changes.every(c => c.oldValue && !c.newValue);
                                                if (allRemoved) return `Removed ${entry.changes.map(c => c.field).join(', ')}`;

                                                return `Updated ${entry.changes.map(c => c.field).join(', ')}`;
                                            })()}
                                        </span>
                                    </div>

                                    {/* Timestamp */}
                                    <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                                        {entry.timestamp}
                                    </span>

                                    {/* Expand Icon */}
                                    {hasChanges && (
                                        <div className="text-muted-foreground/60 w-4">
                                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5 group-hover:text-foreground" />}
                                        </div>
                                    )}
                                    {!hasChanges && <div className="w-4" />}
                                </div>

                                {/* Expanded Content: Diffs */}
                                {isExpanded && hasChanges && (
                                    <div className="px-11 pb-3 text-xs animate-in fade-in slide-in-from-top-1 duration-200" style={{ fontFamily: '"Geist Mono", monospace' }}>
                                        <div className="flex flex-col gap-1">
                                            {entry.changes.map((change, idx) => (
                                                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                                                    <span className="font-semibold text-muted-foreground min-w-[70px] pt-0.5">{change.field}:</span>
                                                    <div className="flex-1 flex flex-wrap gap-x-2 items-center">
                                                        {change.oldValue && (
                                                            <span className="text-red-700/80 line-through decoration-red-300 px-0.5 rounded bg-red-50/50">
                                                                {change.oldValue}
                                                            </span>
                                                        )}
                                                        {change.oldValue && change.newValue && (
                                                            <span className="text-muted-foreground/50">→</span>
                                                        )}
                                                        <span className="text-green-700 font-medium px-0.5 rounded bg-green-50/50">
                                                            {change.newValue}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HistoryTab;
