import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PathSelector } from '@/components/ui/PathSelector';
import { NavigationNode } from '@/types/rtm';

interface AddFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NavigationNode[];
  onSubmit: (data: FolderData) => void;
}

interface FolderData {
  title: string;
  path: NavigationNode[];
  type: string;
}

export function AddFolderDialog({ open, onOpenChange, data, onSubmit }: AddFolderDialogProps) {
  const [formData, setFormData] = useState<FolderData>({
    title: '',
    path: [],
    type: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', path: [], type: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Folder Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="path">Path</Label>
            <PathSelector
              data={data}
              selectedPath={formData.path}
              onPathSelect={(path) => setFormData(prev => ({ ...prev, path }))}
            />
          </div>
          
          <div>
            <Label htmlFor="type">Folder Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="scope">Scope</SelectItem>
                <SelectItem value="process">Process</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Folder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}