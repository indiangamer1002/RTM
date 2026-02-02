import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PathSelector } from '@/components/ui/PathSelector';
import { NavigationNode } from '@/types/rtm';

interface AddRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NavigationNode[];
  onSubmit: (data: RequirementData) => void;
}

interface RequirementData {
  title: string;
  type: string;
  path: NavigationNode[];
  description: string;
  expectedOutcome: string;
  process: string;
  priority: string;
  status: string;
}

export function AddRequirementDialog({ open, onOpenChange, data, onSubmit }: AddRequirementDialogProps) {
  const [formData, setFormData] = useState<RequirementData>({
    title: '',
    type: '',
    path: [],
    description: '',
    expectedOutcome: '',
    process: '',
    priority: '',
    status: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      type: '',
      path: [],
      description: '',
      expectedOutcome: '',
      process: '',
      priority: '',
      status: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Requirement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="req-title">Title</Label>
            <Input
              id="req-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="req-type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select requirement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requirement">Requirement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="req-path">Path</Label>
            <PathSelector
              data={data}
              selectedPath={formData.path}
              onPathSelect={(path) => setFormData(prev => ({ ...prev, path }))}
            />
          </div>
          
          <div>
            <Label htmlFor="req-description">Description</Label>
            <Textarea
              id="req-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="req-outcome">Expected Outcome</Label>
            <Textarea
              id="req-outcome"
              value={formData.expectedOutcome}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedOutcome: e.target.value }))}
              rows={4}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="req-process">Process</Label>
            <Select value={formData.process} onValueChange={(value) => setFormData(prev => ({ ...prev, process: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select process" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="deployment">Deployment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="req-priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="req-status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="implemented">Implemented</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Requirement</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}