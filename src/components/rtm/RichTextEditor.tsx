import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const isEmpty = !value || value === '';

  return (
    <div className="rich-text-editor w-full h-full flex flex-col">
      {/* Editor - Enhanced textarea */}
      <div className="relative flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || 'Start typing...'}
          className={`w-full h-full p-3 focus:outline-none text-foreground leading-relaxed text-sm transition-all duration-200 resize-none bg-background border rounded-md ${
            isFocused
              ? 'border-primary/50 shadow-sm'
              : 'border-border hover:border-border/80'
          }`}
          style={{ minHeight: '120px' }}
        />
        {/* Custom placeholder overlay when empty and not focused */}
        {isEmpty && !isFocused && (
          <div className="absolute top-3 left-3 text-muted-foreground italic cursor-text hover:text-foreground transition-colors pointer-events-none flex items-center gap-2">
            <Type className="h-4 w-4" />
            {placeholder || 'Click to add content...'}
          </div>
        )}
      </div>

      {/* Toolbar - Only visible when focused */}
      {isFocused && (
        <div className="flex items-center justify-between gap-2 p-2 border-t border-border bg-muted/30 mt-0 rounded-b-md flex-shrink-0">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              title="Bold (Coming soon)"
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              title="Italic (Coming soon)"
            >
              <Italic className="h-3 w-3" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              title="Bullet List (Coming soon)"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              title="Numbered List (Coming soon)"
            >
              <ListOrdered className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {value.length} chars
          </div>
        </div>
      )}
    </div>
  );
};