import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

interface OverviewTabProps {
  requirementId: string;
}

export const OverviewTab = ({ requirementId }: OverviewTabProps) => {
  const [description, setDescription] = useState('');

  return (
    <div className="px-6 pt-0 pb-6">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-lg font-semibold text-foreground">Description</Label>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <RichTextEditor
        value={description}
        onChange={setDescription}
        placeholder="Describe the requirement in detail..."
      />
    </div>
  );
};