import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Settings, HelpCircle, Bell, Copy, MoreVertical, ChevronDown, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OverviewTab } from '@/components/rtm/OverviewTab';
import { LinksTab } from '@/components/rtm/LinksTab';
import { FilesTab } from '@/components/rtm/FilesTab';
import { DiscussionsPanel } from '@/components/rtm/DiscussionsPanel';
import { KnowledgeBaseTab } from '@/components/views/detail/KnowledgeBaseTab';
import { StakeholdersTab } from '@/components/views/detail/StakeholdersTab';

const RequirementDetail = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Calendar and Events - Outlook calendar is not getting blocked when events are created from application');
  const [selectedStakeholder, setSelectedStakeholder] = useState('John Smith');
  const [selectedState, setSelectedState] = useState('Preparation - Approve...');
  const [selectedProcess, setSelectedProcess] = useState('Development Process');
  const [selectedGroup, setSelectedGroup] = useState('Backend Team');
  const [selectedArea, setSelectedArea] = useState('K4 - Product Development');
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Knowledge base', 'Stakeholders', 'Links', 'History', 'Files'];
  const [tags, setTags] = useState(['High Priority', 'Calendar', 'Integration']);
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  const stakeholders = [
    { name: 'John Smith', initials: 'JS' },
    { name: 'Sarah Johnson', initials: 'SJ' },
    { name: 'Mike Davis', initials: 'MD' },
    { name: 'Lisa Wilson', initials: 'LW' }
  ];
  const getStateColor = (state) => {
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Custom Header with Back Button */}
      <div className="sticky top-0 z-50">
        {/* Main Header */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
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
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Form Content */}
          <div className="flex flex-col bg-background">
            <div className="px-4 pt-3 pb-0 flex-shrink-0">
              {/* ID and Title Row */}
              <div className="flex items-center gap-2 mb-2">
                <span className="!text-[17px] !font-normal text-foreground" style={{ fontSize: '17px', fontWeight: '400' }}>13061</span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 h-auto px-2 py-1 !text-[17px] !font-normal border-transparent bg-transparent hover:border-border focus:border-border transition-colors"
                  style={{ fontSize: '17px', fontWeight: '400' }}
                  placeholder="Enter requirement title"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(`13061 ${title}`)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              {/* Second Row */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-4">
                  {/* Stakeholder Dropdown */}
                  <Select value={selectedStakeholder} onValueChange={setSelectedStakeholder}>
                    <SelectTrigger className="min-w-40 border-transparent bg-transparent p-0 h-auto hover:border-border hover:bg-white hover:border rounded-md px-2 py-1 [&>svg]:hidden focus:border-border focus:bg-white focus:!ring-0">
                      <SelectValue asChild>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
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
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
                                {stakeholder.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{stakeholder.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tags */}
                  <div className="flex items-center gap-1 flex-nowrap">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 whitespace-nowrap text-xs h-6">
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

                <div className="flex items-center gap-2">
                  {/* Save Button */}
                  <Button
                    disabled
                    className="h-7 px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 text-sm"
                  >
                    Save
                  </Button>

                  {/* More Options */}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Third Row with Tab Bar */}
              <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-6 mb-3">
                  {/* State */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground min-w-fit">State</label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="min-w-28 h-7 px-2 py-1 text-sm border-transparent bg-transparent hover:border-border hover:bg-white [&>svg]:hidden focus:border-border focus:bg-white">
                        <SelectValue asChild>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getStateColor(selectedState)}`}></div>
                            <span className="text-sm">{selectedState}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preparation - Approve...">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span>Preparation - Approve...</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="In Progress">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>In Progress</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Completed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Completed</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Process */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground min-w-fit">Process</label>
                    <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                      <SelectTrigger className="min-w-28 h-7 px-2 py-1 text-sm border-transparent bg-transparent hover:border-border hover:bg-white [&>svg]:hidden focus:border-border focus:bg-white">
                        <SelectValue className="text-sm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Development Process">Development Process</SelectItem>
                        <SelectItem value="Testing Process">Testing Process</SelectItem>
                        <SelectItem value="Review Process">Review Process</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground min-w-fit">Group</label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="min-w-28 h-7 px-2 py-1 text-sm border-transparent bg-transparent hover:border-border hover:bg-white [&>svg]:hidden focus:border-border focus:bg-white">
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
                  <div className="flex gap-0">
                    {tabs.map((tab) => (
                      <Button
                        key={tab}
                        variant="ghost"
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2 text-[14px] font-normal rounded-none border-b-2 transition-colors !bg-transparent hover:!bg-transparent ${activeTab === tab
                          ? 'border-primary text-primary'
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
            {/* Tab Content with Discussions Panel */}
            <div className="flex" style={{ height: 'calc(100vh - 280px)' }}>
              {/* Main Tab Content - 75% */}
              <div className="flex-1 w-[75%] overflow-y-auto">
                {activeTab === 'Overview' ? (
                  <OverviewTab requirementId="13061" />
                ) : activeTab === 'Knowledge base' ? (
                  <KnowledgeBaseTab requirementId="13061" />
                ) : activeTab === 'Stakeholders' ? (
                  <StakeholdersTab requirementId="13061" />
                ) : activeTab === 'Links' ? (
                  <LinksTab requirementId="13061" />
                ) : activeTab === 'Files' ? (
                  <FilesTab requirementId="13061" />
                ) : activeTab === 'History' ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <span className="text-lg font-semibold text-foreground mb-2 block">History</span>
                      <span className="text-sm text-muted-foreground">Audit trail and change history coming soon</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <span className="text-lg text-muted-foreground">{activeTab} Content</span>
                  </div>
                )}
              </div>

              {/* Discussions Panel - 25% */}
              <div className="w-[25%] flex-shrink-0 h-full overflow-y-auto border-l border-border">
                <DiscussionsPanel requirementId="13061" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementDetail;