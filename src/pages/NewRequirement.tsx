import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Settings, HelpCircle, Bell, Copy, ChevronDown, X, Plus, User, Folder, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OverviewTab } from '@/components/rtm/OverviewTabNew';
import { LifecycleTracker } from '@/components/rtm/LifecycleTracker';
import { requirementLifecycleStages, requirementStatuses } from '@/data/lifecycleData';
import { DiscussionsPanel } from '@/components/rtm/DiscussionsPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { navigationData } from '@/data/mockData';

const NewRequirement = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState('KTern Admin');
  const [selectedState, setSelectedState] = useState('New');
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [tags, setTags] = useState([]);
  const [isDiscussionFullscreen, setIsDiscussionFullscreen] = useState(false);
  
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const stakeholders = [
    { name: 'KTern Admin', initials: 'KA' },
    { name: 'John Smith', initials: 'JS' },
    { name: 'Sarah Johnson', initials: 'SJ' },
    { name: 'Mike Davis', initials: 'MD' },
    { name: 'Lisa Wilson', initials: 'LW' }
  ];

  const getStateColor = (state) => {
    const statusObj = requirementStatuses.find(s => s.status === state);
    return statusObj ? `bg-[${statusObj.color}]` : 'bg-gray-400';
  };

  const breadcrumb = ['MDLP FY25', 'RTM', 'Requirements', 'New Requirement'];

  // Flatten hierarchy for dropdown
  const flattenHierarchy = (nodes, level = 0, parentPath = '') => {
    let result = [];
    nodes.forEach(node => {
      const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
      result.push({ ...node, level, path: currentPath });
      if (node.children) {
        result = result.concat(flattenHierarchy(node.children, level + 1, currentPath));
      }
    });
    return result;
  };

  const flatHierarchy = flattenHierarchy(navigationData[0]?.children || []);
  const filteredHierarchy = flatHierarchy.filter(node => 
    node.name.toLowerCase().includes(parentSearchTerm.toLowerCase())
  );

  const handleSave = () => {
    // TODO: Save the new requirement
    console.log('Saving new requirement:', { title, selectedStakeholder, selectedState, selectedParent, tags });
    // Navigate back or to the saved requirement
    navigate(-1);
  };

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
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 h-auto px-2 py-1 !text-[17px] !font-normal border-border bg-transparent hover:border-border focus:border-border transition-colors"
                  style={{ fontSize: '17px', fontWeight: '400' }}
                  placeholder="Enter requirement title"
                />
              </div>

              {/* Second Row */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-4">
                  {/* Stakeholder Dropdown */}
                  <Select value={selectedStakeholder} onValueChange={setSelectedStakeholder}>
                    <SelectTrigger className="min-w-40 border-transparent bg-transparent p-0 h-auto hover:border-border hover:bg-white hover:border rounded-md px-2 py-1 [&>svg]:hidden focus:border-border focus:bg-white focus:!ring-0">
                      <SelectValue placeholder="No one selected" asChild>
                        {selectedStakeholder ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
                                {stakeholders.find(s => s.name === selectedStakeholder)?.initials || ''}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-foreground">{selectedStakeholder}</span>
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground italic">No one selected</span>
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
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
                    onClick={handleSave}
                    disabled={!title.trim()}
                    className="h-7 px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 text-sm"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Content with Discussions Panel */}
            <div className="flex" style={{ height: 'calc(100vh - 150px)' }}>
              {/* Main Content - Left Side */}
              <div className="flex-1 flex flex-col">
                {/* Third Row with Metadata */}
                <div className="mt-2 p-2 bg-gray-50 rounded-lg mx-4">
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
                          {requirementStatuses
                            .filter(s => s.active)
                            .sort((a, b) => a.order - b.order)
                            .map(status => (
                              <SelectItem key={status._id} value={status.status}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: status.color }}
                                  ></div>
                                  <span>{status.status}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Parent */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-muted-foreground min-w-fit">Parent</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="min-w-48 h-7 px-2 py-1 text-sm border-transparent bg-transparent hover:border-border hover:bg-white justify-start"
                          >
                            <span className="text-sm truncate">
                              {selectedParent ? selectedParent.name : 'Select parent'}
                            </span>
                            <ChevronDown className="h-3 w-3 ml-auto" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
                          <div className="p-2 border-b">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                              <Input
                                placeholder="Search folders..."
                                value={parentSearchTerm}
                                onChange={(e) => setParentSearchTerm(e.target.value)}
                                className="h-7 pl-7 text-xs"
                              />
                            </div>
                          </div>
                          <DropdownMenuItem onClick={() => setSelectedParent(null)}>
                            <Folder className="h-4 w-4 mr-2" />
                            Root
                          </DropdownMenuItem>
                          {filteredHierarchy.map(node => (
                            <DropdownMenuItem
                              key={node.id}
                              onClick={() => setSelectedParent(node)}
                              className="flex items-center"
                            >
                              <div style={{ paddingLeft: `${node.level * 12}px` }} className="flex items-center">
                                <Folder className="h-4 w-4 mr-2" />
                                <span className="truncate">{node.name}</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Tab Bar - Only Overview */}
                  <div className="border-b border-gray-300">
                    <div className="flex gap-0">
                      <Button
                        variant="ghost"
                        className="px-3 py-2 text-[14px] font-normal rounded-none border-b-2 transition-colors !bg-transparent hover:!bg-transparent border-primary text-primary"
                      >
                        Overview
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lifecycle Tracker - Only show on Overview tab */}
                {activeTab === 'Overview' && (
                  <div className="px-4 mt-2">
                    <LifecycleTracker 
                      currentStatus={selectedState}
                      lifecycleStages={requirementLifecycleStages}
                      statuses={requirementStatuses}
                    />
                  </div>
                )}

                {/* Overview Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  <OverviewTab requirementId="new" currentStatus={selectedState} />
                </div>
              </div>
              
              {/* Discussions Panel - Right Side */}
              <div className="w-[25%] flex-shrink-0 h-full border-l border-t border-border rounded-[14px]">
                <DiscussionsPanel 
                  requirementId="new" 
                  isFullscreen={isDiscussionFullscreen}
                  onToggleFullscreen={() => setIsDiscussionFullscreen(!isDiscussionFullscreen)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRequirement;