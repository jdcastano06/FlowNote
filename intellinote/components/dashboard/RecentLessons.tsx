"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Clock, FileText } from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  courseId: {
    _id: string;
    title: string;
    icon?: string;
  } | string;
  createdAt: string;
  status?: string;
  summary?: string;
}

interface RecentLessonsProps {
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

export function RecentLessons({ lessons, onLessonClick }: RecentLessonsProps) {
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-foreground">Recent Lessons</h2>
      
      <div className="space-y-3">
        {lessons.slice(0, 3).map((lesson, index) => (
          <motion.div
            key={lesson._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Card 
              className="cursor-pointer hover:bg-accent/50 transition-all duration-200 border"
              onClick={() => onLessonClick(lesson)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-foreground/60" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-medium text-foreground truncate">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(lesson.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {typeof lesson.courseId === "object" && (
                        <Badge variant="outline" className="text-xs font-normal">
                          {lesson.courseId.title}
                        </Badge>
                      )}
                      {lesson.status && (
                        <Badge 
                          variant={lesson.status === "completed" ? "default" : "secondary"}
                          className="text-xs font-normal"
                        >
                          {lesson.status}
                        </Badge>
                      )}
                    </div>
                    
                    {lesson.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {truncateText(lesson.summary, 120)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
