import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

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
    <div className="p-4">
      <div className="flex gap-8">
        {/* Column 1 - 65% */}
        <div className="flex-1 w-[65%]">
          {/* Description Section */}
          <div className="flex items-center justify-between mb-4">
            <Label className="!text-[17px] font-semibold text-foreground">Description</Label>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Click to add description..."
          />

          {/* Expected Outcome Section */}
          <div className="flex items-center justify-between mb-4 mt-3">
            <Label className="!text-[17px] font-semibold text-foreground">Expected Outcome</Label>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <RichTextEditor
            value={expectedOutcome}
            onChange={setExpectedOutcome}
            placeholder="Click to add expected outcome..."
          />
        </div>

        {/* Column 2 - 35% */}
        <div className="w-[35%] space-y-6">
          {/* Requirement Details */}
          <div>
            <Label className="!text-[17px] font-semibold text-foreground mb-4 block">Requirement Details</Label>
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
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="bug">Bug Fix</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timelines */}
          <div>
            <Label className="!text-[17px] font-semibold text-foreground mb-4 block">Release Timelines</Label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Raised on:</span>
                <span className="text-foreground">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved on:</span>
                <span className="text-foreground">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Development Completed:</span>
                <span className="text-foreground">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Testing Completed:</span>
                <span className="text-foreground">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Released on:</span>
                <span className="text-foreground">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};