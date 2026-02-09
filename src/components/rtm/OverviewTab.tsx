import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, Maximize2, FileText, Users, CheckCircle, Code, TestTube, Rocket, Settings, Edit3, History, Download, User, Info, Clock, ClipboardList } from 'lucide-react';

interface OverviewTabProps {
  requirementId: string;
}

export const OverviewTab = ({ requirementId }: OverviewTabProps) => {
  const [description, setDescription] = useState(`**Business Context:**
The current SAP ECC 6.0 system integration with Microsoft Outlook calendar functionality is experiencing synchronization failures when users create calendar events through the SAP application interface. This impacts approximately 2,500 users across Finance (FI), Sales & Distribution (SD), and Human Capital Management (HCM) modules.

**Problem Statement:**
When users create calendar events from within SAP applications (such as scheduling meetings for vendor negotiations, customer appointments, or employee reviews), the events are not properly synchronized with their Outlook calendars. This results in:
- Double-booking conflicts
- Missed appointments and meetings
- Manual calendar maintenance overhead
- Reduced productivity and user satisfaction

**Current State Analysis:**
- SAP GUI transactions: ME21N (Purchase Orders), VA01 (Sales Orders), PA30 (HR Master Data)
- Integration method: SAP Business Connector (deprecated)
- Affected user groups: Procurement team (450 users), Sales team (800 users), HR team (200 users), Management (150 users)
- Error frequency: 35% of calendar events fail to sync
- Business impact: 15-20 hours/week of manual calendar reconciliation

**Root Cause Analysis:**
1. Legacy SAP Business Connector lacks modern OAuth 2.0 authentication
2. Outlook API version compatibility issues (using deprecated Exchange Web Services)
3. Network timeout configurations causing sync failures
4. Missing error handling and retry mechanisms
5. Insufficient logging for troubleshooting sync issues`);
  const [expectedOutcome, setExpectedOutcome] = useState(`**Primary Objectives:**

**1. Seamless Calendar Integration**
- 100% synchronization success rate for calendar events created from SAP
- Real-time bidirectional sync between SAP and Outlook calendars
- Support for recurring events, meeting invitations, and calendar sharing
- Automatic conflict detection and resolution mechanisms

**2. Enhanced User Experience**
- Single-click calendar event creation from SAP transactions
- Unified calendar view showing both SAP-generated and personal events
- Mobile device compatibility for calendar access
- Intuitive user interface with minimal training requirements

**3. Technical Implementation**
- Migration from SAP Business Connector to SAP Cloud Platform Integration (CPI)
- Implementation of Microsoft Graph API for modern Outlook integration
- OAuth 2.0 authentication with Azure Active Directory
- Comprehensive error handling, logging, and monitoring capabilities

**4. Business Value Delivery**
- Reduce manual calendar maintenance by 90% (from 20 hours to 2 hours per week)
- Eliminate double-booking incidents (currently 25-30 per month)
- Improve meeting attendance rates by 15-20%
- Enhance user productivity and satisfaction scores

**5. Compliance and Security**
- Maintain SOX compliance for financial calendar events
- Implement GDPR-compliant data handling for personal calendar information
- Ensure enterprise-grade security with encrypted data transmission
- Audit trail for all calendar synchronization activities

**Success Metrics:**
- Calendar sync success rate: >99.5%
- User adoption rate: >95% within 3 months
- Support ticket reduction: 80% decrease in calendar-related issues
- System response time: <2 seconds for calendar operations
- User satisfaction score: >4.5/5.0 in post-implementation survey`);
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalExpectedOutcome, setOriginalExpectedOutcome] = useState('');
  const [definedRequirement, setDefinedRequirement] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [sourceOwner, setSourceOwner] = useState('');
  const [priority, setPriority] = useState('');
  const [type, setType] = useState('');
  const [isAnalystMode, setIsAnalystMode] = useState(false);
  const [hasAnalystData, setHasAnalystData] = useState(false);
  const [analystInfo, setAnalystInfo] = useState({ name: 'Sarah Johnson', date: 'Jan 11, 2025' });
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    originalContent: true // Start with original content collapsed
  });

  const lifecycleStages = [
    { id: 'identification', name: 'Identification', icon: FileText, status: 'completed' },
    { id: 'analysis', name: 'Analysis', icon: Users, status: hasAnalystData ? 'completed' : 'active' },
    { id: 'documentation', name: 'Documentation', icon: FileText, status: documentGenerated ? 'completed' : hasAnalystData ? 'active' : 'pending' },
    { id: 'approval', name: 'Approval', icon: CheckCircle, status: 'pending' },
    { id: 'design', name: 'Design', icon: Settings, status: 'pending' },
    { id: 'development', name: 'Development', icon: Code, status: 'pending' },
    { id: 'testing', name: 'Testing', icon: TestTube, status: 'pending' },
    { id: 'deployment', name: 'Deployment', icon: Rocket, status: 'pending' },
    { id: 'support', name: 'Support', icon: Settings, status: 'pending' }
  ];

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const handleStartAnalysis = () => {
    setIsAnalystMode(true);
    setDefinedRequirement(description);
    setAcceptanceCriteria(expectedOutcome);
  };

  const handleProceedWithAnalysis = () => {
    // Store original values before replacing
    setOriginalDescription(description);
    setOriginalExpectedOutcome(expectedOutcome);
    
    // Replace with analyzed content
    setDescription(definedRequirement);
    setExpectedOutcome(acceptanceCriteria);
    
    setIsAnalystMode(false);
    setHasAnalystData(true);
    // Mock: Set current user as analyst
    setAnalystInfo({ name: 'Sarah Johnson', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
  };

  const handleCancelAnalysis = () => {
    setIsAnalystMode(false);
    setDefinedRequirement('');
    setAcceptanceCriteria('');
  };

  const handleGenerateDocument = () => {
    setIsGeneratingDoc(true);
    // Mock document generation process
    setTimeout(() => {
      setDocumentGenerated(true);
      setIsGeneratingDoc(false);
    }, 2000);
  };

  const toggleExpand = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    setCollapsedSections(prev => ({ ...prev, [section]: false }));
  };

  const toggleCollapse = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    setExpandedSections(prev => ({ ...prev, [section]: false }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* RTM Lifecycle Tracker
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium text-foreground mb-3 block">Requirement Lifecycle (R)</Label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {lifecycleStages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStageColor(stage.status)}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-center whitespace-nowrap">{stage.name}</span>
                  </div>
                  {index < lifecycleStages.length - 1 && (
                    <div className="w-8 h-px bg-gray-300 mt-[-12px]" />
                  )}
                </div>
              );
            })}
          </div>
        </div> */}

        <div className="flex gap-8">
          {/* Column 1 - 65% */}
          <div className="flex-1 w-[65%]">
            {/* Analyst Mode - Analysis Interface */}
            {isAnalystMode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium text-foreground">Analyst Review</Label>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Review Mode</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={expandedSections.definedRequirement ? 'fixed inset-0 z-50 bg-white p-4' : ''}>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-medium text-foreground">Defined Requirement</Label>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleExpand('definedRequirement')}>
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleCollapse('definedRequirement')}>
                          {collapsedSections.definedRequirement ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    {!collapsedSections.definedRequirement && (
                      <RichTextEditor
                        value={definedRequirement}
                        onChange={setDefinedRequirement}
                        placeholder="Provide structured, analyzed requirements with clear scope and assumptions..."
                      />
                    )}
                  </div>

                  <div className={expandedSections.acceptanceCriteria ? 'fixed inset-0 z-50 bg-white p-4' : ''}>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-medium text-foreground">Acceptance Criteria</Label>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleExpand('acceptanceCriteria')}>
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleCollapse('acceptanceCriteria')}>
                          {collapsedSections.acceptanceCriteria ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    {!collapsedSections.acceptanceCriteria && (
                      <RichTextEditor
                        value={acceptanceCriteria}
                        onChange={setAcceptanceCriteria}
                        placeholder="Define specific, measurable, and testable acceptance criteria..."
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Description & Expected Outcome */}
            {!isAnalystMode && (
              <>
                {/* Original Content - Collapsed when analyzed */}
                {hasAnalystData && (
                  <div className="mb-6 p-3 bg-muted/20 rounded-lg border border-dashed">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">Original Submission</Label>
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                          Author Input
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => toggleCollapse('originalContent')}
                      >
                        {collapsedSections.originalContent ? 'Show Original' : 'Hide Original'}
                        {collapsedSections.originalContent ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronUp className="h-3 w-3 ml-1" />}
                      </Button>
                    </div>
                    
                    {!collapsedSections.originalContent && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-foreground mb-2 block">Original Description</Label>
                          <div className="p-3 bg-white rounded border text-sm text-muted-foreground max-h-32 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: originalDescription.replace(/\n/g, '<br>') }} />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground mb-2 block">Original Defined Output</Label>
                          <div className="p-3 bg-white rounded border text-sm text-muted-foreground max-h-32 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: originalExpectedOutcome.replace(/\n/g, '<br>') }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Current Content */}
                {/* Description Section */}
                <div className={`mb-6 ${expandedSections.description ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium text-foreground">{hasAnalystData ? 'Defined Requirement' : 'Description'}</Label>
                      {hasAnalystData && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-help">
                                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Analyzed
                                </Badge>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Analyzed by {analystInfo.name} on {analystInfo.date}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleExpand('description')}>
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleCollapse('description')}>
                        {collapsedSections.description ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  {!collapsedSections.description && (
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Enter the business need or problem statement..."
                    />
                  )}
                </div>

                {/* Expected Outcome Section */}
                <div className={`mb-6 ${expandedSections.expectedOutcome ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium text-foreground">{hasAnalystData ? 'Acceptance Criteria' : 'Expected Outcome'}</Label>
                      {hasAnalystData && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-help">
                                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Analyzed
                                </Badge>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Analyzed by {analystInfo.name} on {analystInfo.date}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleExpand('expectedOutcome')}>
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => toggleCollapse('expectedOutcome')}>
                        {collapsedSections.expectedOutcome ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  {!collapsedSections.expectedOutcome && (
                    <RichTextEditor
                      value={expectedOutcome}
                      onChange={setExpectedOutcome}
                      placeholder="Describe what success looks like..."
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Column 2 - 35% */}
          <div className="w-[35%] space-y-6">
            {/* Requirement Classification */}
            <div>
              <Label className="text-base font-medium text-foreground mb-4 block">Requirement Classification</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1 block">Source Owner</Label>
                  <Select value={sourceOwner} onValueChange={setSourceOwner}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="mike">Mike Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-1 block">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-1 block">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business Requirement</SelectItem>
                      <SelectItem value="functional">Functional Requirement</SelectItem>
                      <SelectItem value="non-functional">Non-Functional Requirement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Traceability Information */}
            <div>
              <Label className="text-base font-medium text-foreground mb-4 block">Traceability</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Identified:</span>
                  <span className="text-foreground">Jan 10, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Analyzed:</span>
                  <span className="text-foreground">{hasAnalystData ? analystInfo.date : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Documented:</span>
                  <span className="text-foreground">{documentGenerated ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved:</span>
                  <span className="text-foreground">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Design Complete:</span>
                  <span className="text-foreground">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dev Complete:</span>
                  <span className="text-foreground">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Testing Complete:</span>
                  <span className="text-foreground">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Released:</span>
                  <span className="text-foreground">-</span>
                </div>
              </div>
            </div>

            {/* Linked Artifacts */}
            <div>
              <Label className="text-base font-medium text-foreground mb-4 block">Linked Artifacts</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BRD Document:</span>
                  <span className={documentGenerated ? "text-blue-500 cursor-pointer hover:underline" : "text-foreground"}>
                    {documentGenerated ? 'REQ-13061-BRD.pdf' : 'Not generated'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Design Docs:</span>
                  <span className="text-blue-500 cursor-pointer hover:underline">0 linked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test Cases:</span>
                  <span className="text-blue-500 cursor-pointer hover:underline">0 linked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code Objects:</span>
                  <span className="text-blue-500 cursor-pointer hover:underline">0 linked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Release:</span>
                  <span className="text-blue-500 cursor-pointer hover:underline">Not assigned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer with Workflow Actions - Only for Overview Tab */}
      <div className="absolute bottom-0 left-0 right-[25%] bg-white border-t border-border p-4 z-10">
        <div className="flex items-center gap-3">
          {/* Analyst Action Button */}
          {!hasAnalystData && !isAnalystMode && (
            <Button onClick={handleStartAnalysis} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="h-4 w-4 mr-2" />
              Start Analysis Review
            </Button>
          )}

          {/* Analysis Mode Controls */}
          {isAnalystMode && (
            <div className="flex gap-2">
              <Button onClick={handleProceedWithAnalysis} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Proceed
              </Button>
              <Button onClick={handleCancelAnalysis} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
          )}

          {/* Document Generation Button */}
          {hasAnalystData && !documentGenerated && (
            <Dialog>
              <DialogTrigger asChild>
                {/* <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Documentation
                </Button> */}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Requirement Documentation</DialogTitle>
                  <DialogDescription>
                    This will create a formal Business Requirements Document (BRD) based on the analyzed requirement data.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Document Type</span>
                      <span className="text-sm text-muted-foreground">Business Requirements Document</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Template</span>
                      <span className="text-sm text-muted-foreground">Standard BRD Template v2.1</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">Analyst</span>
                      <span className="text-sm text-muted-foreground">{analystInfo.name}</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleGenerateDocument} disabled={isGeneratingDoc}>
                    {isGeneratingDoc ? 'Generating...' : 'Generate Document'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Document Ready Actions */}
          {documentGenerated && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <FileText className="h-3 w-3 mr-1" />
                Document Generated
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Download BRD
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};