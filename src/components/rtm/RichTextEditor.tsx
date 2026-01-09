import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor w-full">
      {/* Toolbar - Only visible when focused */}
      {isFocused && (
        <div className="flex items-center gap-1 p-3 border-b border-border bg-muted/20 mb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 hover:bg-muted ${
              editor.isActive('bold') ? 'bg-muted' : ''
            }`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 w-8 p-0 hover:bg-muted ${
              editor.isActive('italic') ? 'bg-muted' : ''
            }`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 hover:bg-muted ${
              editor.isActive('bulletList') ? 'bg-muted' : ''
            }`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 hover:bg-muted ${
              editor.isActive('orderedList') ? 'bg-muted' : ''
            }`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className={`w-full p-6 focus:outline-none text-foreground leading-relaxed text-base transition-all duration-200 ${
          isFocused 
            ? 'min-h-[400px] border border-border rounded-lg bg-background' 
            : 'min-h-[400px] border border-transparent hover:border-border rounded-lg'
        }`}
      />
    </div>
  );
};