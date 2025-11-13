"use client";

import { motion } from "framer-motion";
import { Clock, Tag, Star, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface NoteCardProps {
  note: {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    type?: string;
    tags?: string[];
    status?: string;
    summary?: string;
  };
  onClick: () => void;
}

const typeColors = {
  Lecture: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Reading: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Assignment: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Lab: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  Exam: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Note: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function NoteCard({ note, onClick }: NoteCardProps) {
  const noteType = note.type || "Note";
  const typeColorClass = typeColors[noteType as keyof typeof typeColors] || typeColors.Note;

  // Generate a clean summary from content (first 2-3 lines)
  const generateSummary = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    return lines.slice(0, 2).join(" ").substring(0, 150) + (content.length > 150 ? "..." : "");
  };

  const summary = note.summary || generateSummary(note.content);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="group relative overflow-hidden border border-border/40 bg-card hover:border-border hover:shadow-lg transition-all duration-300 rounded-2xl">
        <div className="p-6 space-y-4">
          {/* Type Badge */}
          <div className="flex items-center justify-between">
            <Badge
              className={`${typeColorClass} border-0 font-medium text-xs px-3 py-1 rounded-full`}
            >
              {noteType}
            </Badge>
            {note.status && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 rounded-full border-border/50"
              >
                {note.status}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {note.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {summary}
          </p>

          {/* Footer with metadata */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(note.createdAt)}</span>
              </div>
              {note.tags && note.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{note.tags[0]}</span>
                  {note.tags.length > 1 && (
                    <span className="text-xs">+{note.tags.length - 1}</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
      </Card>
    </motion.div>
  );
}

