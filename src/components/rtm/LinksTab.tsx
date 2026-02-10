import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Plus,
  GitBranch,
  Target,
  FileText,
  Code,
  TestTube,
  Bug,
  Rocket,
  Calendar,
  CheckSquare,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface LinksTabProps {
  requirementId: string;
}

interface LinkItem {
  id: string;
  title: string;
  type: string;
  workitemType: 'Tasks' | 'Test cases' | 'Issues' | 'Signoffs' | 'Meetings' | 'Requirements';
  status: 'active' | 'in-progress' | 'missing' | 'broken' | 'changed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  plannedTo: string;
  riskLevel?: 'high' | 'medium' | 'low';
  direction: 'upstream' | 'downstream';
}

const allLinks: LinkItem[] = [
  {
    id: 'BR-001',
    title: 'Calendar Integration Business Requirement',
    type: 'Business Requirement',
    workitemType: 'Requirements',
    status: 'active',
    priority: 'critical',
    owner: 'John Smith',
    plannedTo: '2025-01-10',
    riskLevel: 'low',
    direction: 'upstream'
  },
  {
    id: 'TASK-123',
    title: 'API Integration Planning Task',
    type: 'Task',
    workitemType: 'Tasks',
    status: 'active',
    priority: 'high',
    owner: 'Mike Davis',
    plannedTo: '2025-01-08',
    direction: 'upstream'
  },
  {
    id: 'MEET-456',
    title: 'Requirements Review Meeting',
    type: 'Meeting',
    workitemType: 'Meetings',
    status: 'active',
    priority: 'medium',
    owner: 'Lisa Wilson',
    plannedTo: '2025-01-07',
    direction: 'upstream'
  },
  {
    id: 'FS-089',
    title: 'Calendar Event Creation Functional Spec',
    type: 'Functional Requirement',
    workitemType: 'Requirements',
    status: 'active',
    priority: 'high',
    owner: 'Alice Brown',
    plannedTo: '2025-01-11',
    direction: 'downstream'
  },
  {
    id: 'TASK-234',
    title: 'Implement Calendar API Integration',
    type: 'Development Task',
    workitemType: 'Tasks',
    status: 'in-progress',
    priority: 'high',
    owner: 'Bob Wilson',
    plannedTo: '2025-01-10',
    direction: 'downstream'
  },
  {
    id: 'TC-234',
    title: 'Calendar Blocking Test Cases',
    type: 'Test Case',
    workitemType: 'Test cases',
    status: 'missing',
    priority: 'medium',
    owner: 'Lisa Chen',
    plannedTo: '2025-01-05',
    riskLevel: 'medium',
    direction: 'downstream'
  },
  {
    id: 'BUG-078',
    title: 'Calendar Sync Failure Issue',
    type: 'Bug',
    workitemType: 'Issues',
    status: 'broken',
    priority: 'critical',
    owner: 'Tom Anderson',
    plannedTo: '2025-01-12',
    riskLevel: 'high',
    direction: 'downstream'
  },
  {
    id: 'SIGN-045',
    title: 'Security Review Signoff',
    type: 'Approval',
    workitemType: 'Signoffs',
    status: 'in-progress',
    priority: 'high',
    owner: 'David Gray',
    plannedTo: '2025-01-09',
    direction: 'downstream'
  },
  {
    id: 'MEET-789',
    title: 'Implementation Planning Meeting',
    type: 'Meeting',
    workitemType: 'Meetings',
    status: 'active',
    priority: 'medium',
    owner: 'Emma White',
    plannedTo: '2025-01-08',
    direction: 'downstream'
  }
];

