import { Download, Upload, Plus, Save, Eye, Search, ChevronDown, Pin, Maximize, RefreshCw, Filter, X, RotateCcw, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  onViewChange: (view: string) => void;
  onFullscreenToggle?: () => void;
  visibleColumns: string[];
  onColumnToggle: (column: string) => void;
}

interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
  isPinned: boolean;
  width?: string;
}

export function FilterBar({ onViewChange, onFullscreenToggle, visibleColumns, onColumnToggle }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPinMode, setShowPinMode] = useState(false);
  const [filters, setFilters] = useState<FilterOption[]>([
    {
      id: 'search',
      label: 'Requirement ID / Title',
      options: [],
      isPinned: true,
      width: '220px'
    },
    {
      id: 'lifecycle-phase',
      label: 'Lifecycle Stage',
      options: [
        { value: 'identify', label: 'Identify', count: 23 },
        { value: 'analyze', label: 'Analyze', count: 45 },
        { value: 'document', label: 'Document', count: 67 },
        { value: 'approve', label: 'Approve', count: 34 },
        { value: 'design', label: 'Design', count: 56 },
        { value: 'build', label: 'Build', count: 78 },
        { value: 'test', label: 'Test', count: 43 },
        { value: 'release', label: 'Release', count: 21 },
        { value: 'support', label: 'Support / Retired', count: 12 }
      ],
      isPinned: true,
      width: '190px'
    },
    {
      id: 'approval-status',
      label: 'Approval Status',
      options: [
        { value: 'pending', label: 'Pending Approval', count: 34 },
        { value: 'approved', label: 'Approved', count: 234 },
        { value: 'rejected', label: 'Rejected', count: 12 },
        { value: 'deferred', label: 'Deferred', count: 8 },
        { value: 'baseline', label: 'Baseline Created', count: 156 }
      ],
      isPinned: true,
      width: '170px'
    },
    {
      id: 'requirement-type',
      label: 'Requirement Type',
      options: [
        { value: 'business', label: 'Business Requirement', count: 45 },
        { value: 'functional', label: 'Functional Requirement', count: 128 },
        { value: 'non-functional', label: 'Non-Functional Requirement', count: 67 },
        { value: 'compliance', label: 'Compliance / Regulatory', count: 23 },
        { value: 'technical', label: 'Technical Requirement', count: 89 },
        { value: 'change-request', label: 'Change Request', count: 34 }
      ],
      isPinned: true,
      width: '190px'
    },
    {
      id: 'implementation-type',
      label: 'Solution Type',
      options: [
        { value: 'configuration', label: 'Configuration', count: 67 },
        { value: 'custom-dev', label: 'Custom Development', count: 123 },
        { value: 'enhancement', label: 'Enhancement', count: 45 },
        { value: 'integration', label: 'Integration', count: 34 },
        { value: 'workflow', label: 'Workflow', count: 23 }
      ],
      isPinned: false,
      width: '180px'
    },
    {
      id: 'traceability-status',
      label: 'Traceability Status',
      options: [
        { value: 'fully-traced', label: 'Fully Traced', count: 145 },
        { value: 'partially-traced', label: 'Partially Traced', count: 78 },
        { value: 'missing-design', label: 'Missing Design Mapping', count: 21 },
        { value: 'missing-build', label: 'Missing Development Mapping', count: 34 },
        { value: 'missing-test', label: 'Missing Test Cases', count: 29 },
        { value: 'missing-release', label: 'Missing Release Mapping', count: 17 }
      ],
      isPinned: false,
      width: '200px'
    },
    {
      id: 'release-version',
      label: 'Release Version',
      options: [
        { value: 'rel-1.0', label: 'Release 1.0', count: 56 },
        { value: 'rel-1.1', label: 'Release 1.1', count: 78 },
        { value: 'hotfix', label: 'Hotfix', count: 14 },
        { value: 'future', label: 'Future Release', count: 92 },
        { value: 'not-released', label: 'Not Released', count: 121 }
      ],
      isPinned: false,
      width: '170px'
    },
    {
      id: 'owner',
      label: 'Owner / Responsible',
      options: [
        { value: 'business', label: 'Business Owner', count: 48 },
        { value: 'product', label: 'Product Owner', count: 62 },
        { value: 'functional', label: 'Functional Consultant', count: 97 },
        { value: 'technical', label: 'Developer', count: 134 },
        { value: 'qa', label: 'Tester', count: 59 }
      ],
      isPinned: false,
      width: '190px'
    },
    {
      id: 'compliance-category',
      label: 'Compliance Category',
      options: [
        { value: 'sox', label: 'SOX', count: 18 },
        { value: 'gdpr', label: 'GDPR', count: 26 },
        { value: 'iso', label: 'ISO', count: 14 },
        { value: 'internal-policy', label: 'Internal Policy', count: 33 },
        { value: 'customer-contract', label: 'Customer Contract', count: 21 },
        { value: 'not-applicable', label: 'Not Applicable', count: 176 }
      ],
      isPinned: false,
      width: '190px'
    },
    {
      id: 'risk-level',
      label: 'Risk Level',
      options: [
        { value: 'high', label: 'High Risk', count: 19 },
        { value: 'medium', label: 'Medium Risk', count: 48 },
        { value: 'low', label: 'Low Risk', count: 112 },
        { value: 'none', label: 'No Risk Identified', count: 137 }
      ],
      isPinned: false,
      width: '150px'
    },
    {
      id: 'change-impact',
      label: 'Change Impact',
      options: [
        { value: 'changed-after-approval', label: 'Changed After Approval', count: 23 },
        { value: 'has-open-cr', label: 'Has Open Change Request', count: 41 },
        { value: 'versioned', label: 'Version > 1.0', count: 67 },
        { value: 'retired', label: 'Retired Requirement', count: 12 }
      ],
      isPinned: false,
      width: '180px'
    },
    {
      id: 'lifecycle-status',
      label: 'Stage Status',
      options: [
        { value: 'not-started', label: 'Not Started', count: 45 },
        { value: 'in-progress', label: 'In Progress', count: 123 },
        { value: 'blocked', label: 'Blocked', count: 18 },
        { value: 'completed', label: 'Completed', count: 167 },
        { value: 'failed', label: 'Failed', count: 8 },
        { value: 'deferred', label: 'Deferred', count: 23 }
      ],
      isPinned: false,
      width: '160px'
    },
    {
      id: 'iteration',
      label: 'Sprint / Release Cycle',
      options: [
        { value: 'sprint-1', label: 'Sprint 1', count: 45 },
        { value: 'sprint-2', label: 'Sprint 2', count: 67 },
        { value: 'sprint-3', label: 'Sprint 3', count: 34 },
        { value: 'backlog', label: 'Backlog', count: 123 },
        { value: 'unassigned', label: 'Unassigned', count: 78 }
      ],
      isPinned: false,
      width: '160px'
    },
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { value: 'critical', label: 'Critical', count: 18 },
        { value: 'high', label: 'High', count: 67 },
        { value: 'medium', label: 'Medium', count: 156 },
        { value: 'low', label: 'Low', count: 94 }
      ],
      isPinned: false,
      width: '150px'
    },
    {
      id: 'tags',
      label: 'Tags',
      options: [
        { value: 'security', label: 'Security', count: 15 },
        { value: 'performance', label: 'Performance', count: 8 },
        { value: 'ui-ux', label: 'UI/UX', count: 12 },
        { value: 'integration', label: 'Integration', count: 6 }
      ],
      isPinned: false,
      width: '150px'
    }
  ]);

  const pinnedFilters = filters.filter(f => f.isPinned);

  const togglePin = (filterId: string) => {
    setFilters(prev => prev.map(f =>
      f.id === filterId ? { ...f, isPinned: !f.isPinned } : f
    ));
  };

  const renderDropdownFilter = (filter: FilterOption) => {
    if (filter.id === 'search') {
      return (
        <div key={filter.id} className="flex items-center gap-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requirements by ID or title..."
              className="h-8 pl-8 pr-3 text-sm border-muted-foreground/20 bg-background hover:border-muted-foreground/40 transition-colors w-80"
            />
          </div>
          {showPinMode && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded transition-colors",
                filter.isPinned ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => togglePin(filter.id)}
            >
              <Pin className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div key={filter.id} className="flex items-center gap-1">
        <Select defaultValue={filter.options[0]?.value}>
          <SelectTrigger
            className={cn(
              "h-8 text-sm border-muted-foreground/20 bg-background hover:border-muted-foreground/40 transition-colors",
              `w-[${filter.width}]`
            )}
            style={{ width: filter.width }}
          >
            <SelectValue placeholder={`Select ${filter.label}`} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showPinMode && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 rounded transition-colors",
              filter.isPinned ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => togglePin(filter.id)}
          >
            <Pin className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const renderSlicerFilter = (filter: FilterOption) => (
    <div key={filter.id} className="bg-white border border-border rounded-lg p-3 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">{filter.label}</h4>
        {showPinMode && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-5 w-5 rounded transition-colors",
              filter.isPinned ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => togglePin(filter.id)}
          >
            <Pin className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="h-7 pl-7 text-xs border-muted-foreground/20"
        />
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        <div className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 border-b border-border mb-1">
          <div className="flex items-center space-x-2">
            <RotateCcw className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Clear All</span>
          </div>
        </div>
        {filter.options.map(option => (
          <div key={option.value} className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1">
            <div className="flex items-center space-x-2">
              <Checkbox id={`${filter.id}-${option.value}`} className="h-3 w-3" />
              <label
                htmlFor={`${filter.id}-${option.value}`}
                className="text-xs cursor-pointer flex-1"
              >
                {option.label}
              </label>
            </div>
            {option.count !== undefined && (
              <span className="text-xs text-muted-foreground ml-2">{option.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "border-b border-border bg-muted/20 px-4 transition-all duration-200",
      isExpanded ? "pt-2 pb-4" : "pt-2 pb-2"
    )}>
      <div className="flex flex-col gap-2">
        {/* Collapsed/Pinned Mode: Dropdown Filters */}
        {!isExpanded && (
          <>
            {/* First Row: Filters and Icon Group */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: Filters */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {pinnedFilters.map(filter => renderDropdownFilter(filter))}
                </div>
              </div>

              {/* Divider between filters and icon group */}
              <div className="h-8 w-px bg-border" />

              {/* Right: Icon Group - Fixed Position */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Clear All Filters">
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded bg-muted/50 border border-border hover:bg-muted"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Show less filters' : 'Show more filters'}
                >
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded bg-muted/50 border border-border hover:bg-muted transition-colors",
                    showPinMode && "bg-primary/10 border-primary/20"
                  )}
                  onClick={() => setShowPinMode(!showPinMode)}
                  title="Toggle pin mode"
                >
                  <Pin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Divider between first and second row */}
            <div className="w-full h-px bg-border" />
          </>
        )}

        {/* Expanded Mode: Slicers View */}
        {isExpanded && (
          <>
            {/* Header with controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Filter Slicers</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="Clear All Filters">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded bg-muted/50 border border-border hover:bg-muted transition-colors",
                    showPinMode && "bg-primary/10 border-primary/20"
                  )}
                  onClick={() => setShowPinMode(!showPinMode)}
                  title="Toggle pin mode"
                >
                  <Pin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded bg-muted/50 border border-border hover:bg-muted"
                  onClick={() => setIsExpanded(false)}
                  title="Collapse filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Slicers - Single Row Horizontal Scroll */}
            <div className="mb-4">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {filters.map(filter => (
                  <div key={filter.id} className="flex-shrink-0 w-64">
                    {renderSlicerFilter(filter)}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-border" />
          </>
        )}

        {/* Second Row: Views and Action Buttons - Always visible */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Saved Views */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 border border-muted-foreground/20 hover:border-muted-foreground/40">
                  <Eye className="h-4 w-4" />
                  Admin View
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => onViewChange('admin')}>Admin View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('tester')}>Tester View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('business')}>Business View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('filtered')}>Filtered View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange('sorted')}>Sorted View</DropdownMenuItem>
                <div className="border-t border-border mt-1 pt-1">
                  <div className="flex items-center gap-1">
                    <DropdownMenuItem className="text-primary flex-1">
                      <Plus className="h-3 w-3 mr-2" />
                      Add View
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-primary flex-1">
                      <Save className="h-3 w-3 mr-2" />
                      Save As
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center: Item Count */}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">Showing 20 of 435 Items</span>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Advanced Filters">
              <Filter className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Import">
              <Upload className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Export">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="h-3 w-3 mr-2" />
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-3 w-3 mr-2" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-3 w-3 mr-2" />
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40"
              title="Fullscreen"
              onClick={onFullscreenToggle}
            >
              <Maximize className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Advanced Filters">
              <Filter className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Columns">
                  <Layout className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {[
                  "Req ID", "Req Title", "Type", "Source Owner", "Priority", "Status",
                  "Task", "TESTCASES", "Issues", "Sign-offs", "CTA", "Meetings"
                ].map((col) => (
                  <div key={col} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer" onClick={() => onColumnToggle(col)}>
                    <Checkbox checked={visibleColumns.includes(col)} id={`col-${col}`} />
                    <label htmlFor={`col-${col}`} className="text-xs flex-1 cursor-pointer">{col}</label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}