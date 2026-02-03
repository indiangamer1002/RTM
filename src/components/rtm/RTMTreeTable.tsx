import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  Row,
} from '@tanstack/react-table';
import { ChevronRight, ChevronDown, Folder, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, X, ExternalLink, ArrowLeft, Minimize2 } from 'lucide-react';
import { NavigationNode } from '@/types/rtm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatusBadge } from './StatusBadge';
import { StatusBar, StatusSegment } from './StatusBar';
import { FilterBar } from './FilterBar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RTMTreeTableProps {
  data: NavigationNode[];
  onRequirementSelect: (node: NavigationNode) => void;
  tableView?: 'explorer' | 'trace';
  onTableViewChange?: (view: 'explorer' | 'trace') => void;
  onFolderFocus?: (node: NavigationNode) => void;
  onBackNavigation?: () => void;
  showBackButton?: boolean;
  onExpandedChange?: (expanded: any) => void;
  visibleItemsCount?: number;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  visibleColumns?: string[];
  onColumnToggle?: (column: string) => void;
  availableFolders?: { id: string; name: string; level: number; path: string }[];
}

interface TableRow extends NavigationNode {
  subRows?: TableRow[];
  reqId?: string;
  description?: string;
  tasks?: any[];
  testCases?: any[];
  issues?: any[];
  signOffs?: any[];
  ctas?: any[];
  meetings?: any[];
  sourceOwner?: string;
}

const columnHelper = createColumnHelper<TableRow>();

