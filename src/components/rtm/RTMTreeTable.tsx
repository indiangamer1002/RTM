import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { ChevronRight, ChevronDown, Folder, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, X, ExternalLink, ArrowLeft, Minimize2, Plus, List, Grid3X3 } from 'lucide-react';
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
  130, // Source
  110, // Priority
  110, // Status
  140, // Task
  140, // Testcase
  140, // Issues
  140, // Sign-offs
  140, // CTA
  140, // Meetings
  300, // Tags - increased width
];

// Explorer view widths - wider columns for better work item display
const EXPLORER_MIN_WIDTHS = [
  300, // Req Title (first)
  110, // Req ID (second, reduced)
  130, // Source
  110, // Priority
  110, // Status
  350, // Tasks - wider for work item cards
  350, // Test Cases - wider for work item cards
  320, // Issues - wider for work item cards
  320, // Sign-offs - wider for work item cards
  300, // Events - wider for work item cards
  250, // Tags - increased width for explorer
];

export function RTMTreeTable({ data, onRequirementSelect, tableView = 'explorer', onTableViewChange, onFolderFocus, onBackNavigation, showBackButton, onExpandedChange, visibleItemsCount, isFullscreen = false, onFullscreenToggle, visibleColumns, onColumnToggle, availableFolders }: RTMTreeTableProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});
  const [expansionLevel, setExpansionLevel] = useState(4);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [colWidths, setColWidths] = useState<number[]>([...(tableView === 'explorer' ? EXPLORER_MIN_WIDTHS : MIN_COLUMN_WIDTHS)]);

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

  // Function to expand nodes to a specific level
  const expandToLevel = useCallback((nodes: TableRow[], targetLevel: number, currentLevel: number = 0): Record<string, boolean> => {
    const expandedState: Record<string, boolean> = {};

    const processNode = (node: TableRow, level: number) => {
      if (node.subRows && level < targetLevel) {
        expandedState[node.id] = true;
        node.subRows.forEach(child => processNode(child, level + 1));
      }
    };

    nodes.forEach(node => processNode(node, currentLevel));
    return expandedState;
  }, []);

  // Convert NavigationNode to TableRow format
  const convertToTableRows = (nodes: NavigationNode[]): TableRow[] => {
    return nodes.map(node => {
      const tableRow: TableRow = {
        ...node,
        subRows: node.children ? convertToTableRows(node.children) : undefined,
      };

      // Ensure parent folders are always visible when expanded
      if (node.children && node.children.length > 0) {
        tableRow.subRows = convertToTableRows(node.children);
      }

      return tableRow;
    });
  };

  const tableData = useMemo(() => convertToTableRows(data), [data]);

  // Update expanded state when expansion level changes
  const handleExpansionLevelChange = useCallback((level: number) => {
    setExpansionLevel(level);
    const newExpanded = expandToLevel(tableData, level);
    setExpanded(newExpanded);
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    }
  }, [tableData, expandToLevel, onExpandedChange]);

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
  }, [colWidths, currentMinWidths]);

  // Get work items for explorer view
  const getWorkItemsList = (req: any, type: 'tasks' | 'testCases' | 'issues' | 'signOffs' | 'ctas' | 'meetings') => {
    const items = req[type] || [];
    return items;
  };

  const capitalizeStatus = (status: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusConfig = (status: string, type: string) => {
    const s = status?.toLowerCase() || '';

    // Common mappings
    if (s === 'new') return { bg: 'bg-gray-400', text: 'text-gray-600' };
    if (s === 'active') return { bg: 'bg-blue-500', text: 'text-blue-700' };

    // Type specific mappings
    switch (type) {
      case 'tasks':
        if (s === 'completed') return { bg: 'bg-teal-500', text: 'text-teal-700' };
        if (s === 'approved') return { bg: 'bg-green-500', text: 'text-green-700' };
        break;
      case 'testCases': // Note: 'testCases' is passed, but in explorerColumns it might be 'testCases' matching the data key
        if (s === 'performed') return { bg: 'bg-teal-500', text: 'text-teal-700' };
        if (s === 'approved') return { bg: 'bg-green-500', text: 'text-green-700' };
        if (s === 'defect found' || s.includes('defect')) return { bg: 'bg-purple-500', text: 'text-purple-700' };
        break;
      case 'issues':
        if (s === 'resolved') return { bg: 'bg-teal-500', text: 'text-teal-700' };
        if (s === 'approved') return { bg: 'bg-green-500', text: 'text-green-700' };
        break;
      case 'signOffs':
        if (s === 'approved') return { bg: 'bg-teal-500', text: 'text-teal-700' }; // Teal for SignOff Approved
        if (s === 'rejected') return { bg: 'bg-red-500', text: 'text-red-700' };
        if (s === 'completed') return { bg: 'bg-teal-500', text: 'text-teal-700' };
        break;
      case 'ctas':
        if (s === 'pending') return { bg: 'bg-orange-500', text: 'text-orange-700' };
        if (s === 'completed') return { bg: 'bg-teal-500', text: 'text-teal-700' };
        break;
      case 'meetings':
        if (s === 'scheduled') return { bg: 'bg-blue-500', text: 'text-blue-700' };
        if (s === 'pending') return { bg: 'bg-orange-500', text: 'text-orange-700' };
        if (s === 'completed') return { bg: 'bg-teal-500', text: 'text-teal-700' };
        if (s === 'cancelled') return { bg: 'bg-red-500', text: 'text-red-700' };
        break;
    }

    // Fallbacks if not caught by specific cases
    if (['completed', 'done', 'performed', 'resolved'].includes(s)) return { bg: 'bg-teal-500', text: 'text-teal-700' };
    if (['approved'].includes(s)) return { bg: 'bg-green-500', text: 'text-green-700' };
    if (['pending'].includes(s)) return { bg: 'bg-orange-500', text: 'text-orange-700' };
    if (['blocked', 'rejected', 'cancelled'].includes(s)) return { bg: 'bg-red-500', text: 'text-red-700' };

    return { bg: 'bg-gray-400', text: 'text-gray-600' };
  };

  const renderWorkItemsList = (items: any[], type: string, total: number, rowId: string, columnId: string) => {
    if (total === 0) return <div className="text-xs text-muted-foreground">-</div>;

    const cellKey = `${rowId}-${columnId}`;
    const isExpanded = expandedCells[cellKey];
    const displayItems = isExpanded ? items : items.slice(0, 3);

    return (
      <div className="space-y-2">
        {displayItems.map((item: any, index: number) => {
          const config = getStatusConfig(item.status, type);
          const displayStatus = capitalizeStatus(item.status);

          return (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-md p-3 relative">
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${config.bg}`} />
              <div className="flex items-start justify-between ml-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {type === 'signOffs' ? item.role : (item.title || item.stakeholder)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.id}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${config.bg}`} />
                  <span className={`text-xs font-medium ${config.text}`}>
                    {displayStatus}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {total > 3 && (
          <div className="text-center py-2">
            <button
              className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 select-none bg-transparent border-none underline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpandedCells(prev => ({ ...prev, [cellKey]: !isExpanded }));
              }}
            >
              {isExpanded ? `Show less ▲` : `+${total - 3} more ▼`}
            </button>
          </div>
        )}
      </div>
    );
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
      { label: 'New', count: newItem.length, color: 'gray', items: newItem.map((s: any) => ({ id: s.id, title: s.role, status: `Due: ${s.dueDate}` })) },
      { label: 'Active', count: active.length, color: 'blue', items: active.map((s: any) => ({ id: s.id, title: s.role, status: `Due: ${s.dueDate}` })) },
      { label: 'Approved', count: approved.length, color: 'teal', items: approved.map((s: any) => ({ id: s.id, title: s.role, status: `Due: ${s.dueDate}` })) },
      { label: 'Rejected', count: rejected.length, color: 'red', items: rejected.map((s: any) => ({ id: s.id, title: s.role, status: `Due: ${s.dueDate}` })) },
      { label: 'Completed', count: completed.length, color: 'teal', items: completed.map((s: any) => ({ id: s.id, title: s.role, status: `Due: ${s.dueDate}` })) },
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

  // Initialize expansion to level 4 on mount
  useEffect(() => {
    if (tableData.length > 0) {
      const initialExpanded = expandToLevel(tableData, 4);
      setExpanded(initialExpanded);
      if (onExpandedChange) {
        onExpandedChange(initialExpanded);
      }
    }
  }, [tableData, expandToLevel, onExpandedChange]);

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
      columnHelper.accessor((row) => (row as any).source || '', {
        id: 'source',
        header: 'Source',
        cell: ({ row, getValue }) => {
          const isFolder = row.original.children !== undefined;
          if (isFolder) return <div />;
          const source = getValue() as string;
          return (
            <span className="text-sm text-muted-foreground" title={source}>
              {source || '-'}
            </span>
          );
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

    const tagsColumn = columnHelper.accessor((row) => (row as any).tags || [], {
      id: 'tags',
      header: 'Tags',
      cell: ({ row, getValue }) => {
        const isFolder = row.original.children !== undefined;
        const tags = getValue() as string[];
        const [isEditing, setIsEditing] = useState(false);
        const [newTag, setNewTag] = useState('');

        const handleAddTag = () => {
          if (newTag.trim() && !tags.includes(newTag.trim())) {
            const updatedTags = [...tags, newTag.trim()];
            // Update the data (in real app, this would be an API call)
            (row.original as any).tags = updatedTags;
            setNewTag('');
            setIsEditing(false);
          }
        };

        const handleRemoveTag = (tagToRemove: string) => {
          const updatedTags = tags.filter(tag => tag !== tagToRemove);
          (row.original as any).tags = updatedTags;
        };

        // Generate a consistent color based on the tag string
        const getTagColor = (tag: string) => {
          const colors = [
            'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
            'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
            'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
            'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
            'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
            'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
            'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
            'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
            'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
            'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
            'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
            'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
            'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100',
            'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
            'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
          ];

          let hash = 0;
          for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
          }

          return colors[Math.abs(hash) % colors.length];
        };

        if (!tags || tags.length === 0) {
          return (
            <div className="flex items-center gap-1">
              {/* <span className="text-xs text-muted-foreground">-</span> */}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800"
                onClick={() => setIsEditing(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              {isEditing && (
                <div className="flex items-center gap-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    className="h-6 w-20 text-xs"
                    placeholder="Tag"
                    autoFocus
                  />
                  <Button size="sm" className="h-6 px-2 text-xs" onClick={handleAddTag}>Add</Button>
                </div>
              )}
            </div>
          );
        }

        const maxTags = 4;
        const visibleTags = tags.slice(0, maxTags);
        const remainingCount = tags.length - maxTags;

        return (
          <div className="flex flex-wrap gap-1 items-center">
            {visibleTags.map((tag, index) => {
              const colorClass = getTagColor(tag);
              // Extract text color class for the X button (e.g., text-blue-700 -> text-blue-500)
              const baseColorMatch = colorClass.match(/text-([a-z]+)-700/);
              const baseColor = baseColorMatch ? baseColorMatch[1] : 'blue';
              const buttonHoverClass = `text-${baseColor}-500 hover:text-${baseColor}-800`;

              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`text-xs px-2 py-0.5 border group relative transition-colors ${colorClass}`}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className={`ml-1 opacity-0 group-hover:opacity-100 ${buttonHoverClass}`}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              );
            })}
            {remainingCount > 0 && (
              <button className="text-xs text-blue-600 hover:text-blue-800 underline">
                +{remainingCount} more
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800"
              onClick={() => setIsEditing(true)}
            >
              {/* <Plus className="h-3 w-3" /> */}
            </Button>
            {isEditing && (
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="h-6 w-20 text-xs"
                  placeholder="Tag"
                  autoFocus
                />
                <Button size="sm" className="h-6 px-2 text-xs" onClick={handleAddTag}>Add</Button>
              </div>
            )}
          </div>
        );
      },
    });

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
        header: 'Test Cases',
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
                title="Test Cases"
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
            <div className="text-xs font-medium">Tasks</div>
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
            <div className="text-xs font-medium">Test Cases</div>
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
            <div className="text-xs font-medium">Issues</div>
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
            <div className="text-xs font-medium">Sign-offs</div>
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
            <div className="text-xs font-medium">Events</div>
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

    return [...baseColumns, ...(tableView === 'explorer' ? explorerColumns : traceColumns), tagsColumn];
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
      const newExpanded = typeof updater === 'function' ? updater(expanded) : updater;
      console.log('Expanded state changed:', newExpanded);
      setExpanded(newExpanded);
      if (onExpandedChange) {
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
    enableExpanding: true,
    debugTable: false,
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
                onViewChange={() => { }}
                onFullscreenToggle={onFullscreenToggle}
                visibleColumns={visibleColumns || []}
                onColumnToggle={onColumnToggle || (() => { })}
                tableView={tableView}
                onTableViewChange={onTableViewChange}
                availableFolders={availableFolders}
                onFolderFilter={() => { }}
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
            <span className="text-sm text-muted-foreground">Showing 20 of 245 Items</span>
          </div>

          <div className="flex items-center gap-4">
            {onTableViewChange && (
              <div className="flex items-center border border-muted-foreground/20 rounded-md">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={tableView === 'trace' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 rounded-r-none border-r border-muted-foreground/20"
                        onClick={() => onTableViewChange('trace')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Trace View</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={tableView === 'explorer' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8 px-3 rounded-l-none"
                        onClick={() => onTableViewChange('explorer')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Matrix View</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
                      className={cn("sticky top-0 z-20 backdrop-blur-sm border-b border-r border-gray-300 px-4 py-2 text-left text-xs font-medium tracking-normal",
                        index === 0 ? "min-w-[200px]" :
                          index === 1 ? "whitespace-nowrap" :
                            index >= 2 && index <= 5 ? "text-center whitespace-nowrap" :
                              "text-center min-w-[100px]"
                      )}
                      style={{ width: colWidths[index], backgroundColor: '#F8F8F8', color: '#374151' }}
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
                  const isExpandedFolder = isFolder && row.getIsExpanded();

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "transition-all duration-200 hover:bg-muted/30",
                        row.getIsSelected() && "bg-blue-50/80",
                        isExpandedFolder && "bg-muted/20 opacity-70"
                      )}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2 align-top text-sm border-r border-border/20 last:border-r-0 overflow-hidden"
                          style={{ width: colWidths[cellIndex], maxWidth: colWidths[cellIndex] }}
                        >
                          <div className="truncate">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
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