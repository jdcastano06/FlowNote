"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Loader2, CheckCircle, Edit3 } from "lucide-react";

interface ConfirmationCardProps {
  suggestedCourse: string;
  suggestedLessonTitle: string;
  isNewCourse: boolean;
  courseId?: string;
  transcription?: string;
  onConfirm: (courseTitle: string, lessonTitle: string, courseId?: string, originalCourseTitle?: string) => void;
  onCancel: () => void;
}

export function ConfirmationCard({
  suggestedCourse,
  suggestedLessonTitle,
  isNewCourse,
  courseId,
  transcription,
  onConfirm,
  onCancel,
}: ConfirmationCardProps) {
  const [courseTitle, setCourseTitle] = useState(suggestedCourse);
  const [lessonTitle, setLessonTitle] = useState(suggestedLessonTitle);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(
        courseTitle.trim() || suggestedCourse,
        lessonTitle.trim() || suggestedLessonTitle,
        courseId,
        suggestedCourse // Pass original course title to detect changes
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const truncateTranscription = (text: string, maxLength: number = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-foreground/60" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">Confirm Lesson Details</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI has analyzed your audio and suggested these details
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="course-title" className="text-sm font-medium">
                Course
              </Label>
              <Badge variant={isNewCourse ? "default" : "outline"} className="text-xs">
                {isNewCourse ? "New Course" : "Existing Course"}
              </Badge>
            </div>
            <Input
              id="course-title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Enter course name"
              className="font-normal"
            />
          </div>

          {/* Lesson Title */}
          <div className="space-y-3">
            <Label htmlFor="lesson-title" className="text-sm font-medium">
              Lesson Title
            </Label>
            <Input
              id="lesson-title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="font-normal"
            />
          </div>

          {/* Transcription Preview */}
          {transcription && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Transcript Preview</Label>
                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="border rounded-lg p-4 bg-muted/30 max-h-32 overflow-y-auto">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {truncateTranscription(transcription)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 font-normal"
              disabled={isConfirming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 font-normal"
              disabled={isConfirming || !courseTitle.trim() || !lessonTitle.trim()}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Lesson...
                </>
              ) : (
                "Confirm & Generate Notes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
