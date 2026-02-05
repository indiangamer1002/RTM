import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Search,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  ClipboardCheck,
  Bug,
  Calendar,
  ListChecks,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnlinkedItem, mockUnlinkedItems } from '@/data/unlinkedItems';
import { requirementsData } from '@/data/mockData';
import { RequirementSelector } from '@/components/dialogs/RequirementSelector';
import { toast } from 'sonner';

type ItemType = 'TestCase' | 'Task' | 'Issue' | 'SignOff' | 'Meeting';

interface ItemWithLinking extends UnlinkedItem {
  linkedReqId?: string;
  linkedReqTitle?: string;
  aiScore?: number;
  aiReqId?: string;
  aiReqTitle?: string;
  aiReqNumber?: string;
  aiAccepted?: boolean; // true = accepted, false = rejected, undefined = pending
}

// Generate mock data for bulk testing (simulating 1000+ items per type)
const generateBulkMockData = (): ItemWithLinking[] => {
  const types: ItemType[] = ['TestCase', 'Task', 'Issue', 'SignOff', 'Meeting'];
  const priorities = ['High', 'Medium', 'Low'] as const;
  const statuses = ['New', 'Active', 'Completed', 'Pending'];
  
  const baseItems: ItemWithLinking[] = mockUnlinkedItems.map(item => ({
    ...item,
    linkedReqId: undefined,
    linkedReqTitle: undefined
  }));

  // Generate additional items for bulk testing
  const additionalItems: ItemWithLinking[] = [];
  
  types.forEach(type => {
    for (let i = 1; i <= 150; i++) {
      const isLinked = Math.random() > 0.7; // 30% are already linked
      const linkedReq = isLinked ? requirementsData[Math.floor(Math.random() * requirementsData.length)] : null;
      
      additionalItems.push({
        id: `bulk-${type.toLowerCase()}-${i}`,
        title: `${type} Item ${i} - ${generateRandomTitle(type)}`,
        type: type,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        assignee: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Wilson', 'Alex Kumar'][Math.floor(Math.random() * 5)],
        dueDate: `2025-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        createdOn: `2025-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        description: `Description for ${type} item ${i}. This is a sample description for testing bulk operations.`,
        linkedReqId: linkedReq?.id,
        linkedReqTitle: linkedReq?.title
      });
    }
  });

  return [...baseItems, ...additionalItems];
};

const generateRandomTitle = (type: ItemType): string => {
  const titles: Record<ItemType, string[]> = {
    TestCase: ['Login Validation', 'Payment Flow', 'User Registration', 'API Response', 'Data Export', 'Search Functionality', 'Performance Test', 'Security Scan'],
    Task: ['Implement Feature', 'Fix Bug', 'Update Documentation', 'Code Review', 'Database Migration', 'UI Enhancement', 'API Integration', 'Testing'],
    Issue: ['UI Glitch', 'Performance Lag', 'Data Mismatch', 'Auth Failure', 'Memory Leak', 'Timeout Error', 'Validation Issue', 'CSS Bug'],
    SignOff: ['Release Approval', 'Security Review', 'Compliance Check', 'UAT Complete', 'Go-Live', 'Design Review', 'Code Freeze', 'Deployment'],
    Meeting: ['Sprint Planning', 'Daily Standup', 'Retrospective', 'Demo Session', 'Stakeholder Review', 'Technical Discussion', 'Kickoff', 'Review']
  };
  return titles[type][Math.floor(Math.random() * titles[type].length)];
};

