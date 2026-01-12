import { useState, useEffect } from 'react';
import { Stakeholder } from '@/types/stakeholder.types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
    MoreVertical, 
    Mail, 
    Shield, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    MinusCircle,
    Users,
    CheckSquare,
    Square,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

interface StakeholderListProps {
  stakeholders: Stakeholder[];
  viewMode: 'grid' | 'list';
  onRemove: (id: string) => void;
  onApprove?: (id: string) => void;
  currentUserId?: string;
}

const ITEMS_PER_PAGE = 12; // For grid view
const LIST_ITEMS_PER_PAGE = 20; // For list view

const getInvolvementColor = (level: string) => {
    switch (level) {
        case 'owner': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'approver': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'reviewer': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

const ApprovalStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'approved': 
            return <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs"><CheckCircle2 className="h-4 w-4" /> Approved</div>;
        case 'rejected': 
            return <div className="flex items-center gap-1.5 text-red-600 font-medium text-xs"><XCircle className="h-4 w-4" /> Rejected</div>;
        case 'pending': 
            return <div className="flex items-center gap-1.5 text-amber-600 font-medium text-xs"><Clock className="h-4 w-4" /> Pending</div>;
        default: 
            return <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs"><MinusCircle className="h-4 w-4" /> Not Required</div>;
    }
};

// Mock task data - in real app this would come from props or API
const getStakeholderTasks = (stakeholder: Stakeholder) => {
    const tasksByRole = {
        'Product Manager': [
            { id: 1, title: 'Review API requirements', completed: true },
            { id: 2, title: 'Approve calendar integration scope', completed: false },
            { id: 3, title: 'Define acceptance criteria', completed: true },
            { id: 4, title: 'Coordinate with Outlook team', completed: false }
        ],
        'Tech Lead': [
            { id: 1, title: 'Architecture review', completed: true },
            { id: 2, title: 'Technical feasibility assessment', completed: true },
            { id: 3, title: 'Code review and approval', completed: false },
            { id: 4, title: 'Performance impact analysis', completed: false }
        ],
        'Senior Developer': [
            { id: 1, title: 'Implement calendar API integration', completed: false },
            { id: 2, title: 'Write unit tests', completed: false },
            { id: 3, title: 'Update documentation', completed: false },
            { id: 4, title: 'Handle error scenarios', completed: false }
        ]
    };
    
    return tasksByRole[stakeholder.role as keyof typeof tasksByRole] || [
        { id: 1, title: 'Review requirement details', completed: false },
        { id: 2, title: 'Provide feedback', completed: false }
    ];
};

