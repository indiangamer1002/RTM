import { useState } from 'react';
import { Upload, File, FileText, Image, Trash2, Download, Eye, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Attachment } from '@/types/knowledgeBase.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from "@/components/ui/progress";

interface AttachmentsListProps {
  attachments: Attachment[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-blue-500" />;
};

export const AttachmentsList = ({ attachments, onUpload, onDelete }: AttachmentsListProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      await onUpload(file);
      setUploadProgress(100);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-slate-100 rounded-full">
            <Upload className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <label
              htmlFor="file-upload"
              className="text-sm font-medium text-primary hover:text-primary/80 cursor-pointer"
            >
              Click to upload
            </label>
            <span className="text-sm text-muted-foreground"> or drag and drop</span>
          </div>
          <p className="text-xs text-muted-foreground">
            SVG, PNG, JPG or PDF up to 10MB
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No documents attached yet.
          </div>
        ) : (
          attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-card border rounded-md group hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(file.mimeType)}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)} • {new Date(file.uploadDate).toLocaleDateString()} • {file.uploadedBy}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                   <Eye className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                   <Download className="h-4 w-4" />
                 </Button>
                 
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => onDelete(file.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                 </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
