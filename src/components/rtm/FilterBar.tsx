import { Download, Upload, Plus, Save, Eye, Search, ChevronDown, Pin, Maximize, RefreshCw, Filter } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface FilterBarProps {
  onViewChange: (view: string) => void;
}

interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  isPinned: boolean;
  width?: string;
}

export function FilterBar({ onViewChange }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPinMode, setShowPinMode] = useState(false);
  const [filters, setFilters] = useState<FilterOption[]>([
    {
      id: 'release',
      label: 'Release',
      options: [
        { value: 'all', label: 'All Releases' },
        { value: 'r1', label: 'Release 1.0' },
        { value: 'r2', label: 'Release 2.0' },
        { value: 'r3', label: 'Release 3.0' }
      ],
      isPinned: true,
      width: '140px'
    },
    {
      id: 'businessGroup',
      label: 'Business Group',
      options: [
        { value: 'all', label: 'All Groups' },
        { value: 'sales', label: 'Sales' },
        { value: 'finance', label: 'Finance' },
        { value: 'hr', label: 'Human Resources' },
        { value: 'ops', label: 'Operations' }
      ],
      isPinned: true,
      width: '160px'
    },
    {
      id: 'status',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'new', label: 'New' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'approved', label: 'Approved' }
      ],
      isPinned: true,
      width: '140px'
    },
    {
      id: 'owner',
      label: 'Owner',
      options: [
        { value: 'all', label: 'All Owners' },
        { value: 'john', label: 'John Smith' },
        { value: 'sarah', label: 'Sarah Johnson' },
        { value: 'emily', label: 'Emily Davis' },
        { value: 'alex', label: 'Alex Kumar' }
      ],
      isPinned: true,
      width: '140px'
    },
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { value: 'all', label: 'All Priorities' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ],
      isPinned: false,
      width: '140px'
    },
    {
      id: 'category',
      label: 'Category',
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'functional', label: 'Functional' },
        { value: 'technical', label: 'Technical' },
        { value: 'business', label: 'Business' }
      ],
      isPinned: false,
      width: '140px'
    }
  ]);

  const pinnedFilters = filters.filter(f => f.isPinned);
  const displayedFilters = isExpanded ? filters : pinnedFilters;

  const togglePin = (filterId: string) => {
    setFilters(prev => prev.map(f =>
      f.id === filterId ? { ...f, isPinned: !f.isPinned } : f
    ));
  };

  const renderFilter = (filter: FilterOption) => (
    <div key={filter.id} className="flex items-center gap-1">
      <Select defaultValue="all">
        <SelectTrigger
          className={cn(
            "h-8 text-sm border-muted-foreground/20 bg-background hover:border-muted-foreground/40 transition-colors",
            `w-[${filter.width}]`
          )}
          style={{ width: filter.width }}
        >
          <SelectValue placeholder={filter.label} />
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

  return (
    <div className="border-b border-border bg-muted/20 px-4 pt-2 pb-2">
      <div className="flex flex-col gap-2">
        {/* First Row: Filters and Icon Group */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Filters */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              {displayedFilters.map(filter => renderFilter(filter))}
            </div>
          </div>

          {/* Divider between filters and icon group */}
          <div className="h-8 w-px bg-border" />

          {/* Right: Icon Group - Fixed Position */}
          <div className="flex items-center gap-1 flex-shrink-0">
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

        {/* Second Row: Views and Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Saved Views and Export/Import */}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 border border-muted-foreground/20 hover:border-muted-foreground/40">
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
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
                <div className="border-t border-border mt-1 pt-1">
                  <DropdownMenuItem>
                    <Upload className="h-3 w-3 mr-2" />
                    Import Data
                  </DropdownMenuItem>
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
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Fullscreen">
              <Maximize className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 border border-muted-foreground/20 hover:border-muted-foreground/40" title="Advanced Filters">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