const TaskTooltip = ({ stakeholder }: { stakeholder: Stakeholder }) => {
    const tasks = getStakeholderTasks(stakeholder);
    const completedTasks = tasks.filter(t => t.completed).length;
    
    return (
        <div className="w-80 p-4 bg-white border border-border shadow-xl rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs font-bold bg-slate-100">
                            {stakeholder.name.split(' ').map(n=>n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-sm text-foreground">{stakeholder.name}</h4>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {completedTasks}/{tasks.length} done
                </span>
            </div>
            
            <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-2.5 text-sm group">
                        {task.completed ? (
                            <CheckSquare className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <Square className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                            "leading-relaxed",
                            task.completed ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                            {task.title}
                        </span>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Progress</span>
                    <span className="text-xs font-semibold text-foreground">
                        {Math.round((completedTasks / tasks.length) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                    <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    totalItems,
    itemsPerPage,
    viewMode 
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    viewMode: 'grid' | 'list';
}) => {
    if (totalPages <= 1) return null;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
                Showing {startItem}-{endItem} of {totalItems} stakeholders
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(pageNum)}
                                className="h-8 w-8 p-0"
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                </div>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export const StakeholderList = ({ stakeholders, viewMode, onRemove, onApprove }: StakeholderListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = viewMode === 'grid' ? ITEMS_PER_PAGE : LIST_ITEMS_PER_PAGE;
  const totalPages = Math.ceil(stakeholders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStakeholders = stakeholders.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when stakeholders change (e.g., filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [stakeholders.length]);

  const ActionsMenu = ({ stakeholder }: { stakeholder: Stakeholder }) => (
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-4 w-4" />
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(`mailto:${stakeholder.email}`)}>
                  <Mail className="h-4 w-4 mr-2" /> Email Stakeholder
              </DropdownMenuItem>
              {stakeholder.approvalStatus === 'pending' && onApprove && (
                  <DropdownMenuItem onClick={() => onApprove(stakeholder.id)} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Request
                  </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                  <Shield className="h-4 w-4 mr-2" /> Change Role
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => onRemove(stakeholder.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Remove Team Member
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
  );

  if (stakeholders.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-slate-50 border-dashed text-center">
              <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                  <Users className="h-6 w-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-medium text-foreground">No stakeholders assigned</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Add team members to track ownership, reviews, and approvals for this requirement.
              </p>
          </div>
      );
  }

  // --- GRID VIEW ---
  if (viewMode === 'grid') {
      return (
          <TooltipProvider>
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedStakeholders.map((person) => {
                          const tasks = getStakeholderTasks(person);
                          const completedTasks = tasks.filter(t => t.completed).length;
                          
                          return (
                              <Tooltip key={person.id}>
                                  <TooltipTrigger asChild>
                                      <div className="group border rounded-lg bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all relative cursor-pointer">
                                          <div className="flex justify-between items-start mb-3">
                                              <div className="flex items-center gap-3">
                                                  <Avatar className="h-10 w-10 border bg-white">
                                                      <AvatarFallback className={cn("text-xs font-bold", `bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600`)}>
                                                          {person.name.split(' ').map(n=>n[0]).join('')}
                                                      </AvatarFallback>
                                                  </Avatar>
                                                  <div>
                                                      <h4 className="text-sm font-semibold leading-none mb-1">{person.name}</h4>
                                                      <p className="text-xs text-muted-foreground">{person.role}</p>
                                                  </div>
                                              </div>
                                              <ActionsMenu stakeholder={person} />
                                          </div>
                                          
                                          <div className="space-y-3">
                                              <div className="grid grid-cols-2 gap-2 text-xs">
                                                   <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                       <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-0.5">Dept</span>
                                                       <span className="font-medium">{person.department}</span>
                                                   </div>
                                                   <div className={cn("p-2 rounded border", getInvolvementColor(person.involvementLevel))}>
                                                       <span className="text-[10px] opacity-70 uppercase tracking-wider block mb-0.5">Role</span>
                                                       <span className="font-medium capitalize">{person.involvementLevel}</span>
                                                   </div>
                                              </div>
                                              
                                              <div className="pt-3 border-t space-y-2">
                                                  <div className="flex items-center justify-between">
                                                      <span className="text-xs text-muted-foreground">Status</span>
                                                      <ApprovalStatusBadge status={person.approvalStatus} />
                                                  </div>
                                                  <div className="flex items-center justify-between">
                                                      <span className="text-xs text-muted-foreground">Tasks</span>
                                                      <span className="text-xs font-medium">{completedTasks}/{tasks.length}</span>
                                                  </div>
                                                  <div className="w-full bg-muted rounded-full h-1">
                                                      <div 
                                                          className="bg-primary h-1 rounded-full transition-all" 
                                                          style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                                                      />
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="p-0 border-0 shadow-none bg-transparent">
                                      <TaskTooltip stakeholder={person} />
                                  </TooltipContent>
                              </Tooltip>
                          );
                      })}
                  </div>
                  
                  <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={stakeholders.length}
                      itemsPerPage={itemsPerPage}
                      viewMode={viewMode}
                  />
              </div>
          </TooltipProvider>
      );
  }

  // --- LIST VIEW ---
  return (
      <TooltipProvider>
          <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                  <Table>
                      <TableHeader>
                          <TableRow className="bg-slate-50/50">
                              <TableHead>Stakeholder</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Involvement</TableHead>
                              <TableHead>Tasks</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {paginatedStakeholders.map((person) => {
                              const tasks = getStakeholderTasks(person);
                              const completedTasks = tasks.filter(t => t.completed).length;
                              
                              return (
                                  <Tooltip key={person.id}>
                                      <TooltipTrigger asChild>
                                          <TableRow className="group cursor-pointer hover:bg-muted/50">
                                              <TableCell>
                                                  <div className="flex items-center gap-3">
                                                      <Avatar className="h-8 w-8 border bg-white">
                                                          <AvatarFallback className="text-[10px] font-bold bg-slate-100">
                                                              {person.name.split(' ').map(n=>n[0]).join('')}
                                                          </AvatarFallback>
                                                      </Avatar>
                                                      <div>
                                                          <div className="font-medium text-sm">{person.name}</div>
                                                          <div className="text-[11px] text-muted-foreground">{person.email}</div>
                                                      </div>
                                                  </div>
                                              </TableCell>
                                              <TableCell>
                                                  <div className="text-xs">
                                                      <div className="font-medium">{person.role}</div>
                                                      <div className="text-muted-foreground">{person.department}</div>
                                                  </div>
                                              </TableCell>
                                              <TableCell>
                                                  <Badge variant="outline" className={cn("capitalize font-normal", getInvolvementColor(person.involvementLevel))}>
                                                      {person.involvementLevel}
                                                  </Badge>
                                              </TableCell>
                                              <TableCell>
                                                  <div className="flex items-center gap-2">
                                                      <span className="text-xs font-medium">{completedTasks}/{tasks.length}</span>
                                                      <div className="w-16 bg-muted rounded-full h-1">
                                                          <div 
                                                              className="bg-primary h-1 rounded-full transition-all" 
                                                              style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                                                          />
                                                      </div>
                                                  </div>
                                              </TableCell>
                                              <TableCell>
                                                  <ApprovalStatusBadge status={person.approvalStatus} />
                                              </TableCell>
                                              <TableCell>
                                                  <ActionsMenu stakeholder={person} />
                                              </TableCell>
                                          </TableRow>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="p-0 border-0 shadow-none bg-transparent">
                                          <TaskTooltip stakeholder={person} />
                                      </TooltipContent>
                                  </Tooltip>
                              );
                          })}
                      </TableBody>
                  </Table>
              </div>
              
              <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={stakeholders.length}
                  itemsPerPage={itemsPerPage}
                  viewMode={viewMode}
              />
          </div>
      </TooltipProvider>
  );
};