const GapAnalysisPage = () => {
  const navigate = useNavigate();
  const [allItems] = useState<ItemWithLinking[]>(generateBulkMockData);
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [linkFilter, setLinkFilter] = useState<'all' | 'linked' | 'unlinked'>('unlinked');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [linkingItem, setLinkingItem] = useState<string | null>(null);
  
  const pageSize = 50;

  // Get type icon
  const getTypeIcon = (type: ItemType | 'all') => {
    switch (type) {
      case 'TestCase': return <ClipboardCheck className="h-4 w-4" />;
      case 'Task': return <ListChecks className="h-4 w-4" />;
      case 'Issue': return <Bug className="h-4 w-4" />;
      case 'SignOff': return <CheckCircle2 className="h-4 w-4" />;
      case 'Meeting': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Calculate counts per type
  const typeCounts = useMemo(() => {
    const counts = { all: 0, TestCase: 0, Task: 0, Issue: 0, SignOff: 0, Meeting: 0 };
    allItems.forEach(item => {
      if (linkFilter === 'all' || 
          (linkFilter === 'linked' && item.linkedReqId) || 
          (linkFilter === 'unlinked' && !item.linkedReqId)) {
        counts[item.type]++;
        counts.all++;
      }
    });
    return counts;
  }, [allItems, linkFilter]);

  // Filter and paginate items
  const { filteredItems, totalPages, displayItems } = useMemo(() => {
    let filtered = allItems;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by link status
    if (linkFilter === 'linked') {
      filtered = filtered.filter(item => item.linkedReqId);
    } else if (linkFilter === 'unlinked') {
      filtered = filtered.filter(item => !item.linkedReqId);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }

    const total = Math.ceil(filtered.length / pageSize);
    const start = (page - 1) * pageSize;
    const display = filtered.slice(start, start + pageSize);

    return { filteredItems: filtered, totalPages: total, displayItems: display };
  }, [allItems, selectedType, linkFilter, statusFilter, searchTerm, page]);

  // Handle selection
  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(displayItems.map(i => i.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle linking
  const handleLinkItem = useCallback((itemId: string, reqId: string, reqTitle: string) => {
    // Update item with linking
    const itemIndex = allItems.findIndex(i => i.id === itemId);
    if (itemIndex !== -1) {
      allItems[itemIndex].linkedReqId = reqId;
      allItems[itemIndex].linkedReqTitle = reqTitle;
    }
    setLinkingItem(null);
    toast.success(`Linked to ${reqTitle}`);
  }, [allItems]);

  // Handle batch AI analysis
  const handleBatchAnalyze = async () => {
    if (selectedItems.size === 0) {
      toast.warning('Select items to analyze');
      return;
    }

    setAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    selectedItems.forEach(id => {
      const item = allItems.find(i => i.id === id);
      if (item && !item.linkedReqId) {
        const randomReq = requirementsData[Math.floor(Math.random() * requirementsData.length)];
        item.aiScore = Math.floor(Math.random() * 40) + 60; // 60-99
        item.aiReqId = randomReq.id;
        item.aiReqTitle = randomReq.title;
        item.aiReqNumber = `REQ-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
        item.aiAccepted = undefined; // Pending - needs user action
      }
    });

    setAnalyzing(false);
    toast.success(`Analyzed ${selectedItems.size} items - review suggestions and accept/reject`);
  };

  // Handle batch link - only link items where user accepted suggestion
  const handleBatchLink = () => {
    let linked = 0;
    selectedItems.forEach(id => {
      const item = allItems.find(i => i.id === id);
      if (item?.aiReqId && item.aiAccepted === true && !item.linkedReqId) {
        item.linkedReqId = item.aiReqId;
        item.linkedReqTitle = item.aiReqTitle;
        item.aiScore = undefined;
        item.aiAccepted = undefined;
        linked++;
      }
    });
    setSelectedItems(new Set());
    if (linked > 0) {
      toast.success(`Linked ${linked} items to requirements`);
    } else {
      toast.warning('No accepted suggestions to link. Accept suggestions first.');
    }
  };

  // Accept AI suggestion for an item
  const handleAcceptSuggestion = (itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    if (item) {
      item.aiAccepted = true;
    }
    // Force re-render by updating state
    setSelectedItems(new Set(selectedItems));
    toast.success('Suggestion accepted');
  };

  // Reject AI suggestion for an item
  const handleRejectSuggestion = (itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    if (item) {
      item.aiAccepted = false;
      item.aiScore = undefined;
      item.aiReqId = undefined;
      item.aiReqTitle = undefined;
    }
    // Force re-render
    setSelectedItems(new Set(selectedItems));
    toast.info('Suggestion rejected - you can manually link or create new');
  };

  // Bulk create new requirements for selected items
  const handleBulkCreateNew = () => {
    const itemsToCreate = Array.from(selectedItems)
      .map(id => allItems.find(i => i.id === id))
      .filter(item => item && !item.linkedReqId && (!item.aiScore || item.aiAccepted === false));
    
    if (itemsToCreate.length === 0) {
      toast.warning('No items eligible for new requirement creation');
      return;
    }

    if (itemsToCreate.length === 1) {
      handleCreateNew(itemsToCreate[0]!);
    } else {
      // For multiple items, show a summary and navigate to first
      toast.info(`Will create ${itemsToCreate.length} new requirements. Opening first...`);
      handleCreateNew(itemsToCreate[0]!);
    }
  };

  // Count stats for bulk actions
  const bulkStats = useMemo(() => {
    const items = Array.from(selectedItems).map(id => allItems.find(i => i.id === id)).filter(Boolean) as ItemWithLinking[];
    return {
      total: items.length,
      withSuggestions: items.filter(i => i.aiScore && !i.linkedReqId).length,
      accepted: items.filter(i => i.aiAccepted === true && !i.linkedReqId).length,
      pending: items.filter(i => i.aiScore && i.aiAccepted === undefined && !i.linkedReqId).length,
      noMatch: items.filter(i => !i.aiScore && !i.linkedReqId).length,
      rejected: items.filter(i => i.aiAccepted === false && !i.linkedReqId).length
    };
  }, [selectedItems, allItems]);

  // Navigate to create requirement form
  const handleCreateNew = (item: ItemWithLinking) => {
    navigate('/requirements/new', {
      state: {
        aiPrefill: {
          title: item.title.replace(/^(Test|Verify|Check)\s+/i, '') + ' Requirement',
          description: `Requirement for: ${item.description || item.title}`,
          type: 'Functional',
          priority: item.priority,
          sourceItemId: item.id,
          sourceItemTitle: item.title
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="h-9 px-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Gap Analysis</h1>
              <p className="text-xs text-muted-foreground">Manage orphaned items and traceability gaps</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Type Tabs */}
        <div className="w-56 border-r border-border bg-muted/30 flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <Select value={linkFilter} onValueChange={(v) => { setLinkFilter(v as any); setPage(1); }}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="unlinked">Unlinked Only</SelectItem>
                <SelectItem value="linked">Linked Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {/* All Items */}
              <button
                onClick={() => { setSelectedType('all'); setPage(1); }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                  selectedType === 'all' 
                    ? "bg-indigo-100 text-indigo-900 font-medium" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  All Items
                </span>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {typeCounts.all.toLocaleString()}
                </Badge>
              </button>

              <div className="h-px bg-border my-2" />

              {/* Type Tabs */}
              {(['TestCase', 'Task', 'Issue', 'SignOff', 'Meeting'] as ItemType[]).map(type => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setPage(1); }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                    selectedType === type 
                      ? "bg-indigo-100 text-indigo-900 font-medium" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    {type === 'TestCase' ? 'Test Cases' : 
                     type === 'SignOff' ? 'Sign-Offs' : 
                     type + 's'}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "h-5 px-1.5 text-[10px]",
                      typeCounts[type] > 100 && "bg-amber-100 text-amber-700"
                    )}
                  >
                    {typeCounts[type].toLocaleString()}
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar Stats */}
          <div className="p-3 border-t border-border bg-muted/50">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Total Unlinked:</span>
                <span className="font-medium text-foreground">
                  {allItems.filter(i => !i.linkedReqId).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Linked:</span>
                <span className="font-medium text-green-600">
                  {allItems.filter(i => i.linkedReqId).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Filter Bar */}
          <div className="p-3 border-b border-border flex items-center gap-3 bg-background shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="h-9 pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-muted-foreground">
              {filteredItems.length.toLocaleString()} items
            </div>
          </div>

          {/* Items List */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              {/* Select All Row */}
              <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-muted/50 rounded-md">
                <Checkbox
                  checked={displayItems.length > 0 && displayItems.every(i => selectedItems.has(i.id))}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedItems.size > 0 
                    ? `${selectedItems.size} selected` 
                    : 'Select all on page'}
                </span>
              </div>

              {/* Item Cards */}
              <div className="space-y-2">
                {displayItems.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg bg-background transition-colors",
                      selectedItems.has(item.id) ? "border-indigo-300 bg-indigo-50/30" : "hover:border-muted-foreground/30"
                    )}
                  >
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium truncate">{item.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Linking Status */}
                          {item.linkedReqId ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
                              <LinkIcon className="h-3 w-3 text-green-600" />
                              <span className="text-green-700 max-w-[120px] truncate">
                                {item.linkedReqTitle}
                              </span>
                            </div>
                          ) : item.aiScore ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs">
                              <Sparkles className="h-3 w-3 text-amber-600" />
                              <span className="text-amber-700">{item.aiScore}% match</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                              Unlinked
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Meta Row */}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="h-5 text-[10px] gap-1">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </Badge>
                        <Badge 
                          className={cn("h-5 text-[10px]",
                            item.priority === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                            item.priority === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-green-100 text-green-700 border-green-200'
                          )}
                        >
                          {item.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {item.assignee}
                        </span>
                      </div>

                      {/* AI Suggestion Row - Enhanced */}
                      {item.aiScore && !item.linkedReqId && (
                        <div className={cn(
                          "mt-2 p-3 border rounded",
                          item.aiAccepted === true ? "bg-green-50/50 border-green-200" :
                          item.aiAccepted === false ? "bg-red-50/50 border-red-200" :
                          "bg-indigo-50/50 border-indigo-200"
                        )}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                                <span className="text-xs font-medium text-indigo-900">AI Suggested Match</span>
                                {item.aiAccepted === true && (
                                  <Badge className="h-4 text-[9px] bg-green-600 text-white">Accepted</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-900">{item.aiReqTitle}</span>
                                <span className="text-xs font-mono text-indigo-600">{item.aiReqNumber}</span>
                              </div>
                              {/* Match Score Bar */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-muted-foreground">Match:</span>
                                <div className="flex-1 max-w-[100px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full rounded-full",
                                      item.aiScore >= 85 ? "bg-green-500" :
                                      item.aiScore >= 70 ? "bg-amber-500" : "bg-orange-400"
                                    )}
                                    style={{ width: `${item.aiScore}%` }}
                                  />
                                </div>
                                <span className={cn("text-xs font-bold",
                                  item.aiScore >= 85 ? "text-green-600" :
                                  item.aiScore >= 70 ? "text-amber-600" : "text-orange-500"
                                )}>{item.aiScore}%</span>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            {item.aiAccepted === undefined && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50"
                                  onClick={() => handleAcceptSuggestion(item.id)}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs gap-1 border-red-300 text-red-700 hover:bg-red-50"
                                  onClick={() => handleRejectSuggestion(item.id)}
                                >
                                  <X className="h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {item.aiAccepted === true && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs gap-1 border-green-300 text-green-700"
                                onClick={() => handleLinkItem(item.id, item.aiReqId!, item.aiReqTitle!)}
                              >
                                <LinkIcon className="h-3 w-3" />
                                Link Now
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions Row */}
                      {!item.linkedReqId && !item.aiScore && (
                        <div className="mt-2 flex items-center gap-2">
                          {linkingItem === item.id ? (
                            <div className="flex-1 max-w-xs">
                              <RequirementSelector
                                onChange={(reqId, reqTitle) => handleLinkItem(item.id, reqId, reqTitle)}
                                placeholder="Select requirement to link..."
                              />
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => setLinkingItem(item.id)}
                              >
                                <LinkIcon className="h-3 w-3" />
                                Link
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-purple-700 border-purple-200"
                                onClick={() => handleCreateNew(item)}
                              >
                                <Plus className="h-3 w-3" />
                                Create Req
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Pagination */}
          <div className="p-3 border-t border-border flex items-center justify-between bg-background shrink-0">
            <span className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, filteredItems.length)} of {filteredItems.length.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar - Enhanced */}
      {selectedItems.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {selectedItems.size} items selected
            </span>
            {bulkStats.accepted > 0 && (
              <span className="text-[10px] text-green-400">
                {bulkStats.accepted} accepted
              </span>
            )}
          </div>
          <div className="h-8 w-px bg-slate-600" />
          
          {/* Get AI Suggestions */}
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            onClick={handleBatchAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {analyzing ? 'Analyzing...' : 'Get AI Suggestions'}
          </Button>

          {/* Link Accepted - only show if there are accepted items */}
          {bulkStats.accepted > 0 && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 gap-1 bg-green-600 hover:bg-green-700 text-white border-0"
              onClick={handleBatchLink}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Link {bulkStats.accepted} Accepted
            </Button>
          )}

          {/* Create New Requirements */}
          {(bulkStats.noMatch > 0 || bulkStats.rejected > 0) && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 gap-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
              onClick={handleBulkCreateNew}
            >
              <Plus className="h-3.5 w-3.5" />
              Create New ({bulkStats.noMatch + bulkStats.rejected})
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => setSelectedItems(new Set())}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default GapAnalysisPage;
