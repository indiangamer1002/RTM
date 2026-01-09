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
    <div className="rich-text-editor w-full">
      {/* Editor - Enhanced textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || 'Start typing...'}
          className={`w-full p-4 focus:outline-none text-foreground leading-relaxed text-sm transition-all duration-200 resize-none bg-background border rounded-md ${
            isFocused
              ? 'min-h-[140px] border-primary/50 shadow-sm'
              : isEmpty
                ? 'min-h-[80px] border-border hover:border-border/80'
                : 'min-h-[80px] border-border hover:border-border/80'
          }`}
          rows={isFocused ? 8 : 4}
        />
        {/* Custom placeholder overlay when empty and not focused */}
        {isEmpty && !isFocused && (
          <div className="absolute top-4 left-4 text-muted-foreground italic cursor-text hover:text-foreground transition-colors pointer-events-none flex items-center gap-2">
            <Type className="h-4 w-4" />
            {placeholder || 'Click to add content...'}
          </div>
        )}
      </div>

      {/* Toolbar - Only visible when focused */}
      {isFocused && (
        <div className="flex items-center justify-between gap-2 p-3 border-t border-border bg-muted/30 mt-0 rounded-b-md">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Bold (Coming soon)"
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Italic (Coming soon)"
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Bullet List (Coming soon)"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted"
              title="Numbered List (Coming soon)"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {value.length} characters
          </div>
        </div>
      )}
    </div>
  );
};