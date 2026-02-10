import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { PathSelector } from '@/components/ui/PathSelector';
import { NavigationNode } from '@/types/rtm';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ExtractedRequirement {
  id: string;
  title: string;
  description: string;
  confidence: number;
  selected: boolean;
}

interface ImportFromSDDDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NavigationNode[];
  onSubmit: (data: any) => void;
}

export function ImportFromSDDDrawer({ open, onOpenChange, data, onSubmit }: ImportFromSDDDrawerProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'folder' | 'creating'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [extractedRequirements, setExtractedRequirements] = useState<ExtractedRequirement[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<NavigationNode[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleClose = () => {
    if (hasUnsavedChanges && step !== 'upload') {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        resetDrawer();
        onOpenChange(false);
      }
    } else {
      resetDrawer();
      onOpenChange(false);
    }
  };

  const resetDrawer = () => {
    setStep('upload');
    setFile(null);
    setProgress(0);
    setExtractedRequirements([]);
    setSelectedFolder([]);
    setHasUnsavedChanges(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setHasUnsavedChanges(true);
    }
  };

  const handleGenerateRequirements = async () => {
    if (!file) return;
    
    setStep('processing');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setExtractedRequirements([
            {
              id: '4',
              title: 'Role-Based Access Control (RBAC)',
              description: 'The system shall implement SAP-compliant role-based authorization using predefined business roles and authorization objects to restrict access to transactions and data.',
              confidence: 0.94,
              selected: true
            },
            {
              id: '5',
              title: 'Audit Logging and Traceability',
              description: 'All critical system actions including configuration changes, data updates, and user access events shall be logged with timestamps and retained for audit and compliance purposes.',
              confidence: 0.91,
              selected: true
            },
            {
              id: '6',
              title: 'API Integration Framework',
              description: 'The system shall expose RESTful APIs compatible with SAP integration standards to enable communication with external services and enterprise middleware.',
              confidence: 0.87,
              selected: true
            },
            {
              id: '7',
              title: 'Error Handling and Exception Management',
              description: 'The application shall implement centralized error handling mechanisms with standardized error codes, retry logic, and monitoring alerts aligned with SDD specifications.',
              confidence: 0.90,
              selected: true
            },
            {
              id: '8',
              title: 'Data Validation Rules',
              description: 'Input data shall be validated according to business rules defined in the SDD to ensure data integrity, including field-level validation and cross-object consistency checks.',
              confidence: 0.93,
              selected: true
            },
            {
              id: '9',
              title: 'Scalability and Load Handling',
              description: 'The system architecture shall support horizontal scaling and maintain performance benchmarks during peak usage scenarios as defined in capacity planning guidelines.',
              confidence: 0.89,
              selected: true
            },
          ]);
          setStep('review');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRequirementToggle = (id: string) => {
    setExtractedRequirements(prev =>
      prev.map(req => req.id === id ? { ...req, selected: !req.selected } : req)
    );
  };

  const handleCreateRequirements = async () => {
    setStep('creating');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const selectedReqs = extractedRequirements.filter(req => req.selected);
          onSubmit({
            sddTitle: file?.name.replace(/\.[^/.]+$/, '') || 'SDD Requirements',
            requirements: selectedReqs,
            targetFolder: selectedFolder
          });
          resetDrawer();
          onOpenChange(false);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const selectedCount = extractedRequirements.filter(req => req.selected).length;

  return (
    <Sheet open={open} onOpenChange={() => {}}>
      <SheetContent side="right" className="w-[800px] sm:max-w-[800px] overflow-y-auto [&>button]:hidden">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Import Requirements from SDD</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sdd-file">Upload SDD Document</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your SDD document here, or click to browse
                  </p>
                  <Input
                    id="sdd-file"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleGenerateRequirements} disabled={!file}>
                Generate Requirements
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Analyzing Document</h3>
                <p className="text-sm text-muted-foreground">
                  AI is extracting requirements from your SDD document...
                </p>
              </div>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Review Extracted Requirements</h3>
              <div className="text-sm text-muted-foreground">
                {selectedCount} of {extractedRequirements.length} selected
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {extractedRequirements.map((req) => (
                <div key={req.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={req.selected}
                      onCheckedChange={() => handleRequirementToggle(req.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{req.title}</div>
                        <div className="flex items-center gap-1 text-xs">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            req.confidence > 0.9 ? "bg-green-500" :
                            req.confidence > 0.8 ? "bg-yellow-500" : "bg-red-500"
                          )} />
                          {Math.round(req.confidence * 100)}%
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={() => setStep('folder')} disabled={selectedCount === 0}>
                Continue ({selectedCount})
              </Button>
            </div>
          </div>
        )}

        {step === 'folder' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Select Target Folder</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose where to create the SDD parent requirement and its children.
              </p>
              <PathSelector
                data={data}
                selectedPath={selectedFolder}
                onPathSelect={setSelectedFolder}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Creation Summary</h4>
              <ul className="text-sm space-y-1">
                <li>• Parent: <strong>{file?.name.replace(/\.[^/.]+$/, '') || 'SDD Requirements'}</strong></li>
                <li>• Children: <strong>{selectedCount} requirements</strong></li>
                <li>• Location: <strong>{selectedFolder.length > 0 ? selectedFolder.map(p => p.name).join(' / ') : 'Root'}</strong></li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button onClick={handleCreateRequirements}>
                Create Requirements
              </Button>
            </div>
          </div>
        )}

        {step === 'creating' && (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Creating Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  Setting up your SDD requirements hierarchy...
                </p>
              </div>
              <Progress value={progress} className="w-full max-w-md mx-auto" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}