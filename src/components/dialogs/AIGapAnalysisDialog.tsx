import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Sparkles,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  AlertCircle,
  Plus,
  Check,
  X,
  Edit2,
  FileText
} from 'lucide-react';
import { aiGapAnalysisService, AIRecommendation, NewRequirementSuggestion } from '@/services/aiGapAnalysisService';
import { UnlinkedItem } from '@/data/unlinkedItems';
import { RequirementSelector } from './RequirementSelector';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIGapAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extended recommendation with user override
interface ExtendedRecommendation extends AIRecommendation {
  userOverrideReqId?: string;
  userOverrideReqTitle?: string;
  userOverrideReqNumber?: string;
  isAccepted: boolean;
}

export function AIGapAnalysisDialog({ open, onOpenChange }: AIGapAnalysisDialogProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<UnlinkedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [linking, setLinking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<ExtendedRecommendation[]>([]);
  const [newReqSuggestions, setNewReqSuggestions] = useState<NewRequirementSuggestion[]>([]);
  const [selectedNewReqs, setSelectedNewReqs] = useState<string[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [step, setStep] = useState<'selection' | 'recommendation'>('selection');
  const [activeTab, setActiveTab] = useState<'link' | 'create'>('link');

  // Load items when dialog opens
  useEffect(() => {
    if (open) {
      loadItems();
      setStep('selection');
      setRecommendations([]);
      setNewReqSuggestions([]);
      setSelectedItems([]);
      setSelectedNewReqs([]);
      setIsFullScreen(false);
      setActiveTab('link');
    }
  }, [open]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const items = await aiGapAnalysisService.getUnlinkedItems();
      setData(items);
    } catch (error) {
      console.error('Failed to load items', error);
      toast.error('Failed to load unlinked items');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(data.map(i => i.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(i => i !== id));
    }
  };

  const handleGetRecommendations = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select at least one item');
      return;
    }

    setAnalyzing(true);
    try {
      const recs = await aiGapAnalysisService.getRecommendations(selectedItems);
      
      // Convert to extended recommendations with default acceptance
      const extendedRecs: ExtendedRecommendation[] = recs.map(rec => ({
        ...rec,
        isAccepted: rec.score >= 50 // Auto-accept high confidence matches
      }));
      
      setRecommendations(extendedRecs);

      // Get new requirement suggestions for low-score items
      const lowScoreItemIds = recs.filter(r => r.score < 50).map(r => r.itemId);
      if (lowScoreItemIds.length > 0) {
        const suggestions = await aiGapAnalysisService.suggestNewRequirements(lowScoreItemIds);
        setNewReqSuggestions(suggestions);
        setSelectedNewReqs(suggestions.map(s => s.sourceItemId)); // Auto-select all
      }

      setStep('recommendation');
    } catch (error) {
      console.error('Analysis failed', error);
      toast.error('AI Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOverrideRequirement = (itemId: string, reqId: string, reqTitle: string, reqNumber: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.itemId === itemId) {
        return {
          ...rec,
          userOverrideReqId: reqId,
          userOverrideReqTitle: reqTitle,
          userOverrideReqNumber: reqNumber,
          isAccepted: true
        };
      }
      return rec;
    }));
  };

  const handleToggleAccept = (itemId: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.itemId === itemId) {
        return { ...rec, isAccepted: !rec.isAccepted };
      }
      return rec;
    }));
  };

  const handleToggleNewReq = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedNewReqs(prev => [...prev, itemId]);
    } else {
      setSelectedNewReqs(prev => prev.filter(id => id !== itemId));
    }
  };

  // Move an item from Link to Create New
  const handleMoveToCreateNew = (itemId: string) => {
    const item = data.find(i => i.id === itemId);
    if (!item) return;

    // Remove from recommendations
    setRecommendations(prev => prev.filter(r => r.itemId !== itemId));

    // Add to new requirement suggestions
    const newSuggestion: NewRequirementSuggestion = {
      sourceItemId: item.id,
      suggestedTitle: generateRequirementTitle(item),
      suggestedDescription: `This requirement covers the functionality related to: ${item.description || item.title}`,
      suggestedType: inferRequirementType(item),
      suggestedPriority: item.priority,
      reasoning: `Manually moved from Link to Existing. Original item: "${item.title}"`
    };

    setNewReqSuggestions(prev => [...prev, newSuggestion]);
    setSelectedNewReqs(prev => [...prev, item.id]);
    setActiveTab('create');
  };

  // Helper functions for generating requirement suggestions
  const generateRequirementTitle = (item: UnlinkedItem): string => {
    const title = item.title
      .replace(/^(Test|Verify|Check|Ensure)\s+/i, '')
      .replace(/\s+(Test|Testing)$/i, '');
    
    if (item.type === 'TestCase') return `${title} Requirement`;
    if (item.type === 'Task') return title;
    if (item.type === 'Issue') return `Fix: ${title}`;
    if (item.type === 'SignOff') return `${title} Process`;
    return title;
  };

  const inferRequirementType = (item: UnlinkedItem): string => {
    const text = `${item.title} ${item.description || ''}`.toLowerCase();
    if (text.includes('api') || text.includes('integration') || text.includes('database')) return 'Technical';
    if (text.includes('user') || text.includes('ui') || text.includes('screen')) return 'Functional';
    if (text.includes('business') || text.includes('workflow')) return 'Business';
    return 'Functional';
  };

  const handleApplyLinks = async () => {
    const acceptedRecs = recommendations.filter(r => r.isAccepted);
    if (acceptedRecs.length === 0) {
      toast.warning('No items selected for linking');
      return;
    }

    setLinking(true);
    try {
      const links = acceptedRecs.map(r => ({
        itemId: r.itemId,
        reqId: r.userOverrideReqId || r.recommendedReqId
      }));
      await aiGapAnalysisService.linkItems(links);
      toast.success(`Successfully linked ${links.length} items to requirements`);
      
      // Remove linked items from recommendations
      setRecommendations(prev => prev.filter(r => !r.isAccepted));
      
      if (recommendations.filter(r => !r.isAccepted).length === 0 && newReqSuggestions.length === 0) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Linking failed', error);
      toast.error('Failed to apply links');
    } finally {
      setLinking(false);
    }
  };

  // Navigate to form page with prefilled AI data for a single suggestion
  const handleEditAndCreate = (suggestion: NewRequirementSuggestion) => {
    const item = data.find(i => i.id === suggestion.sourceItemId);
    onOpenChange(false); // Close dialog
    navigate('/requirements/new', {
      state: {
        aiPrefill: {
          title: suggestion.suggestedTitle,
          description: suggestion.suggestedDescription,
          type: suggestion.suggestedType,
          priority: suggestion.suggestedPriority,
          sourceItemId: suggestion.sourceItemId,
          sourceItemTitle: item?.title || ''
        }
      }
    });
  };

  // Navigate to form for batch creation (multiple requirements)
  const handleCreateNewRequirements = async () => {
    const selectedSuggestions = newReqSuggestions.filter(s => selectedNewReqs.includes(s.sourceItemId));
    if (selectedSuggestions.length === 0) {
      toast.warning('No requirements selected for creation');
      return;
    }

    if (selectedSuggestions.length === 1) {
      // Single item: navigate directly to form
      handleEditAndCreate(selectedSuggestions[0]);
    } else {
      // Multiple items: create them in batch (old behavior)
      setCreating(true);
      try {
        await aiGapAnalysisService.createRequirements(selectedSuggestions);
        toast.success(`Successfully created ${selectedSuggestions.length} new requirements`);
        
        // Remove created suggestions
        setNewReqSuggestions(prev => prev.filter(s => !selectedNewReqs.includes(s.sourceItemId)));
        setSelectedNewReqs([]);
        
        if (newReqSuggestions.filter(s => !selectedNewReqs.includes(s.sourceItemId)).length === 0 && 
            recommendations.filter(r => r.isAccepted).length === 0) {
          onOpenChange(false);
        }
      } catch (error) {
        console.error('Creation failed', error);
        toast.error('Failed to create requirements');
      } finally {
        setCreating(false);
      }
    }
  };

  const getItemDetails = (itemId: string) => data.find(i => i.id === itemId);

  const acceptedCount = recommendations.filter(r => r.isAccepted).length;
  const lowMatchCount = recommendations.filter(r => r.score < 50).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "flex flex-col gap-0 p-0 transition-all duration-300",
        isFullScreen 
          ? "max-w-[95vw] w-[95vw] h-[90vh]" 
          : "max-w-4xl max-h-[85vh]"
      )}>
        <DialogHeader className="p-6 pb-4 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">AI Gap Analysis</DialogTitle>
                <DialogDescription className="mt-1">
                  {step === 'selection' 
                    ? "Identify unlinked items and get AI-powered requirement suggestions."
                    : "Review recommendations, override selections, or create new requirements."
                  }
                </DialogDescription>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-muted/5">
          {step === 'selection' && (
            <ScrollArea className="flex-1 p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm">Scanning for unlinked artifacts...</span>
                </div>
              ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                  <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/20">
                    <LinkIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p>No unlinked items found. Great job!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Found {data.length} unlinked items
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="select-all" 
                        checked={selectedItems.length === data.length && data.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                      />
                      <label 
                        htmlFor="select-all" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Select All
                      </label>
                    </div>
                  </div>

                  <div className="border rounded-md bg-background shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Item Details</TableHead>
                          <TableHead className="w-[100px]">Type</TableHead>
                          <TableHead className="w-[100px]">Priority</TableHead>
                          <TableHead className="w-[120px]">Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell>
                              <Checkbox 
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-sm text-foreground">{item.title}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal capitalize bg-slate-50">
                                {item.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={cn("capitalize font-normal", 
                                  item.priority === 'High' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' :
                                  item.priority === 'Medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200' :
                                  'bg-green-100 text-green-700 hover:bg-green-100 border-green-200'
                                )}
                              >
                                {item.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.createdOn}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </ScrollArea>
          )}

          {step === 'recommendation' && (
            <div className="flex-1 flex flex-col min-h-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'link' | 'create')} className="flex-1 flex flex-col">
                <div className="px-6 pt-4 border-b border-border">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="link" className="gap-2">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Link to Existing ({acceptedCount}/{recommendations.length})
                    </TabsTrigger>
                    <TabsTrigger value="create" className="gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      Create New ({newReqSuggestions.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="link" className="flex-1 m-0 overflow-hidden">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-100 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>Review AI recommendations below. You can accept, reject, or override the suggested requirement for each item.</p>
                      </div>

                      <div className="border rounded-md bg-background shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="w-[50px]">Accept</TableHead>
                              <TableHead className="w-[20%]">Unlinked Item</TableHead>
                              <TableHead className="w-[25%]">Recommended / Selected Requirement</TableHead>
                              <TableHead className="w-[70px] text-center">Score</TableHead>
                              <TableHead>Reasoning</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recommendations.map((rec) => {
                              const item = getItemDetails(rec.itemId);
                              const hasOverride = !!rec.userOverrideReqId;
                              const displayReqTitle = rec.userOverrideReqTitle || rec.reqTitle;
                              const displayReqNumber = rec.userOverrideReqNumber || rec.reqNumber;
                              
                              return (
                                <TableRow key={rec.itemId} className={cn(
                                  "hover:bg-muted/30",
                                  !rec.isAccepted && "opacity-60"
                                )}>
                                  <TableCell>
                                    <Checkbox 
                                      checked={rec.isAccepted}
                                      onCheckedChange={() => handleToggleAccept(rec.itemId)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <span className="font-medium text-sm">{item?.title}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">{item?.type}</Badge>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-2">
                                      <div className={cn(
                                        "p-2 border rounded",
                                        hasOverride 
                                          ? "bg-emerald-50/50 border-emerald-200" 
                                          : "bg-indigo-50/50 border-indigo-100"
                                      )}>
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-1.5">
                                            {hasOverride && <Edit2 className="h-3 w-3 text-emerald-600" />}
                                            <span className={cn(
                                              "font-semibold text-sm",
                                              hasOverride ? "text-emerald-900" : "text-indigo-900"
                                            )}>
                                              {displayReqTitle}
                                            </span>
                                          </div>
                                          <span className={cn(
                                            "text-xs font-mono",
                                            hasOverride ? "text-emerald-600" : "text-indigo-600"
                                          )}>
                                            {displayReqNumber}
                                          </span>
                                        </div>
                                      </div>
                                      <RequirementSelector
                                        value={rec.userOverrideReqId || rec.recommendedReqId}
                                        onChange={(reqId, reqTitle, reqNumber) => 
                                          handleOverrideRequirement(rec.itemId, reqId, reqTitle, reqNumber)
                                        }
                                        placeholder="Override with different requirement..."
                                        className="text-xs"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      <span className={cn(
                                        "text-sm font-bold",
                                        rec.score >= 90 ? "text-green-600" :
                                        rec.score >= 70 ? "text-amber-600" : 
                                        rec.score >= 50 ? "text-slate-500" : "text-red-500"
                                      )}>
                                        {rec.score}%
                                      </span>
                                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className={cn("h-full rounded-full transition-all duration-500", 
                                            rec.score >= 90 ? "bg-green-500" :
                                            rec.score >= 70 ? "bg-amber-500" : 
                                            rec.score >= 50 ? "bg-slate-400" : "bg-red-400"
                                          )}
                                          style={{ width: `${rec.score}%` }} 
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground max-w-[150px]">
                                    {rec.reasoning}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs gap-1 text-purple-700 border-purple-200 hover:bg-purple-50"
                                      onClick={() => handleMoveToCreateNew(rec.itemId)}
                                    >
                                      <Plus className="h-3 w-3" />
                                      Create New
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="create" className="flex-1 m-0 overflow-hidden">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-md border border-amber-100 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>Items below had low match scores. AI suggests creating new requirements for them.</p>
                      </div>

                      {newReqSuggestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-muted-foreground">
                          <Check className="h-8 w-8 text-green-500" />
                          <p>All items have good requirement matches!</p>
                        </div>
                      ) : (
                        <div className="border rounded-md bg-background shadow-sm overflow-hidden">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead className="w-[50px]">Create</TableHead>
                                <TableHead className="w-[25%]">Source Item</TableHead>
                                <TableHead className="w-[35%]">Suggested Requirement</TableHead>
                                <TableHead>Type / Priority</TableHead>
                                <TableHead className="w-[120px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {newReqSuggestions.map((suggestion) => {
                                const item = getItemDetails(suggestion.sourceItemId);
                                return (
                                  <TableRow key={suggestion.sourceItemId} className="hover:bg-muted/30">
                                    <TableCell>
                                      <Checkbox 
                                        checked={selectedNewReqs.includes(suggestion.sourceItemId)}
                                        onCheckedChange={(checked) => 
                                          handleToggleNewReq(suggestion.sourceItemId, checked as boolean)
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium text-sm">{item?.title}</span>
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 w-fit">{item?.type}</Badge>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="p-2 border rounded bg-purple-50/50 border-purple-100">
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-1.5">
                                            <FileText className="h-3.5 w-3.5 text-purple-600" />
                                            <span className="font-semibold text-sm text-purple-900">
                                              {suggestion.suggestedTitle}
                                            </span>
                                          </div>
                                          <p className="text-xs text-purple-700 line-clamp-2">
                                            {suggestion.suggestedDescription}
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-col gap-1">
                                        <Badge variant="outline" className="w-fit">
                                          {suggestion.suggestedType}
                                        </Badge>
                                        <Badge 
                                          className={cn("w-fit font-normal",
                                            suggestion.suggestedPriority === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                                            suggestion.suggestedPriority === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            'bg-green-100 text-green-700 border-green-200'
                                          )}
                                        >
                                          {suggestion.suggestedPriority}
                                        </Badge>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                        onClick={() => handleEditAndCreate(suggestion)}
                                      >
                                        <Edit2 className="h-3 w-3" />
                                        Edit & Create
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center shrink-0">
          <Button variant="outline" onClick={() => {
            if (step === 'recommendation') setStep('selection');
            else onOpenChange(false);
          }}>
            {step === 'recommendation' ? 'Back' : 'Cancel'}
          </Button>

          <div className="flex items-center gap-2">
            {step === 'selection' ? (
              <Button 
                onClick={handleGetRecommendations} 
                disabled={selectedItems.length === 0 || loading || analyzing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get AI Recommendations
                  </>
                )}
              </Button>
            ) : (
              <>
                {activeTab === 'link' && (
                  <Button 
                    onClick={handleApplyLinks}
                    disabled={linking || acceptedCount === 0}
                    className="gap-2"
                  >
                    {linking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4" />
                        Link {acceptedCount} Items
                      </>
                    )}
                  </Button>
                )}
                {activeTab === 'create' && newReqSuggestions.length > 0 && (
                  <Button 
                    onClick={handleCreateNewRequirements}
                    disabled={creating || selectedNewReqs.length === 0}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create {selectedNewReqs.length} Requirements
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