// Minimum widths for each column to ensure data visibility
const MIN_COLUMN_WIDTHS = [
  300, // Req Title (first)
  110,  // Req ID (second, reduced)
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

// Explorer view widths - wider columns for better work item display
const EXPLORER_MIN_WIDTHS = [
  300, // Req Title (first)
  110, // Req ID (second, reduced)
  110, // Type
  130, // Source Owner
  110, // Priority
  110, // Status
  220, // Tasks - wider for work item cards
  220, // Test Cases - wider for work item cards
  200, // Issues - wider for work item cards
  200, // Sign-offs - wider for work item cards
  180, // Events - wider for work item cards
];

export function RTMTreeTable({ data, onRequirementSelect, tableView = 'explorer', onTableViewChange, onFolderFocus, onBackNavigation, showBackButton, onExpandedChange, visibleItemsCount, isFullscreen = false, onFullscreenToggle, visibleColumns, onColumnToggle, availableFolders }: RTMTreeTableProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [colWidths, setColWidths] = useState<number[]>([...MIN_COLUMN_WIDTHS]);
  
  // Update column widths when view changes
  const currentMinWidths = tableView === 'explorer' ? EXPLORER_MIN_WIDTHS : MIN_COLUMN_WIDTHS;
  
  // Reset column widths when switching views
  const [lastTableView, setLastTableView] = useState(tableView);
  if (lastTableView !== tableView) {
    setColWidths([...currentMinWidths]);
    setLastTableView(tableView);
  }
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [activeFilterCol, setActiveFilterCol] = useState<number | null>(null);
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({});
  
  // const visibleColumns = [
  //   "Req Title", "Req ID", "Type", "Source Owner", "Priority", "Status",
  //   "Task", "TESTCASES", "Issues", "Sign-offs", "CTA", "Meetings"
  // ];

  // Column resize handler
  const startResize = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = colWidths[index];
    const minWidth = currentMinWidths[index];

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

  // Get work items for explorer view
  const getWorkItemsList = (req: any, type: 'tasks' | 'testCases' | 'issues' | 'signOffs' | 'ctas' | 'meetings') => {
    const items = req[type] || [];
    return items; // Return all items, not just first 3
  };

  const renderWorkItemsList = (items: any[], type: string, total: number, rowId: string, columnId: string) => {
    if (total === 0) return <div className="text-xs text-muted-foreground">-</div>;
    
    const cellKey = `${rowId}-${columnId}`;
    const isExpanded = expandedCells[cellKey];
    const displayItems = isExpanded ? items : items.slice(0, 3);
    
    console.log('Rendering cell:', cellKey, 'total items:', total, 'isExpanded:', isExpanded, 'showing:', displayItems.length);
    
    return (
      <div className="space-y-2">
        {displayItems.map((item: any, index: number) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-md p-3 relative">
            {/* Left colored border */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${
              item.status === 'Completed' || item.status === 'Approved' || item.status === 'Done' ? 'bg-green-500' :
              item.status === 'Active' || item.status === 'Pending' ? 'bg-blue-500' :
              item.status === 'Blocked' || item.status === 'Rejected' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
            
            {/* Content */}
            <div className="flex items-start justify-between ml-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {item.title || item.stakeholder}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.id}
                </div>
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'Completed' || item.status === 'Approved' || item.status === 'Done' ? 'bg-green-500' :
                  item.status === 'Active' || item.status === 'Pending' ? 'bg-blue-500' :
                  item.status === 'Blocked' || item.status === 'Rejected' ? 'bg-red-500' :
                  'bg-gray-400'
                }`} />
                <span className={`text-xs font-medium ${
                  item.status === 'Completed' || item.status === 'Approved' || item.status === 'Done' ? 'text-green-700' :
                  item.status === 'Active' || item.status === 'Pending' ? 'text-blue-700' :
                  item.status === 'Blocked' || item.status === 'Rejected' ? 'text-red-700' :
                  'text-gray-600'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {total > 3 && (
          <div className="text-center py-2">
            <button 
              className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 select-none bg-transparent border-none underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clicked expand/collapse for:', cellKey, 'current state:', isExpanded);
                setExpandedCells(prev => {
                  const newState = { ...prev, [cellKey]: !isExpanded };
                  console.log('New expanded state:', newState);
                  return newState;
                });
              }}
            >
              {isExpanded ? `Show less ▲` : `+${total - 3} more ▼`}
            </button>
          </div>
        )}
      </div>
    );
  };

  const getCoveragePercentage = (items: any[]) => {
    if (!items || items.length === 0) return 0;
    const completed = items.filter(item => 
      item.status === 'Completed' || item.status === 'Approved' || item.status === 'Done'
    ).length;
    return Math.round((completed / items.length) * 100);
  };

  // Get task segments from requirement data
  const getTaskSegments = (req: any): StatusSegment[] => {
    if (!req.tasks) return [];
    const newItem = req.tasks.filter((t: any) => t.status === 'New');
    const active = req.tasks.filter((t: any) => t.status === 'Active');
    const completed = req.tasks.filter((t: any) => t.status === 'Completed');
    const approved = req.tasks.filter((t: any) => t.status === 'Approved');

    return [
      { label: 'New', count: newItem.length, color: 'gray', items: newItem.map((t: any) => ({ id: t.id, title: t.title, status: `Due: ${t.dueDate}` })) },
      { label: 'Active', count: active.length, color: 'blue', items: active.map((t: any) => ({ id: t.id, title: t.title, status: `Due: ${t.dueDate}` })) },
      { label: 'Completed', count: completed.length, color: 'teal', items: completed.map((t: any) => ({ id: t.id, title: t.title, status: `Due: ${t.dueDate}` })) },
      { label: 'Approved', count: approved.length, color: 'green', items: approved.map((t: any) => ({ id: t.id, title: t.title, status: `Due: ${t.dueDate}` })) },
    ];
  };

  // Get test case segments from requirement data
  const getTestCaseSegments = (req: any): StatusSegment[] => {
    if (!req.testCases) return [];
    const newItem = req.testCases.filter((tc: any) => tc.status === 'New');
    const active = req.testCases.filter((tc: any) => tc.status === 'Active');
    const performed = req.testCases.filter((tc: any) => tc.status === 'performed');
    const approved = req.testCases.filter((tc: any) => tc.status === 'approved');
    const defect = req.testCases.filter((tc: any) => tc.status === 'Defect found');

    return [
      { label: 'New', count: newItem.length, color: 'gray', items: newItem.map((tc: any) => ({ id: tc.id, title: tc.title, status: `Due: ${tc.dueDate}` })) },
      { label: 'Active', count: active.length, color: 'blue', items: active.map((tc: any) => ({ id: tc.id, title: tc.title, status: `Due: ${tc.dueDate}` })) },
      { label: 'Performed', count: performed.length, color: 'teal', items: performed.map((tc: any) => ({ id: tc.id, title: tc.title, status: `Due: ${tc.dueDate}` })) },
      { label: 'Approved', count: approved.length, color: 'green', items: approved.map((tc: any) => ({ id: tc.id, title: tc.title, status: `Due: ${tc.dueDate}` })) },
      { label: 'Defect', count: defect.length, color: 'purple', items: defect.map((tc: any) => ({ id: tc.id, title: tc.title, status: `Due: ${tc.dueDate}` })) },
    ];
  };

  // Get issue segments from requirement data
  const getIssueSegments = (req: any): StatusSegment[] => {
    if (!req.issues) return [];
    const newItem = req.issues.filter((i: any) => i.status === 'New');
    const active = req.issues.filter((i: any) => i.status === 'Active');
    const resolved = req.issues.filter((i: any) => i.status === 'Resolved');
    const approved = req.issues.filter((i: any) => i.status === 'Approved');

    return [
      { label: 'New', count: newItem.length, color: 'gray', items: newItem.map((i: any) => ({ id: i.id, title: i.title, status: `Due: ${i.dueDate}` })) },
      { label: 'Active', count: active.length, color: 'blue', items: active.map((i: any) => ({ id: i.id, title: i.title, status: `Due: ${i.dueDate}` })) },
      { label: 'Resolved', count: resolved.length, color: 'teal', items: resolved.map((i: any) => ({ id: i.id, title: i.title, status: `Due: ${i.dueDate}` })) },
      { label: 'Approved', count: approved.length, color: 'green', items: approved.map((i: any) => ({ id: i.id, title: i.title, status: `Due: ${i.dueDate}` })) },
    ];
  };

  // Get sign-off segments from requirement data
  const getSignOffSegments = (req: any): StatusSegment[] => {
    if (!req.signOffs) return [];
    const newItem = req.signOffs.filter((s: any) => s.status === 'New');
    const active = req.signOffs.filter((s: any) => s.status === 'Active');
    const approved = req.signOffs.filter((s: any) => s.status === 'Approved');
    const rejected = req.signOffs.filter((s: any) => s.status === 'Rejected');
    const completed = req.signOffs.filter((s: any) => s.status === 'Completed');

    return [
      { label: 'New', count: newItem.length, color: 'gray', items: newItem.map((s: any) => ({ id: s.id, title: s.stakeholder, status: `Due: ${s.dueDate}` })) },
      { label: 'Active', count: active.length, color: 'blue', items: active.map((s: any) => ({ id: s.id, title: s.stakeholder, status: `Due: ${s.dueDate}` })) },
      { label: 'Approved', count: approved.length, color: 'teal', items: approved.map((s: any) => ({ id: s.id, title: s.stakeholder, status: `Due: ${s.dueDate}` })) },
      { label: 'Rejected', count: rejected.length, color: 'red', items: rejected.map((s: any) => ({ id: s.id, title: s.stakeholder, status: `Due: ${s.dueDate}` })) },
      { label: 'Completed', count: completed.length, color: 'teal', items: completed.map((s: any) => ({ id: s.id, title: s.stakeholder, status: `Due: ${s.dueDate}` })) },
    ];
  };

  // Get CTA segments from requirement data
  const getCTASegments = (req: any): StatusSegment[] => {
    if (!req.ctas) return [];
    const newItem = req.ctas.filter((c: any) => c.status === 'New');
    const active = req.ctas.filter((c: any) => c.status === 'Active');
    const completed = req.ctas.filter((c: any) => c.status === 'Completed');
    const pending = req.ctas.filter((c: any) => c.status === 'Pending');

    return [
      { label: 'New', count: newItem.length, color: 'gray', items: newItem.map((c: any) => ({ id: c.id, title: c.title, status: `Due: ${c.dueDate}` })) },
      { label: 'Active', count: active.length, color: 'blue', items: active.map((c: any) => ({ id: c.id, title: c.title, status: `Due: ${c.dueDate}` })) },
      { label: 'Pending', count: pending.length, color: 'orange', items: pending.map((c: any) => ({ id: c.id, title: c.title, status: `Due: ${c.dueDate}` })) },
      { label: 'Completed', count: completed.length, color: 'teal', items: completed.map((c: any) => ({ id: c.id, title: c.title, status: `Due: ${c.dueDate}` })) },
    ];
  };

  // Get meeting segments from requirement data
  const getMeetingSegments = (req: any): StatusSegment[] => {
    if (!req.meetings) return [];
    const scheduled = req.meetings.filter((m: any) => m.status === 'Scheduled');
    const completed = req.meetings.filter((m: any) => m.status === 'Completed');
    const cancelled = req.meetings.filter((m: any) => m.status === 'Cancelled');
    const pending = req.meetings.filter((m: any) => m.status === 'Pending');

    return [
      { label: 'Scheduled', count: scheduled.length, color: 'blue', items: scheduled.map((m: any) => ({ id: m.id, title: m.title, status: `Due: ${m.dueDate}` })) },
      { label: 'Pending', count: pending.length, color: 'orange', items: pending.map((m: any) => ({ id: m.id, title: m.title, status: `Due: ${m.dueDate}` })) },
      { label: 'Completed', count: completed.length, color: 'teal', items: completed.map((m: any) => ({ id: m.id, title: m.title, status: `Due: ${m.dueDate}` })) },
      { label: 'Cancelled', count: cancelled.length, color: 'red', items: cancelled.map((m: any) => ({ id: m.id, title: m.title, status: `Due: ${m.dueDate}` })) },
    ];
  };

  // Convert NavigationNode to TableRow format
  const convertToTableRows = (nodes: NavigationNode[]): TableRow[] => {
    return nodes.map(node => ({
      ...node,
      subRows: node.children ? convertToTableRows(node.children) : undefined,
    }));
  };

  const tableData = useMemo(() => convertToTableRows(data), [data]);

  // Header renderer with filters
  const renderHeader = (label: string, index: number, className: string = '') => {
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

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('name', {
        id: 'title',
        header: 'Req Title',
        cell: ({ row, getValue }) => {
          const isFolder = row.original.children !== undefined;
          const depth = row.depth;
          
          if (isFolder) {
            return (
              <div 
                className="flex items-center gap-2 py-1"
                style={{ paddingLeft: `${depth * 16}px` }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-blue-50"
                  onClick={row.getToggleExpandedHandler()}
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-blue-600" />
                  )}
                </Button>
                <Folder className="h-4 w-4 text-blue-600" />
                
                <span className="text-foreground font-medium text-sm truncate">
                  {getValue()}
                </span>
                {onFolderFocus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-blue-50 ml-1"
                    onClick={() => onFolderFocus(row.original)}
                    title="Focus on this folder"
                  >
                    <ExternalLink className="!h-3.5 !w-3.5 text-blue-600" />
                  </Button>
                )}
              </div>
            );
          }
          
          return (
            <div 
              className="flex flex-col"
              style={{ paddingLeft: `${depth * 16 + 32}px` }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="text-foreground hover:underline cursor-pointer font-medium text-sm truncate"
                      onClick={() => navigate(`/requirement/${row.original.reqId || row.original.id}`)}
                    >
                      {getValue()}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-md">
                    <div className="space-y-2">
                      <div className="font-semibold">{getValue()}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {row.original.reqId || row.original.id}
                      </div>
                      {row.original.description && (
                        <div className="text-sm">{(row.original as any).description}</div>
                      )}
                      {row.original.type && (
                        <div className="text-sm">Type: {row.original.type}</div>
                      )}
                      {row.original.priority && (
                        <div className="text-sm">Priority: {row.original.priority}</div>
                      )}
                      {row.original.requirementStatus && (
                        <div className="text-sm">Status: {row.original.requirementStatus}</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        id: 'reqId',
        header: 'Req ID',
        cell: ({ row, getValue }) => {
          const isFolder = row.original.children !== undefined;
          
          if (isFolder) {
            return (
              <div className="flex items-center py-1">
                <span className="text-foreground font-medium text-xs">
                  {row.original.reqId}
                </span>
              </div>
            );
          }
          
          return (
            <div className="flex items-center">
              <span
                className="text-foreground font-medium text-xs hover:underline cursor-pointer"
                onClick={() => navigate(`/requirement/${row.original.reqId || row.original.id}`)}
              >
                {row.original.reqId || getValue()}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: 'Type',
        cell: ({ row, getValue }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const type = getValue();
          if (!type) return <span className="text-xs text-muted-foreground">-</span>;
          
          const typeMap: Record<string, 'info' | 'warning' | 'neutral'> = {
            'Business': 'info',
            'Functional': 'warning', 
            'Technical': 'neutral',
          };
          
          return (
            <div className="flex justify-center">
              <StatusBadge label={type} type={typeMap[type] || 'neutral'} />
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.sourceOwner || '', {
        id: 'sourceOwner',
        header: 'Source Owner',
        cell: ({ row, getValue }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          return <span className="text-sm">{getValue() as string || '-'}</span>;
        },
      }),
      columnHelper.accessor('priority', {
        id: 'priority',
        header: 'Priority',
        cell: ({ row, getValue }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const priority = getValue();
          if (!priority) return <span className="text-xs text-muted-foreground">-</span>;
          
          const priorityMap: Record<string, 'error' | 'warning' | 'success'> = {
            'High': 'error',
            'Medium': 'warning',
            'Low': 'success',
          };
          
          return (
            <div className="flex justify-center">
              <StatusBadge label={priority} type={priorityMap[priority] || 'neutral'} />
            </div>
          );
        },
      }),
      columnHelper.accessor('requirementStatus', {
        id: 'status',
        header: 'Status',
        cell: ({ row, getValue }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const status = getValue();
          if (!status) return <span className="text-xs text-muted-foreground">-</span>;
          
          const statusMap: Record<string, 'neutral' | 'info' | 'success'> = {
            'New': 'neutral',
            'Active': 'info',
            'Completed': 'success',
            'Approved': 'success',
          };
          
          return (
            <div className="flex justify-center">
              <StatusBadge label={status} type={statusMap[status] || 'neutral'} />
            </div>
          );
        },
      }),
    ];

    const traceColumns = [
      columnHelper.accessor('name', {
        id: 'task',
        header: 'Task',
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const taskSegments = getTaskSegments(row.original);
          const total = (row.original as any).tasks?.length || 0;
          
          return (
            <div className="overflow-hidden">
              <StatusBar
                segments={taskSegments}
                total={total}
                title="Tasks"
                onViewDetails={() => onRequirementSelect(row.original)}
                reqId={row.original.reqId || row.original.name}
                reqTitle={row.original.name}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        id: 'testcases',
        header: 'TESTCASES',
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const testCaseSegments = getTestCaseSegments(row.original);
          const total = (row.original as any).testCases?.length || 0;
          
          return (
            <div className="overflow-hidden">
              <StatusBar
                segments={testCaseSegments}
                total={total}
                title="TESTCASES"
                onViewDetails={() => onRequirementSelect(row.original)}
                reqId={row.original.reqId || row.original.name}
                reqTitle={row.original.name}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        id: 'issues',
        header: 'Issues',
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const issueSegments = getIssueSegments(row.original);
          const total = (row.original as any).issues?.length || 0;
          
          return (
            <div className="overflow-hidden">
              <StatusBar
                segments={issueSegments}
                total={total}
                title="Issues"
                onViewDetails={() => onRequirementSelect(row.original)}
                reqId={row.original.reqId || row.original.name}
                reqTitle={row.original.name}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        id: 'signoffs',
        header: 'Sign-offs',
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const signOffSegments = getSignOffSegments(row.original);
          const total = (row.original as any).signOffs?.length || 0;
          
          return (
            <div className="overflow-hidden">
              <StatusBar
                segments={signOffSegments}
                total={total}
                title="Sign-offs"
                onViewDetails={() => onRequirementSelect(row.original)}
                reqId={row.original.reqId || row.original.name}
                reqTitle={row.original.name}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        id: 'cta',
        header: 'CTA',
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const ctaSegments = getCTASegments(row.original);
          const total = (row.original as any).ctas?.length || 0;
          
          return (
            <div className="overflow-hidden">
              <StatusBar
                segments={ctaSegments}
                total={total}
                title="CTA"
                onViewDetails={() => onRequirementSelect(row.original)}
                reqId={row.original.reqId || row.original.name}
                reqTitle={row.original.name}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        id: 'meetings',
        header: 'Meetings',
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const meetingSegments = getMeetingSegments(row.original);
          const total = (row.original as any).meetings?.length || 0;
          
          return (
            <div className="overflow-hidden">
              <StatusBar
                segments={meetingSegments}
                total={total}
                title="Meetings"
                onViewDetails={() => onRequirementSelect(row.original)}
                reqId={row.original.reqId || row.original.name}
                reqTitle={row.original.name}
              />
            </div>
          );
        },
      }),
    ];

    const explorerColumns = [
      columnHelper.accessor('name', {
        id: 'task',
        header: () => (
          <div className="text-center">
            <div className="font-bold">Tasks</div>
            <div className="text-[10px] text-muted-foreground">85% coverage</div>
          </div>
        ),
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const tasks = getWorkItemsList(row.original, 'tasks');
          const total = (row.original as any).tasks?.length || 0;
          
          return renderWorkItemsList(tasks, 'tasks', total, row.id, 'task');
        },
      }),
      columnHelper.accessor('name', {
        id: 'testcases',
        header: () => (
          <div className="text-center">
            <div className="font-bold">Test Cases</div>
            <div className="text-[10px] text-muted-foreground">92% coverage</div>
          </div>
        ),
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const testCases = getWorkItemsList(row.original, 'testCases');
          const total = (row.original as any).testCases?.length || 0;
          
          return renderWorkItemsList(testCases, 'testCases', total, row.id, 'testcases');
        },
      }),
      columnHelper.accessor('name', {
        id: 'issues',
        header: () => (
          <div className="text-center">
            <div className="font-bold">Issues</div>
            <div className="text-[10px] text-muted-foreground">78% coverage</div>
          </div>
        ),
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const issues = getWorkItemsList(row.original, 'issues');
          const total = (row.original as any).issues?.length || 0;
          
          return renderWorkItemsList(issues, 'issues', total, row.id, 'issues');
        },
      }),
      columnHelper.accessor('name', {
        id: 'signoffs',
        header: () => (
          <div className="text-center">
            <div className="font-bold">Sign-offs</div>
            <div className="text-[10px] text-muted-foreground">100% coverage</div>
          </div>
        ),
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const signOffs = getWorkItemsList(row.original, 'signOffs');
          const total = (row.original as any).signOffs?.length || 0;
          
          return renderWorkItemsList(signOffs, 'signOffs', total, row.id, 'signoffs');
        },
      }),
      columnHelper.accessor('name', {
        id: 'events',
        header: () => (
          <div className="text-center">
            <div className="font-bold">Events</div>
            <div className="text-[10px] text-muted-foreground">88% coverage</div>
          </div>
        ),
        cell: ({ row }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          
          const meetings = getWorkItemsList(row.original, 'meetings');
          const total = (row.original as any).meetings?.length || 0;
          
          return renderWorkItemsList(meetings, 'meetings', total, row.id, 'events');
        },
      }),
    ];

    return [...baseColumns, ...(tableView === 'explorer' ? explorerColumns : traceColumns)];
  }, [onRequirementSelect, tableView, expandedCells]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      expanded,
      sorting,
      globalFilter,
      columnFilters,
    },
    onExpandedChange: (updater) => {
      setExpanded(updater);
      if (onExpandedChange) {
        const newExpanded = typeof updater === 'function' ? updater(expanded) : updater;
        onExpandedChange(newExpanded);
      }
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={cn(
      "w-full h-full flex flex-col bg-background",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* FilterBar - only show in fullscreen */}
      {isFullscreen && (
        <div className="flex-shrink-0">
          <div className="flex items-center">
            <div className="flex-1">
              <FilterBar 
                onViewChange={() => {}}
                onFullscreenToggle={onFullscreenToggle}
                visibleColumns={visibleColumns || []}
                onColumnToggle={onColumnToggle || (() => {})}
                tableView={tableView}
                onTableViewChange={onTableViewChange}
                availableFolders={availableFolders}
                onFolderFilter={() => {}}
              />
            </div>
            <div className="px-4 py-3 border-l border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={onFullscreenToggle}
                title="Exit fullscreen"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Search Bar with View Toggle */}
      <div className="p-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && onBackNavigation && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-2 text-muted-foreground hover:text-foreground border border-muted-foreground/20"
                onClick={onBackNavigation}
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </Button>
            )}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search requirements..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 h-9 border-slate-200 focus:border-blue-500 focus:ring-blue-500 w-96"
              />
            </div>
          </div>
          
          <div className="flex-1 flex justify-center">
            <span className="text-sm text-muted-foreground">Showing {visibleItemsCount || table.getRowModel().rows.length} of {data.length} Items</span>
          </div>
          
          <div className="flex items-center gap-4">
            {onTableViewChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-2 border border-muted-foreground/20">
                    {tableView === 'explorer' ? 'Explorer View' : 'Trace View'}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTableViewChange('explorer')}>Explorer View</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTableViewChange('trace')}>Trace View</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="h-full w-full overflow-auto custom-scrollbar bg-background">
          <table className="w-full border-collapse bg-background table-fixed border-spacing-0">
            <thead className="sticky top-0 z-30">
              <tr className="bg-background">
                {table.getHeaderGroups().map(headerGroup => 
                  headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className={cn("sticky top-0 z-20 bg-muted/90 backdrop-blur-sm border-b border-r border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500", 
                        index === 0 ? "min-w-[200px]" : 
                        index === 1 ? "whitespace-nowrap" :
                        index >= 2 && index <= 5 ? "text-center whitespace-nowrap" :
                        "text-center min-w-[100px]"
                      )}
                      style={{ width: colWidths[index] }}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between h-full overflow-hidden group">
                          <span className="truncate">
                            {header.isPlaceholder ? null : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          <button
                            onClick={() => setActiveFilterCol(activeFilterCol === index ? null : index)}
                            className={cn(
                              "p-1 rounded hover:bg-slate-200 transition-colors",
                              filters[header.id] ? "text-primary" : "text-slate-400 opacity-0 group-hover:opacity-100"
                            )}
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                        </div>
                        {activeFilterCol === index && (
                          <div className="relative">
                            <Input
                              autoFocus
                              value={filters[header.id] || ''}
                              onChange={(e) => setFilters(prev => ({ ...prev, [header.id]: e.target.value }))}
                              placeholder={`Filter ${header.id}...`}
                              className="h-7 text-[10px] px-2 py-1 bg-white border-slate-200 focus:ring-1 focus:ring-primary/20"
                            />
                            {filters[header.id] && (
                              <button
                                onClick={() => setFilters(prev => {
                                  const next = { ...prev };
                                  delete next[header.id];
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
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => {
                  const isFolder = row.original.children !== undefined;
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-all duration-200 hover:bg-muted/30",
                        row.getIsSelected() && "bg-blue-50/80"
                      )}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <td 
                          key={cell.id} 
                          className="px-3 py-3 align-top text-sm border-r border-border/20 last:border-r-0"
                          style={{ width: colWidths[cellIndex] }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center text-slate-500 bg-slate-50/30">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="text-sm font-medium">No requirements found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}