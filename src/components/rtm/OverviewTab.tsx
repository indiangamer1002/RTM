import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from './StatusBadge';
import { ChevronUp, Maximize2, Calendar, User, Flag, FileText, Clock, CheckCircle, Plus } from 'lucide-react';
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

  return (
    <div className="h-full bg-background p-6">
      {/* Top Section - Compact Details */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Requirement Details - Left */}
        <div className="col-span-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="h-4 w-4 text-primary" />
              <Label className="text-base font-semibold text-foreground">Requirement Details</Label>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Source Owner */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <Label className="text-sm font-medium text-foreground">Source Owner</Label>
                </div>
                <Select value={sourceOwner} onValueChange={setSourceOwner}>
                  <SelectTrigger className="h-8 bg-background border-border hover:border-primary/50 transition-colors">
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
                  <SelectTrigger className="h-8 bg-background border-border hover:border-primary/50 transition-colors">
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
                  <SelectTrigger className="h-8 bg-background border-border hover:border-primary/50 transition-colors">
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
            </div>

            {/* Status Badges */}
            {(priority || type) && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status:</Label>
                <div className="flex gap-2">
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

        {/* Timeline & Progress - Right */}
        <div className="col-span-4">
          <div className="bg-card border border-border rounded-lg p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              <Label className="text-base font-semibold text-foreground">Progress & Timeline</Label>
            </div>
            
            {/* Progress Indicator */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium text-foreground">20%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-[20%] bg-primary rounded-full transition-all duration-300" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requirements gathering phase</p>
            </div>

            {/* Key Milestones */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key Milestones</Label>
              {[
                { label: 'Raised', value: '-', status: 'completed' },
                { label: 'Approved', value: '-', status: 'pending' },
                { label: 'Development', value: '-', status: 'pending' },
                { label: 'Testing', value: '-', status: 'pending' },
                { label: 'Released', value: '-', status: 'pending' }
              ].map((milestone, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      milestone.status === 'completed' ? 'bg-green-500' : 'bg-muted-foreground/30'
                    )} />
                    <span className="text-muted-foreground">{milestone.label}:</span>
                  </div>
                  <span className="text-foreground font-medium">{milestone.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section - Side by Side */}
      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-400px)]">
        {/* Description */}
        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 flex-shrink-0">
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
            </div>
          </div>
          <div className="p-4 flex-1 overflow-hidden">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Click to add requirement description..."
            />
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30 flex-shrink-0">
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
            </div>
          </div>
          <div className="p-4 flex-1 overflow-hidden">
            <RichTextEditor
              value={expectedOutcome}
              onChange={setExpectedOutcome}
              placeholder="Click to add expected outcome and success criteria..."
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-6 flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="h-8">
            <FileText className="h-3.5 w-3.5 mr-2" />
            Add Attachment
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <User className="h-3.5 w-3.5 mr-2" />
            Assign Stakeholder
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Calendar className="h-3.5 w-3.5 mr-2" />
            Set Deadline
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            Cancel
          </Button>
          <Button size="sm" className="h-8">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};