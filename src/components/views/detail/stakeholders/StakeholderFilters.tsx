import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StakeholderFiltersProps {
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onDeptChange: (value: string) => void;
  activeFilters: {
      search: string;
      role?: string;
      department?: string;
  };
  onClear: () => void;
}

export const StakeholderFilters = ({ 
    onSearchChange, 
    onRoleChange, 
    onDeptChange,
    activeFilters,
    onClear
}: StakeholderFiltersProps) => {
  const hasActiveFilters = activeFilters.role || activeFilters.department || activeFilters.search;

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b">
        {/* Search */}
        <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search stakeholders..." 
                className="pl-9"
                value={activeFilters.search}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <Select value={activeFilters.role || "all"} onValueChange={(val) => onRoleChange(val === "all" ? "" : val)}>
                 <SelectTrigger className="w-[140px]">
                     <SelectValue placeholder="Role" />
                 </SelectTrigger>
                 <SelectContent>
                     <SelectItem value="all">All Roles</SelectItem>
                     <SelectItem value="Product Manager">Product Manager</SelectItem>
                     <SelectItem value="Tech Lead">Tech Lead</SelectItem>
                     <SelectItem value="Senior Developer">Senior Dev</SelectItem>
                 </SelectContent>
             </Select>

             <Select value={activeFilters.department || "all"} onValueChange={(val) => onDeptChange(val === "all" ? "" : val)}>
                 <SelectTrigger className="w-[140px]">
                     <SelectValue placeholder="Department" />
                 </SelectTrigger>
                 <SelectContent>
                     <SelectItem value="all">All Depts</SelectItem>
                     <SelectItem value="Product">Product</SelectItem>
                     <SelectItem value="Backend Team">Backend</SelectItem>
                     <SelectItem value="QA Team">QA</SelectItem>
                 </SelectContent>
             </Select>

             {/* Clear Button */}
             {hasActiveFilters && (
                 <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-foreground">
                     <X className="h-4 w-4 mr-1" /> Clear
                 </Button>
             )}
        </div>
    </div>
  );
};
