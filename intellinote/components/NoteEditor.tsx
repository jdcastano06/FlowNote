"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

interface NoteData {
  _id?: string;
  title: string;
  content: string;
  type?: string;
  tags?: string[];
  status?: string;
  summary?: string;
}

interface NoteEditorProps {
  note: NoteData | null;
  open: boolean;
  onClose: () => void;
  onSave: (note: NoteData) => void;
  onDelete?: (noteId: string) => void;
}

export function NoteEditor({ note, open, onClose, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("Note");
  const [status, setStatus] = useState("active");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setType(note.type || "Note");
      setStatus(note.status || "active");
      setTags(note.tags || []);
    } else {
      resetForm();
    }
  }, [note]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("Note");
    setStatus("active");
    setTags([]);
    setNewTag("");
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    onSave({
      _id: note?._id,
      title,
      content,
      type,
      status,
      tags,
    });
    resetForm();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {note?._id ? "Edit Note" : "Create Note"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week 3 - Event Loops"
              className="text-lg rounded-xl"
            />
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Note">Note</SelectItem>
                  <SelectItem value="Lecture">Lecture</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                  <SelectItem value="Exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add a tag..."
                className="rounded-xl"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                size="icon"
                className="rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full px-3 py-1 flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notes here..."
              rows={12}
              className="rounded-xl resize-none font-mono text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {note?._id && onDelete && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this note?")) {
                      onDelete(note._id);
                      onClose();
                    }
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
                className="rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

