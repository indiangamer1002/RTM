import { useState, useMemo } from 'react';
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
import { ChevronRight, ChevronDown, Folder, FileText, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { NavigationNode } from '@/types/rtm';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface RTMTreeTableProps {
  data: NavigationNode[];
  onRequirementSelect: (node: NavigationNode) => void;
}

interface TableRow extends NavigationNode {
  subRows?: TableRow[];
}

const columnHelper = createColumnHelper<TableRow>();

export function RTMTreeTable({ data, onRequirementSelect }: RTMTreeTableProps) {
  const [expanded, setExpanded] = useState({});
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);

  // Badge color utilities
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'Active': return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'New': return { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 border-green-200' };
      case 'Completed': return { variant: 'outline' as const, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'Approved': return { variant: 'outline' as const, className: 'bg-purple-100 text-purple-800 border-purple-200' };
      default: return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getPriorityBadgeProps = (priority: string) => {
    switch (priority) {
      case 'High': return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' };
      case 'Medium': return { variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'Low': return { variant: 'outline' as const, className: 'bg-gray-100 text-gray-600 border-gray-200' };
      default: return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getPhaseBadgeProps = (phase: string) => {
    switch (phase) {
      case 'identify': return { variant: 'outline' as const, className: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'analyze': return { variant: 'outline' as const, className: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'document': return { variant: 'outline' as const, className: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case 'approve': return { variant: 'outline' as const, className: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'design': return { variant: 'outline' as const, className: 'bg-pink-100 text-pink-700 border-pink-200' };
      case 'build': return { variant: 'outline' as const, className: 'bg-orange-100 text-orange-700 border-orange-200' };
      case 'test': return { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'release': return { variant: 'outline' as const, className: 'bg-green-100 text-green-700 border-green-200' };
      case 'support': return { variant: 'outline' as const, className: 'bg-teal-100 text-teal-700 border-teal-200' };
      default: return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const getCoverageBadgeProps = (coverage: string) => {
    switch (coverage) {
      case 'full': return { variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'partial': return { variant: 'outline' as const, className: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'none': return { variant: 'secondary' as const, className: 'bg-red-100 text-red-800 border-red-200' };
      default: return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // Convert NavigationNode to TableRow format
  const convertToTableRows = (nodes: NavigationNode[]): TableRow[] => {
    return nodes.map(node => ({
      ...node,
      subRows: node.children ? convertToTableRows(node.children) : undefined,
    }));
  };

  const tableData = useMemo(() => convertToTableRows(data), [data]);

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Name',
      cell: ({ row, getValue }) => {
        const isFolder = row.original.children !== undefined;
        const depth = row.depth;
        
        return (
          <div 
            className="flex items-center gap-2"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {isFolder && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={row.getToggleExpandedHandler()}
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!isFolder && <div className="w-6" />}
            
            {isFolder ? (
              <Folder className="h-4 w-4 text-muted-foreground" />
            ) : (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
            
            <button
              className="text-left hover:text-blue-600 transition-colors font-medium truncate"
              onClick={() => {
                if (!isFolder) {
                  onRequirementSelect(row.original);
                }
              }}
            >
              {getValue()}
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor('type', {
      id: 'type',
      header: 'Type',
      cell: ({ getValue }) => (
        <Badge variant="outline" className="text-xs">
          {getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('requirementStatus', {
      id: 'requirementStatus',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Status
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-3 w-3" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-2 h-3 w-3" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => {
        const status = getValue();
        if (!status) return null;
        const props = getStatusBadgeProps(status);
        return (
          <Badge {...props} className={cn('text-xs font-medium', props.className)}>
            {status}
          </Badge>
        );
      },
      filterFn: 'includesString',
    }),
    columnHelper.accessor('priority', {
      id: 'priority',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Priority
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-3 w-3" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-2 h-3 w-3" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => {
        const priority = getValue();
        if (!priority) return null;
        const props = getPriorityBadgeProps(priority);
        return (
          <Badge {...props} className={cn('text-xs font-medium', props.className)}>
            {priority}
          </Badge>
        );
      },
      filterFn: 'includesString',
    }),
    columnHelper.accessor('createdBy', {
      id: 'createdBy',
      header: 'Created By',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() || '-'}</span>
      ),
    }),
    columnHelper.accessor('createdOn', {
      id: 'createdOn',
      header: 'Created On',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() || '-'}</span>
      ),
    }),
    columnHelper.accessor('phase', {
      id: 'phase',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Phase
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-3 w-3" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-2 h-3 w-3" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => {
        const phase = getValue();
        if (!phase) return null;
        const props = getPhaseBadgeProps(phase);
        return (
          <Badge {...props} className={cn('text-xs font-medium capitalize', props.className)}>
            {phase}
          </Badge>
        );
      },
      filterFn: 'includesString',
    }),
    columnHelper.accessor('coverage', {
      id: 'coverage',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Coverage
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-3 w-3" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-2 h-3 w-3" />
          )}
        </Button>
      ),
      cell: ({ getValue }) => {
        const coverage = getValue();
        if (!coverage) return null;
        const props = getCoverageBadgeProps(coverage);
        return (
          <Badge {...props} className={cn('text-xs font-medium capitalize', props.className)}>
            {coverage}
          </Badge>
        );
      },
      filterFn: 'includesString',
    }),
  ], [onRequirementSelect]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      expanded,
      sorting,
      globalFilter,
      columnFilters,
    },
    onExpandedChange: setExpanded,
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
    <div className="w-full h-full flex flex-col bg-background">
      {/* Search Bar */}
      <div className="p-4 pb-2 flex-shrink-0">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search requirements..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 h-9 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="rounded-lg border border-border/60 shadow-sm bg-white overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border/40">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-semibold text-slate-700 bg-slate-50/80 first:rounded-tl-lg last:rounded-tr-lg border-r border-border/30 last:border-r-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-border/20 transition-all duration-200 hover:bg-slate-50/60",
                      row.getIsSelected() && "bg-blue-50/80",
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td 
                        key={cell.id} 
                        className="px-4 py-3 align-middle text-sm border-r border-border/20 last:border-r-0 font-medium text-slate-700"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
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