"use client";

import { motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";
import { NoteCard } from "./NoteCard";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  type?: string;
  tags?: string[];
  status?: string;
  summary?: string;
}

interface NotesGridProps {
  notes: Note[];
  loading?: boolean;
  onNoteClick: (note: Note) => void;
  onCreateNote: () => void;
}

export function NotesGrid({ notes, loading, onNoteClick, onCreateNote }: NotesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-dashed border-2 border-border/50 rounded-2xl bg-muted/20">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">No notes yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first note to start organizing your course materials.
            </p>
            <Button onClick={onCreateNote} className="rounded-xl" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Note
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note, index) => (
        <motion.div
          key={note._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <NoteCard note={note} onClick={() => onNoteClick(note)} />
        </motion.div>
      ))}
    </div>
  );
}

