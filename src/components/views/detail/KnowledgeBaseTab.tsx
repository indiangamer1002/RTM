import { useState, useEffect } from 'react';
import { 
    KnowledgeBase, 
    KnowledgeBaseContent 
} from '@/types/knowledgeBase.types';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
    Loader2, Save, PenLine, Download, Share2, Undo, 
    FileText, BookOpen, ExternalLink, Code
} from 'lucide-react';
import { RichTextEditor } from './knowledge-base/RichTextEditor';
import { StructuredPanels } from './knowledge-base/StructuredPanels';
import { AttachmentsList } from './knowledge-base/AttachmentsList';
import { MetadataPanel, ChangeLogPanel } from './knowledge-base/ChangeLogPanel';
import { Badge } from '@/components/ui/badge';
import { 
    Accordion, 
    AccordionContent, 
    AccordionItem, 
    AccordionTrigger 
} from '@/components/ui/accordion';

interface KnowledgeBaseTabProps {
  requirementId: string;
}

export const KnowledgeBaseTab = ({ requirementId }: KnowledgeBaseTabProps) => {
  const [data, setData] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for editing
  const [localContent, setLocalContent] = useState<KnowledgeBaseContent | null>(null);
  const debouncedContent = useDebounce(localContent, 2000); // 2 second debounce for auto-save

  // Fetch Data
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
        setLoading(true);
        try {
            const kbData = await knowledgeBaseService.fetchKB(requirementId);
            if (mounted) {
                setData(kbData);
                setLocalContent(kbData.content);
            }
        } catch (error) {
            toast.error("Failed to load Knowledge Base");
        } finally {
            if (mounted) setLoading(false);
        }
    };
    loadData();
    return () => { mounted = false; };
  }, [requirementId]);

  // Auto-Save Effect
  useEffect(() => {
      if (!editMode || !debouncedContent || !data) return;

      const saveData = async () => {
          setIsSaving(true);
          try {
              const updated = await knowledgeBaseService.updateKB(requirementId, { content: debouncedContent });
              setData(updated);
              setLastSaved(new Date());
              // toast.success("Changes saved automatically", { duration: 1000 });
          } catch (error) {
              toast.error("Auto-save failed");
          } finally {
              setIsSaving(false);
          }
      };

      // Only save if content actually changed from what's on server/state
      if (JSON.stringify(debouncedContent) !== JSON.stringify(data.content)) {
          saveData();
      }
  }, [debouncedContent, editMode, requirementId, data]);

  const handleManualSave = async () => {
      if (!localContent) return;
      setIsSaving(true);
      try {
          const updated = await knowledgeBaseService.updateKB(requirementId, { content: localContent });
          setData(updated);
          setLastSaved(new Date());
          setEditMode(false);
          toast.success("Knowledge Base saved successfully");
      } catch (error) {
          toast.error("Failed to save changes");
      } finally {
          setIsSaving(false);
      }
  };

  const handleUpload = async (file: File) => {
      try {
          const newAttachment = await knowledgeBaseService.uploadAttachment(requirementId, file);
          setData(prev => prev ? { ...prev, attachments: [...prev.attachments, newAttachment] } : null);
          toast.success("File uploaded successfully");
      } catch (error) {
          toast.error("Upload failed");
      }
  };

  const handleDeleteAttachment = async (id: string) => {
      // In a real app we would call service.deleteAttachment
      // await knowledgeBaseService.deleteAttachment(requirementId, id);
      setData(prev => prev ? { 
          ...prev, 
          attachments: prev.attachments.filter(a => a.id !== id) 
      } : null);
      toast.success("Attachment removed");
  };

  if (loading) {
      return (
          <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  if (!data || !localContent) return null;

  return (
    <div className="w-full h-full">
      <div className="px-6 py-4 max-w-none">
        {/* Header Actions */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Documentation</h2>
              {isSaving && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                  </span>
              )}
              {!isSaving && lastSaved && (
                  <span className="text-xs text-muted-foreground">
                      Saved {lastSaved.toLocaleTimeString()}
                  </span>
              )}
          </div>
          
          <div className="flex items-center gap-2">
              {!editMode ? (
                  <>
                      <Button variant="outline" size="sm" onClick={() => toast.info("Export feature coming soon")}>
                          <Download className="h-4 w-4 mr-2" /> Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast.info("Share feature coming soon")}>
                          <Share2 className="h-4 w-4 mr-2" /> Share
                      </Button>
                      <Button onClick={() => setEditMode(true)} size="sm">
                          <PenLine className="h-4 w-4 mr-2" /> Edit Mode
                      </Button>
                  </>
              ) : (
                  <>
                      <Button variant="ghost" size="sm" onClick={() => {
                          setLocalContent(data.content); // Revert
                          setEditMode(false);
                      }}>
                          <Undo className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                      <Button onClick={handleManualSave} disabled={isSaving} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          <Save className="h-4 w-4 mr-2" /> Save Changes
                      </Button>
                  </>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-6">
            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* Knowledge Base Content - Accordion Structure */}
              <section className="space-y-2">
                  <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Knowledge Base Content</h3>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg">
                    <Accordion type="multiple" className="w-full">
                      {/* Overview Section */}
                      <AccordionItem value="overview" className="border-b border-border">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium">Overview</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">REQ-001 Scope</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Implementation of calendar integration functionality to synchronize events between 
                              the application and Outlook calendar system, ensuring seamless event management.
                            </p>
                            <div className="bg-muted/30 p-3 rounded-md">
                              <p className="text-xs text-muted-foreground">
                                <strong>Goal:</strong> Enable users to create, update, and manage calendar events 
                                that automatically sync with their Outlook calendar, preventing conflicts and 
                                ensuring consistent scheduling across platforms.
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Key Resources Section */}
                      <AccordionItem value="resources" className="border-b border-border">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="font-medium">Key Resources</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">API Documentation</h4>
                              <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  Outlook Calendar API Reference
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  Microsoft Graph API Documentation
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  Authentication & Authorization Guide
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-2">Technical Specifications</h4>
                              <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                <ExternalLink className="h-3 w-3 mr-2" />
                                Calendar Integration Architecture
                              </Button>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">Testing Resources</h4>
                              <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                  <Code className="h-3 w-3 mr-2" />
                                  Integration Test Suite
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start h-8">
                                  <Code className="h-3 w-3 mr-2" />
                                  API Mock Server
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Related Processes Section */}
                      <AccordionItem value="related" className="border-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="font-medium">Related Documentation</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Related Requirements</h4>
                              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                                <Button variant="ghost" size="sm" className="w-full justify-start h-8 p-2">
                                  <FileText className="h-3 w-3 mr-2" />
                                  REQ-002: User Authentication System
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1 px-2">
                                  Defines authentication requirements for accessing external calendar services
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">Implementation Dependencies</h4>
                              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                                <Button variant="ghost" size="sm" className="w-full justify-start h-8 p-2">
                                  <FileText className="h-3 w-3 mr-2" />
                                  REQ-003: Event Management Interface
                                </Button>
                                <p className="text-xs text-muted-foreground mt-1 px-2">
                                  UI components and workflows for managing calendar events within the application
                                </p>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
              </section>

              {/* Implementation Notes */}
              <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Implementation Notes</h3>
                  <RichTextEditor 
                      value={editMode ? localContent.implementationNotes : data.content.implementationNotes}
                      onChange={(val) => setLocalContent({ ...localContent, implementationNotes: val })}
                      readOnly={!editMode}
                      minHeight="min-h-[100px]"
                  />
              </section>

              {/* Structured Panels (AC, Specs, Risks, etc.) */}
              <section>
                  <StructuredPanels 
                      content={editMode ? localContent : data.content}
                      onChange={(updates) => setLocalContent({ ...localContent, ...updates })}
                      readOnly={!editMode}
                  />
              </section>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
              {/* Metadata */}
              <MetadataPanel metadata={data.metadata} />

              {/* Attachments */}
              <div className="rounded-lg border bg-card">
                  <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                           <h3 className="font-semibold text-sm">Attachments</h3>
                           <Badge variant="secondary">{data.attachments.length}</Badge>
                      </div>
                  </div>
                  <div className="p-4">
                      <AttachmentsList 
                        attachments={data.attachments} 
                        onUpload={handleUpload}
                        onDelete={handleDeleteAttachment}
                      />
                  </div>
              </div>

              {/* Activity / Changelog */}
              <div className="rounded-lg border bg-card p-4">
                  <ChangeLogPanel metadata={data.metadata} />
              </div>
          </div>
      </div>
    </div>
    </div>
  );
};
