"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ChevronDown, ChevronUp, Pencil, Save, X, Loader2 } from "lucide-react";
import { RichTextEditor } from "../forms/RichTextEditor";
import { motion, AnimatePresence } from "framer-motion";

interface Lesson {
  _id: string;
  title: string;
  courseId: {
    _id: string;
    title: string;
  } | string;
  content?: string;
  transcription?: string;
}

interface LessonDetailViewProps {
  lesson: Lesson;
  onUpdate?: (updatedLesson: Lesson) => void;
}

export function LessonDetailView({ lesson, onUpdate }: LessonDetailViewProps) {
  const [showTranscription, setShowTranscription] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(lesson.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/lectures/${lesson._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editedContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      const data = await response.json();
      setIsEditing(false);
      
      if (onUpdate && data.lecture) {
        onUpdate(data.lecture);
      }
    } catch (err: any) {
      console.error("Error saving lesson:", err);
      setError(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(lesson.content || "");
    setIsEditing(false);
    setError(null);
  };

  const handleDoubleClick = () => {
    if (!isEditing && lesson.content) {
      setIsEditing(true);
    }
  };

  // Sync editedContent when lesson changes
  useEffect(() => {
    if (!isEditing) {
      setEditedContent(lesson.content || "");
    }
  }, [lesson.content, isEditing]);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {/* Header with Title and Edit Button */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold">
                {lesson.title}
              </h1>
              {typeof lesson.courseId !== "string" && (
                <p className="text-muted-foreground mt-1">
                  {lesson.courseId.title}
                </p>
              )}
            </div>
            {/* Edit Button */}
            {lesson.content && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2 shrink-0"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Notes</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            )}
          </div>
          
          <Separator />
          
          {/* Main Content - AI Summary or Manual Content */}
          <div>

            {/* Edit Mode */}
            <AnimatePresence mode="wait">
              {isEditing ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 pb-20"
                  >
                    <RichTextEditor
                      content={editedContent}
                      onChange={setEditedContent}
                      placeholder="Edit your notes..."
                      minHeight="400px"
                    />

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border border-destructive/50 bg-destructive/5 rounded-lg p-3"
                      >
                        <p className="text-sm text-destructive">{error}</p>
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* Sticky Save/Cancel Buttons */}
                  <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border py-4 -mx-4 md:-mx-6 px-4 md:px-6 mt-4">
                    <div className="flex items-center gap-3 justify-end max-w-4xl mx-auto">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative group"
                >
                  {lesson.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: lesson.content }}
                      onDoubleClick={handleDoubleClick}
                      className="prose prose-neutral dark:prose-invert max-w-none cursor-pointer hover:bg-muted/20 rounded-lg p-2 transition-colors [&_*:first-child]:mt-0 [&_*:last-child]:mb-0"
                      title="Double-click to edit"
                    />
                  ) : (
                    <p className="text-muted-foreground italic">No content available</p>
                  )}
                  {/* Floating edit hint on hover */}
                  {lesson.content && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-background/90 backdrop-blur-sm border border-border rounded-md px-2 py-1 text-xs text-muted-foreground shadow-sm">
                        Double-click to edit
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Transcription Side Note (if available) */}
          {lesson.transcription && lesson.transcription.trim() && (
            <>
              <Separator />
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowTranscription(!showTranscription)}
                  className="w-full justify-between p-0 h-auto font-normal"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    View Raw Transcription
                  </span>
                  {showTranscription ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                {showTranscription && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {lesson.transcription}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

