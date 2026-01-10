import { useState } from 'react';
import { Bold, Italic, Link as LinkIcon, List, Code, Quote, Heading1, Heading2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  minHeight = "min-h-[200px]",
  readOnly = false 
}: RichTextEditorProps) => {
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const handleFormat = (format: string) => {
    // In a real implementation with a proper library (like Tiptap/Quill), 
    // this would apply formatting to selection.
    // For this custom implementation, we'll just wrap the text or append markdown syntax.
    // This is a simplified "Markdown-like" behavior for the demo.
    
    const textarea = document.getElementById('kb-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let insertion = '';

    switch (format) {
      case 'bold':
        insertion = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        insertion = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        insertion = `\`${selectedText || 'code'}\``;
        break;
      case 'h1':
        insertion = `\n# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'h2':
        insertion = `\n## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'list':
        insertion = `\n- ${selectedText || 'List item'}`;
        break;
      case 'quote':
        insertion = `\n> ${selectedText || 'Blockquote'}`;
        break;
    }

    if (insertion) {
      newText = value.substring(0, start) + insertion + value.substring(end);
      onChange(newText);
    }
  };

  if (readOnly) {
    return (
      <div className={cn("prose prose-sm max-w-none p-4 bg-muted/30 rounded-md border", minHeight)}>
        <pre className="whitespace-pre-wrap font-sans">{value}</pre>
      </div>
    );
  }

  return (
    <div className="border rounded-md shadow-sm bg-white overflow-hidden focus-within:ring-1 focus-within:ring-primary/20">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 border-b bg-slate-50 overflow-x-auto">
        <ToggleGroup type="multiple" value={activeFormats} onValueChange={setActiveFormats}>
          <ToggleGroupItem value="bold" aria-label="Toggle bold" size="sm" onClick={() => handleFormat('bold')}>
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic" size="sm" onClick={() => handleFormat('italic')}>
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <div className="w-px h-6 bg-border mx-1" />
          <ToggleGroupItem value="h1" aria-label="Heading 1" size="sm" onClick={() => handleFormat('h1')}>
            <Heading1 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="h2" aria-label="Heading 2" size="sm" onClick={() => handleFormat('h2')}>
            <Heading2 className="h-4 w-4" />
          </ToggleGroupItem>
          <div className="w-px h-6 bg-border mx-1" />
          <ToggleGroupItem value="list" aria-label="Bullet list" size="sm" onClick={() => handleFormat('list')}>
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="quote" aria-label="Block quote" size="sm" onClick={() => handleFormat('quote')}>
            <Quote className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="code" aria-label="Code block" size="sm" onClick={() => handleFormat('code')}>
            <Code className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Editor Area */}
      <Textarea
        id="kb-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "border-0 focus-visible:ring-0 rounded-none resize-y p-4 font-mono text-sm leading-relaxed",
          minHeight
        )}
      />
      
      {/* Footer / Status */}
      <div className="px-3 py-1.5 bg-slate-50 border-t text-[10px] text-muted-foreground flex justify-between">
        <span>Markdown supported</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
};
