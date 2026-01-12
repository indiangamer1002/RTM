import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, Trash2, ChevronLeft, ChevronRight, FileText, Maximize2 } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  tags: string[];
  uploadedBy: {
    name: string;
    initials: string;
  };
  uploadedOn: string;
  type: 'generated' | 'uploaded';
  size?: string;
}

interface FilesTabProps {
  requirementId: string;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
}

export const FilesTab = ({ requirementId, documents = [] }: FilesTabProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Convert documents to FileItem format
  const [files, setFiles] = useState<FileItem[]>(() => {
    const convertedFiles = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      tags: doc.name.includes('BRD') ? ['BRD', 'Generated'] : 
            doc.name.includes('API') ? ['API', 'Technical'] :
            doc.name.includes('figma') ? ['UI', 'Design'] : ['Document'],
      uploadedBy: {
        name: doc.uploadedBy,
        initials: doc.uploadedBy.split(' ').map(n => n[0]).join('').toUpperCase()
      },
      uploadedOn: new Date(doc.uploadedAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      type: doc.name.includes('BRD') ? 'generated' as const : 'uploaded' as const,
      size: doc.size
    }));
    
    // Add generated BRD if not present
    const hasBRD = convertedFiles.some(f => f.name.includes('BRD'));
    if (!hasBRD) {
      convertedFiles.unshift({
        id: 'generated-brd',
        name: `${requirementId}-BRD.pdf`,
        tags: ['BRD', 'Generated'],
        uploadedBy: { name: 'System Generated', initials: 'SG' },
        uploadedOn: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        type: 'generated',
        size: '2.1 MB'
      });
    }
    
    return convertedFiles;
  });

  const handleDownload = (file: FileItem) => {
    console.log('Downloading:', file.name);
  };

  const handleDelete = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  const handleUpload = () => {
    console.log('Upload triggered');
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex-1 overflow-y-auto p-4 pb-16 ${isExpanded ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        {/* Files Table */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Existing Attachments</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-muted-foreground">File Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Tags</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Uploaded By</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Uploaded On</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className={file.type === 'generated' ? 'text-blue-600 font-medium' : ''}>
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {file.tags.length > 0 ? (
                        file.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className={`text-xs ${
                              file.type === 'generated' 
                                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                : ''
                            }`}
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-500 text-white text-xs">
                          {file.uploadedBy.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{file.uploadedBy.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{file.uploadedOn}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {file.type !== 'generated' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">1</span>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed Footer with Upload Button - Only for Files Tab */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-10">
        <div className="flex items-center justify-end gap-3">
          <p className="text-xs text-muted-foreground">One time upload limit: 30 Files.</p>
          <Button onClick={handleUpload} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Upload className="h-3 w-3 mr-2" />
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};