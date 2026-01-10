import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Settings, HelpCircle, Bell, Copy, MoreVertical, ChevronDown, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiscussionsPanel } from '@/components/rtm/DiscussionsPanel';
import { OverviewTab } from '@/components/rtm/OverviewTab';
import { KnowledgeBaseTab } from '@/components/views/detail/KnowledgeBaseTab';
import { StakeholdersTab } from '@/components/views/detail/StakeholdersTab';

const RequirementDetail = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Calendar and Events - Outlook calendar is not getting blocked when events are created from application');
  const [selectedStakeholder, setSelectedStakeholder] = useState('John Smith');
  const [selectedState, setSelectedState] = useState('Preparation - Approve...');
  const [selectedProcess, setSelectedProcess] = useState('Development Process');
  const [selectedGroup, setSelectedGroup] = useState('Backend Team');
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Knowledge base', 'Stakeholders', 'Links', 'History', 'Files'];
  const [tags, setTags] = useState(['High Priority', 'Calendar', 'Integration']);
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  const stakeholders = [
    { name: 'John Smith', initials: 'JS' },
    { name: 'Sarah Johnson', initials: 'SJ' },
    { name: 'Mike Davis', initials: 'MD' },
    { name: 'Lisa Wilson', initials: 'LW' }
  ];
  const getStateColor = (state: string) => {
    switch (state) {
      case 'Preparation - Approve...':
        return 'bg-yellow-400';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };
  const breadcrumb = ['MDLP FY25', 'RTM', 'Requirements', 'REQ-001'];

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Fixed Header */}
      <div className="flex-none bg-background z-30 border-b border-border">
          {/* Main Header */}
          <header className="h-14 flex items-center justify-between px-4 lg:pr-[360px]">
            {/* Left: Back Button */}
            <div className="flex items-center gap-6">
              <Button 
                onClick={() => navigate(-1)}
                variant="ghost"
                className="h-9 px-2 text-primary hover:text-primary/80 hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {/* Breadcrumb */}
              <nav className="hidden md:flex items-center text-sm">
                {breadcrumb.map((item, index) => (
                  <span key={index} className="flex items-center">
                    {index > 0 && <span className="breadcrumb-separator">/</span>}
                    <span className={index === breadcrumb.length - 1 ? 'text-foreground font-medium' : 'breadcrumb-item cursor-pointer'}>
                      {item}
                    </span>
                  </span>
                ))}
              </nav>
            </div>

            {/* Center: Empty space */}
            <div className="flex-1 max-w-lg mx-8 hidden lg:block" />

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <div className="ml-2 pl-4 border-l border-border">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    KA
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          {/* Red Accent Bar */}
          <div className="accent-bar" />

          {/* Title and Controls Area */}
          <div className="px-4 py-4 bg-background">
             {/* ID and Title Row with Save/More buttons */}
             <div className="flex items-center gap-3 mb-3">
               <span className="text-base text-foreground font-semibold">13061</span>
               <Input
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="flex-1 h-auto px-3 py-2 text-base border-transparent bg-transparent hover:border-border focus:border-border transition-colors font-semibold"
                 placeholder="Enter requirement title"
               />
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => navigator.clipboard.writeText(`13061 ${title}`)}
                 className="h-8 w-8 text-muted-foreground hover:text-foreground"
               >
                 <Copy className="h-4 w-4" />
               </Button>
               
               {/* Save Button and More Options - moved here */}
               <div className="flex items-center gap-2 ml-4">
                 <Button
                   disabled
                   className="h-7 px-4 py-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md disabled:opacity-50 hover:disabled:opacity-100 text-sm"
                 >
                   Save
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                   <MoreVertical className="h-4 w-4" />
                 </Button>
               </div>
             </div>
             
             {/* Second Row - Stakeholder and Tags */}
             <div className="flex items-center gap-6 px-2 mb-4">
               {/* Stakeholder Dropdown */}
               <Select value={selectedStakeholder} onValueChange={setSelectedStakeholder}>
                 <SelectTrigger className="min-w-48 border-transparent bg-transparent p-0 h-auto hover:border-border hover:bg-white hover:border rounded-md px-2 py-1 [&>svg]:hidden focus:border-border focus:bg-white focus:!ring-0">
                   <SelectValue asChild>
                     <div className="flex items-center gap-2">
                       <Avatar className="h-8 w-8">
                         <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                           {stakeholders.find(s => s.name === selectedStakeholder)?.initials || 'JS'}
                         </AvatarFallback>
                       </Avatar>
                       <span className="text-sm text-foreground">{selectedStakeholder}</span>
                       <ChevronDown className="h-3 w-3 text-muted-foreground" />
                     </div>
                   </SelectValue>
                 </SelectTrigger>
                 <SelectContent>
                   {stakeholders.map((stakeholder) => (
                     <SelectItem key={stakeholder.name} value={stakeholder.name}>
                       <div className="flex items-center gap-2">
                         <Avatar className="h-6 w-6">
                           <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
                             {stakeholder.initials}
                           </AvatarFallback>
                         </Avatar>
                         <span>{stakeholder.name}</span>
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               
               {/* Tags */}
               <div className="flex items-center gap-2 flex-nowrap">
                 {tags.map((tag, index) => (
                   <Badge key={index} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                     {tag}
                     <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                   </Badge>
                 ))}
                 <Button variant="ghost" className="h-6 px-2 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                   <Plus className="h-3 w-3 mr-1" />
                   Add Tag
                 </Button>
               </div>
             </div>
             
             {/* Third Row with Tab Bar */}
             <div className="mt-0 p-3 bg-gray-50 rounded-lg">
               <div className="flex items-start gap-8 mb-4">
                 {/* State - Process - Group Selects */}
                 <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-foreground min-w-fit">State</label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      {/* ... (Kept original state select trigger/content for brevity, assuming standard Select) */}
                      <SelectTrigger className="min-w-32 h-8 px-2 py-1 text-sm border-transparent bg-transparent hover:border-border hover:bg-white [&>svg]:hidden focus:border-border focus:bg-white">
                        <SelectValue asChild>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStateColor(selectedState)}`}></div>
                            <span className="text-sm">{selectedState}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preparation - Approve..."><div className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-400 rounded-full"></div><span>Preparation - Approve...</span></div></SelectItem>
                        <SelectItem value="In Progress"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span>In Progress</span></div></SelectItem>
                        <SelectItem value="Completed"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span>Completed</span></div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="flex items-center gap-2 pr-8">
                     <label className="text-xs font-medium text-foreground min-w-fit">Process</label>
                     <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                       <SelectTrigger className="min-w-32 h-8 px-2 py-1 text-sm border-transparent bg-transparent hover:border-border hover:bg-white [&>svg]:hidden focus:border-border focus:bg-white">
                         <SelectValue className="text-sm" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Development Process">Development Process</SelectItem>
                         <SelectItem value="Testing Process">Testing Process</SelectItem>
                         <SelectItem value="Review Process">Review Process</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="flex items-center gap-2">
                     <label className="text-xs font-medium text-foreground min-w-fit">Group</label>
                     <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                       <SelectTrigger className="min-w-32 h-8 px-2 py-1 text-sm border-transparent bg-transparent hover:border-border hover:bg-white [&>svg]:hidden focus:border-border focus:bg-white">
                         <SelectValue className="text-sm" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Backend Team">Backend Team</SelectItem>
                         <SelectItem value="Frontend Team">Frontend Team</SelectItem>
                         <SelectItem value="QA Team">QA Team</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
               </div>
               
               {/* Tab Bar */}
               <div className="border-b border-gray-300">
                 <div className="flex gap-1">
                   {tabs.map((tab) => (
                     <Button
                       key={tab}
                       variant="ghost"
                       onClick={() => setActiveTab(tab)}
                       className={`px-4 py-2 text-sm rounded-none border-b-2 transition-colors ${
                         activeTab === tab
                           ? 'border-primary text-primary bg-transparent'
                           : 'border-transparent text-muted-foreground hover:text-foreground'
                       }`}
                     >
                       {tab}
                     </Button>
                   ))}
                 </div>
               </div>
             </div>
          </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background lg:pr-[350px]">
        <div className="w-full h-full">
           {activeTab === 'Overview' && <OverviewTab requirementId="13061" />}
           {activeTab === 'Knowledge base' && <KnowledgeBaseTab requirementId="13061" />}
           {activeTab === 'Stakeholders' && <StakeholdersTab requirementId="13061" />}
           {!['Overview', 'Knowledge base', 'Stakeholders'].includes(activeTab) && (
               <div className="flex items-center justify-center h-full p-6">
                   <span className="text-lg text-muted-foreground">{activeTab} Content (Coming Soon)</span>
               </div>
           )}
        </div>
      </div>

      {/* Right Sidebar - Discussions - Fixed Panel on Desktop, Stacked on Mobile */}
      <div className="w-full h-[400px] lg:h-auto lg:fixed lg:right-0 lg:w-[350px] border-t lg:border-t-0 lg:border-l border-border bg-background shadow-xl lg:shadow-none z-20 pointer-events-auto lg:top-[120px] lg:bottom-0">
         <DiscussionsPanel requirementId="13061" />
      </div>
    </div>
  );
};

export default RequirementDetail;