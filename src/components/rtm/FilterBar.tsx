import { Download, Upload, Plus, Save, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface FilterBarProps {
  onViewChange: (view: string) => void;
}

export function FilterBar({ onViewChange }: FilterBarProps) {
  return (
    <div className="border-b border-border bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="Release" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Releases</SelectItem>
              <SelectItem value="r1">Release 1.0</SelectItem>
              <SelectItem value="r2">Release 2.0</SelectItem>
              <SelectItem value="r3">Release 3.0</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-[160px] text-sm">
              <SelectValue placeholder="Business Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="ops">Operations</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              <SelectItem value="john">John Smith</SelectItem>
              <SelectItem value="sarah">Sarah Johnson</SelectItem>
              <SelectItem value="emily">Emily Davis</SelectItem>
              <SelectItem value="alex">Alex Kumar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Eye className="h-4 w-4" />
                Admin View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewChange('admin')}>Admin View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange('tester')}>Tester View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange('business')}>Business View</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border mx-1" />

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Save className="h-4 w-4" />
            Save View
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export to Excel</DropdownMenuItem>
              <DropdownMenuItem>Export to CSV</DropdownMenuItem>
              <DropdownMenuItem>Export to PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Add Work Item
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Add Requirement</DropdownMenuItem>
              <DropdownMenuItem>Add Task</DropdownMenuItem>
              <DropdownMenuItem>Add Test Case</DropdownMenuItem>
              <DropdownMenuItem>Add Issue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search scopes, processes, requirements, tasks..."
            className="pl-10 h-9 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 w-full md:w-1/3"
          />
        </div>
      </div>
    </div>
  );
}
