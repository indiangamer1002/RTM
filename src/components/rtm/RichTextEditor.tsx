import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

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
      {/* Editor - Simple textarea for now */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || 'Start typing...'}
          className={`w-full p-3 focus:outline-none text-foreground leading-relaxed text-base transition-all duration-200 resize-none ${
            isFocused
              ? 'min-h-[120px] border border-border rounded-lg bg-background'
              : isEmpty
                ? 'min-h-[60px] border border-transparent hover:border-border rounded-lg cursor-text'
                : 'min-h-[60px] border border-transparent hover:border-border rounded-lg'
          }`}
          rows={isFocused ? 6 : 3}
        />
        {/* Custom placeholder overlay when empty and not focused */}
        {isEmpty && !isFocused && (
          <div
            className="absolute top-3 left-3 text-muted-foreground italic cursor-text hover:text-foreground transition-colors pointer-events-none"
          >
            {placeholder || 'Click to add content...'}
          </div>
        )}
      </div>

      {/* Toolbar - Only visible when focused - Bottom position */}
      {isFocused && (
        <div className="flex items-center gap-1 p-2 border-t border-border bg-muted/20 mt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            title="Bold (Coming soon)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            title="Italic (Coming soon)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            title="Bullet List (Coming soon)"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            title="Numbered List (Coming soon)"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};