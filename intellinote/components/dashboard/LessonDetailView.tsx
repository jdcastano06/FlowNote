"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

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
}

export function LessonDetailView({ lesson }: LessonDetailViewProps) {
  const [showTranscription, setShowTranscription] = useState(false);

  return (
    <div className="p-4 md:p-8 pt-2 md:pt-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              {lesson.title}
            </h1>
            {typeof lesson.courseId !== "string" && (
              <p className="text-muted-foreground">
                {lesson.courseId.title}
              </p>
            )}
          </div>
          
          <Separator />
          
          {/* Main Content - AI Summary or Manual Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {lesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : (
              <p className="text-muted-foreground italic">No content available</p>
            )}
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