export const LinksTab = ({ requirementId }: LinksTabProps) => {

  const groupedLinks = allLinks.reduce((acc, link) => {
    if (!acc[link.workitemType]) {
      acc[link.workitemType] = [];
    }
    acc[link.workitemType].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  const workitemTypes = ['Requirements', 'Tasks', 'Test cases', 'Issues', 'Signoffs', 'Meetings'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e'; // green-500
      case 'in-progress': return '#3b82f6'; // blue-500
      case 'missing': return '#eab308'; // yellow-500
      case 'broken': return '#ef4444'; // red-500
      case 'changed': return '#f97316'; // orange-500
      default: return '#9ca3af'; // gray-400
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 font-semibold';
      case 'high': return 'text-orange-600 font-medium';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getWorkitemTypeIcon = (workitemType: string) => {
    switch (workitemType) {
      case 'Tasks': return <CheckSquare className="h-4 w-4" />;
      case 'Test cases': return <TestTube className="h-4 w-4" />;
      case 'Issues': return <Bug className="h-4 w-4" />;
      case 'Signoffs': return <CheckCircle className="h-4 w-4" />;
      case 'Meetings': return <Calendar className="h-4 w-4" />;
      case 'Requirements': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLinkType, setSelectedLinkType] = useState('Requirement');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 15;

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  // Filter items for the "Add Link" panel based on search and type
  const filteredItems = allLinks.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase());

    let targetType = selectedLinkType;
    if (selectedLinkType === 'Requirement') targetType = 'Requirements';
    else if (selectedLinkType === 'Task') targetType = 'Tasks';
    else if (selectedLinkType === 'Test Case') targetType = 'Test cases';
    else if (selectedLinkType === 'Issue') targetType = 'Issues';
    else if (selectedLinkType === 'Sign-off') targetType = 'Signoffs';
    else if (selectedLinkType === 'Meeting') targetType = 'Meetings';

    const matchesType = item.workitemType === targetType;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="px-6 pt-2 pb-6">
      <Tabs defaultValue="Requirements" className="w-full">
        <div className="flex items-center justify-between border-b mb-4">
          <TabsList className="justify-start border-b-0 rounded-none h-auto p-0 bg-transparent flex-1">
            {workitemTypes.map((type) => {
              const count = groupedLinks[type]?.length || 0;
              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    {getWorkitemTypeIcon(type)}
                    <span>{type}</span>
                    <span className="text-xs text-muted-foreground ml-1">({count})</span>
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>
          <div className="flex items-center gap-1 px-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Sheet modal={false} open={isSheetOpen} onOpenChange={(open) => {
              setIsSheetOpen(open);
              if (!open) setSelectedItems([]);
            }}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Link Item">
                  <Plus className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                onInteractOutside={(e) => e.preventDefault()}
                className="flex flex-col h-full sm:max-w-[600px] w-[600px] p-0"
              >
                <SheetHeader className="p-6 pb-2 flex-none">
                  <SheetTitle>Add Linked Item</SheetTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select items from the list below to link to this requirement.
                  </p>
                </SheetHeader>

                <div className="flex-1 flex flex-col min-h-0 px-6 pb-6">
                  {/* Filters */}
                  <div className="flex gap-4 mb-4 flex-none">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-sm font-medium">Link Type</label>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        value={selectedLinkType}
                        onChange={(e) => {
                          setSelectedLinkType(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option>Requirement</option>
                        <option>Task</option>
                        <option>Test Case</option>
                        <option>Issue</option>
                        <option>Meeting</option>
                        <option>Sign-off</option>
                      </select>
                    </div>

                    <div className="flex-[2] flex flex-col gap-2">
                      <label className="text-sm font-medium">Search Item</label>
                      <input
                        type="text"
                        placeholder="Search by ID or title..."
                        className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>

                  {/* Table Area - Takes remaining height */}
                  <div className="flex-1 border rounded-md relative overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-secondary/50 z-10 shadow-sm backdrop-blur-sm">
                          <TableRow className="hover:bg-transparent border-b-primary/10">
                            <TableHead className="w-[40px] bg-transparent pl-4"></TableHead>
                            <TableHead className="w-[100px] bg-transparent font-semibold text-foreground">ID</TableHead>
                            <TableHead className="bg-transparent font-semibold text-foreground">Title</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="pl-4 py-2">
                                <Checkbox
                                  checked={selectedItems.includes(item.id)}
                                  onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-xs py-2">{item.id}</TableCell>
                              <TableCell className="text-sm py-2" title={item.title}>
                                {item.title}
                              </TableCell>
                            </TableRow>
                          ))}
                          {paginatedItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-12 text-muted-foreground text-sm">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-10 w-10 text-muted-foreground/30 flex items-center justify-center">
                                    <Maximize2 className="h-8 w-8" />
                                  </div>
                                  <p className="font-medium">No items found</p>
                                  <p className="text-xs">Try adjusting your search or filters</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Footer: Pagination & Action */}
                  <div className="flex-none pt-4 space-y-4">
                    {/* Pagination */}
                    {filteredItems.length > 0 && (
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-muted-foreground">
                          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            Page {currentPage} of {totalPages}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-3 border-t mt-2 flex justify-end">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all font-medium"
                        disabled={selectedItems.length === 0}
                      >
                        {selectedItems.length > 0
                          ? `Link ${selectedItems.length} Item${selectedItems.length === 1 ? '' : 's'}`
                          : 'Link Items'}
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {workitemTypes.map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              {(groupedLinks[type] || []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Planned To</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedLinks[type].map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium text-xs">{link.id}</TableCell>
                        <TableCell className="font-medium text-sm truncate max-w-[300px]" title={link.title}>
                          {link.title}
                        </TableCell>
                        <TableCell>
                          <span
                            className="inline-flex items-center justify-center rounded px-2.5 py-0.5 text-xs font-medium text-white capitalize shadow-sm"
                            style={{ backgroundColor: getStatusColor(link.status) }}
                          >
                            {link.status.replace('-', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className={cn("text-xs capitalize", getPriorityColor(link.priority))}>
                          {link.priority}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{link.owner}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{link.plannedTo}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No {type.toLowerCase()} found</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs  >
    </div>
  );
};