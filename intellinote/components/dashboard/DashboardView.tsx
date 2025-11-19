"use client";

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Mic, Upload, Plus, Clock, FileText } from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  courseId: {
    _id: string;
    title: string;
  } | string;
  createdAt: string;
  content?: string;
}

interface DashboardViewProps {
  lessons: Lesson[];
  onRecordClick: () => void;
  onUploadClick: () => void;
  onManualClick: () => void;
  onLessonClick: (lesson: Lesson) => void;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

export function DashboardView({
  lessons,
  onRecordClick,
  onUploadClick,
  onManualClick,
  onLessonClick,
}: DashboardViewProps) {
  return (
    <div className="p-4 md:p-8 pt-2 md:pt-4 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl font-semibold">Lessons</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Record or upload lectures to automatically generate organized notes
        </p>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card 
          className="border-2 border-border hover:border-foreground transition-all duration-200 group cursor-pointer hover:bg-foreground hover:text-background"
          onClick={onRecordClick}
        >
          <CardContent className="p-8 md:p-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-foreground/5 group-hover:bg-background/10 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Mic className="w-8 h-8 md:w-10 md:h-10 text-foreground/60 group-hover:text-background/80" />
            </div>
            <h3 className="text-base md:text-lg font-medium mb-2">Record Audio</h3>
            <p className="text-xs md:text-sm text-muted-foreground group-hover:text-background/70">
              Use your microphone to record a lecture
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-2 border-border hover:border-foreground transition-all duration-200 group cursor-pointer hover:bg-foreground hover:text-background"
          onClick={onUploadClick}
        >
          <CardContent className="p-8 md:p-16 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-foreground/5 group-hover:bg-background/10 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Upload className="w-8 h-8 md:w-10 md:h-10 text-foreground/60 group-hover:text-background/80" />
            </div>
            <h3 className="text-base md:text-lg font-medium mb-2">Upload File</h3>
            <p className="text-xs md:text-sm text-muted-foreground group-hover:text-background/70">
              Choose an audio file from your device
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Manual Note */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={onManualClick}
          className="px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Manual Note
        </Button>
      </div>

      {/* Recent Lessons */}
      {lessons.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base md:text-lg font-medium">Recent Lessons</h2>
          
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-4 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {lessons.slice(0, 4).map((lesson) => (
              <Card
                key={lesson._id}
                className="flex-shrink-0 w-[280px] md:w-80 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onLessonClick(lesson)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{lesson.title}</h3>
                      {typeof lesson.courseId === "object" && (
                        <p className="text-sm text-muted-foreground">
                          {lesson.courseId.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(lesson.createdAt)}
                    </div>
                  </div>
                  
                  {lesson.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {lesson.content.length > 120 ? lesson.content.substring(0, 120) + "..." : lesson.content}
                    </p>
                  )}
                  {!lesson.content && (
                    <p className="text-sm text-muted-foreground italic">
                      No content available
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

