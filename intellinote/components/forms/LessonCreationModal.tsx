"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { EmojiPickerComponent } from "./EmojiPicker";
import { RichTextEditor } from "./RichTextEditor";
import { X, Loader2 } from "lucide-react";

interface LessonCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "manual" | "audio" | null;
  onCreateLesson: (data: {
    courseName: string;
    courseEmoji: string;
    lessonTitle: string;
    content: string;
  }) => Promise<void>;
}

export function LessonCreationModal({ 
  isOpen, 
  onClose, 
  mode, 
  onCreateLesson 
}: LessonCreationModalProps) {
  const [courseName, setCourseName] = useState("");
  const [courseEmoji, setCourseEmoji] = useState("📚");
  const [lessonTitle, setLessonTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !lessonTitle.trim() || (!content.trim() && mode === "manual")) {
      return;
    }

    setIsLoading(true);
    try {
      await onCreateLesson({
        courseName: courseName.trim(),
        courseEmoji,
        lessonTitle: lessonTitle.trim(),
        content: content.trim(),
      });
      
      // Reset form
      setCourseName("");
      setCourseEmoji("📚");
      setLessonTitle("");
      setContent("");
      onClose();
    } catch (error) {
      console.error("Error creating lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCourseName("");
      setCourseEmoji("📚");
      setLessonTitle("");
      setContent("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "manual" ? "Create Manual Note" : "Create Lesson"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Name and Emoji */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Computer Science 101"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Course Emoji</Label>
              <div className="flex items-center gap-3">
                <EmojiPickerComponent
                  value={courseEmoji}
                  onChange={setCourseEmoji}
                />
                <span className="text-sm text-muted-foreground">Click to change</span>
              </div>
            </div>
          </div>

          {/* Lesson Title */}
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="e.g., Introduction to Variables"
              required
            />
          </div>

          {/* Content (only for manual notes) */}
          {mode === "manual" && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your lesson content..."
                minHeight="300px"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !courseName.trim() || !lessonTitle.trim() || (mode === "manual" && !content.trim())}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${mode === "manual" ? "Note" : "Lesson"}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
