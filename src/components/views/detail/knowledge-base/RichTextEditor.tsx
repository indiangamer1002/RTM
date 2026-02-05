import { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'code-block'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet',
  'link', 'code-block'
];

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  minHeight = "min-h-[200px]",
  readOnly = false
}: RichTextEditorProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<ReactQuill>(null);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const containerClasses = cn(
    "border rounded-md shadow-sm bg-background flex flex-col transition-all duration-300",
    isFullscreen ? "fixed inset-0 z-[500] rounded-none h-screen w-screen" : "relative focus-within:ring-1 focus-within:ring-primary/20",
    readOnly && "border-none shadow-none bg-transparent"
  );
  
  if (readOnly) {
     return (
       <div className={cn("prose prose-sm max-w-none p-4 bg-muted/30 rounded-md border text-foreground", minHeight)}>
         <div dangerouslySetInnerHTML={{ __html: value }} />
       </div>
     );
  }

  return (
    <div className={containerClasses}>
       <div className="flex items-center justify-end p-1 border-b bg-muted/30 backdrop-blur-sm sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 mr-1"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

      <div className={cn("flex-grow overflow-auto", isFullscreen && "bg-background")}>
        <ReactQuill 
          ref={editorRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className={cn(minHeight, "flex flex-col")}
        />
      </div>

      <div className="px-3 py-1.5 bg-slate-50 border-t text-[10px] text-muted-foreground flex justify-between">
        <span>Rich Text</span>
        {isFullscreen && <span>Press ESC to exit</span>}
      </div>
    </div>
  );
};

