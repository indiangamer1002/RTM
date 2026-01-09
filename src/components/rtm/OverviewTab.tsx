import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from './StatusBadge';
import { ChevronUp, Maximize2, Calendar, User, Flag, FileText, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  requirementId: string;
}

export const OverviewTab = ({ requirementId }: OverviewTabProps) => {
  const [description, setDescription] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [sourceOwner, setSourceOwner] = useState('');
  const [priority, setPriority] = useState('');
  const [type, setType] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isOutcomeExpanded, setIsOutcomeExpanded] = useState(false);

  return (
    <div className="h-full bg-background">
      <div className="flex gap-6 p-6 h-full">
        {/* Main Content - 65% */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Description Section */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold text-foreground">Description</Label>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Expand"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  title={isDescriptionExpanded ? "Collapse" : "Expand"}
                >
                  <ChevronUp className={cn("h-3.5 w-3.5 transition-transform", isDescriptionExpanded && "rotate-180")} />
                </Button>
              </div>
            </div>
            <div className={cn("transition-all duration-200", isDescriptionExpanded ? "p-6" : "p-4")}>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Click to add requirement description..."
              />
            </div>
          </div>

          {/* Expected Outcome Section */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold text-foreground">Expected Outcome</Label>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Expand"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOutcomeExpanded(!isOutcomeExpanded)}
                  title={isOutcomeExpanded ? "Collapse" : "Expand"}
                >
                  <ChevronUp className={cn("h-3.5 w-3.5 transition-transform", isOutcomeExpanded && "rotate-180")} />
                </Button>
              </div>
            </div>
            <div className={cn("transition-all duration-200", isOutcomeExpanded ? "p-6" : "p-4")}>
              <RichTextEditor
                value={expectedOutcome}
                onChange={setExpectedOutcome}
                placeholder="Click to add expected outcome and success criteria..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar - 35% */}
        <div className="w-[350px] space-y-6 flex-shrink-0">
          {/* Requirement Details Card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold text-foreground">Requirement Details</Label>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Source Owner */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Source Owner</Label>
                </div>
                <Select value={sourceOwner} onValueChange={setSourceOwner}>
                  <SelectTrigger className="h-9 bg-background border-border hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Smith</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="mike">Mike Davis</SelectItem>
                    <SelectItem value="lisa">Lisa Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Priority</Label>
                </div>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-9 bg-background border-border hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Low
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Type</Label>
                </div>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-9 bg-background border-border hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Fix</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                    <SelectItem value="business">Business Requirement</SelectItem>
                    <SelectItem value="functional">Functional Requirement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Status Display */}
              {(priority || type) && (
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Status</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {priority && (
                      <StatusBadge 
                        label={priority.charAt(0).toUpperCase() + priority.slice(1)} 
                        type={priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success'} 
                      />
                    )}
                    {type && (
                      <StatusBadge 
                        label={type.charAt(0).toUpperCase() + type.slice(1)} 
                        type="info" 
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Release Timelines Card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold text-foreground">Release Timelines</Label>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { label: 'Raised on', value: '-', icon: Calendar },
                  { label: 'Approved on', value: '-', icon: CheckCircle },
                  { label: 'Development Completed', value: '-', icon: FileText },
                  { label: 'Testing Completed', value: '-', icon: CheckCircle },
                  { label: 'Released on', value: '-', icon: Calendar }
                ].map((timeline, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                    <div className="flex items-center gap-2">
                      <timeline.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{timeline.label}:</span>
                    </div>
                    <span className="text-sm text-foreground font-medium">{timeline.value}</span>
                  </div>
                ))}
              </div>
              
              {/* Timeline Progress Indicator */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</Label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[20%] bg-primary rounded-full transition-all duration-300" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">20%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Requirements gathering phase</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <Label className="text-base font-semibold text-foreground">Quick Actions</Label>
            </div>
            <div className="p-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start h-8">
                <FileText className="h-3.5 w-3.5 mr-2" />
                Add Attachment
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start h-8">
                <User className="h-3.5 w-3.5 mr-2" />
                Assign Stakeholder
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start h-8">
                <Calendar className="h-3.5 w-3.5 mr-2" />
                Set Deadline
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};