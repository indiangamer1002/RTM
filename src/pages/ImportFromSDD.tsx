import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { PathSelector } from '@/components/ui/PathSelector';
import { NavigationNode } from '@/types/rtm';
import { Upload, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalHeader } from '@/components/rtm/GlobalHeader';

interface ExtractedRequirement {
  id: string;
  title: string;
  description: string;
  confidence: number;
  selected: boolean;
}

export function ImportFromSDD() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'folder' | 'creating'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [extractedRequirements, setExtractedRequirements] = useState<ExtractedRequirement[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<NavigationNode[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock data for PathSelector
  const mockData: NavigationNode[] = [
    {
      id: '1',
      name: 'Requirements',
      type: 'scope',
      children: [
        { id: '2', name: 'Functional', type: 'scope', children: [] },
        { id: '3', name: 'Non-Functional', type: 'scope', children: [] }
      ]
    }
  ];

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && step !== 'upload') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, step]);

  const handleBack = () => {
    if (hasUnsavedChanges && step !== 'upload') {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
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
              id: '1',
              title: 'User Authentication System',
              description: 'The system shall provide secure user authentication with multi-factor authentication support.',
              confidence: 0.95,
              selected: true
            },
            {
              id: '2', 
              title: 'Data Encryption Requirements',
              description: 'All sensitive data must be encrypted at rest and in transit using AES-256 encryption.',
              confidence: 0.88,
              selected: true
            },
            {
              id: '3',
              title: 'Performance Requirements',
              description: 'The system shall respond to user requests within 2 seconds under normal load conditions.',
              confidence: 0.92,
              selected: true
            }
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
          setHasUnsavedChanges(false);
          navigate('/');
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const selectedCount = extractedRequirements.filter(req => req.selected).length;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader breadcrumb={['RTM', 'Import from SDD']} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to RTM
          </Button>
          <h1 className="text-2xl font-bold">Import Requirements from SDD</h1>
          <p className="text-muted-foreground mt-2">
            Upload your Software Design Document to automatically extract requirements
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
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
                  data={mockData}
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
        </div>
      </div>
    </div>
  );
}