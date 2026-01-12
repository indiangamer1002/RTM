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
