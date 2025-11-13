"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { 
  Plus, 
  BookOpen, 
  FileText, 
  Trash2, 
  Search, 
  X, 
  Loader2,
  Clock,
  Tag,
  Star,
  Edit3,
  Calendar
} from "lucide-react";

interface Course {
  _id: string;
  userId: string;
  title: string;
  description: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  _id: string;
  courseId: string;
  userId: string;
  title: string;
  content: string;
  type?: "lecture" | "reading" | "assignment" | "lab" | "other";
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export function DashboardContent() {
  const { isSignedIn, isLoaded } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newCourseIcon, setNewCourseIcon] = useState("📚");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState<"lecture" | "reading" | "assignment" | "lab" | "other">("lecture");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  // Fetch courses when user signs in
  useEffect(() => {
    if (isSignedIn) {
      fetchCourses();
    }
  }, [isSignedIn]);

  // Fetch notes when a course is selected
  useEffect(() => {
    if (selectedCourse && isSignedIn) {
      fetchNotes(selectedCourse._id);
    } else {
      setNotes([]);
    }
  }, [selectedCourse, isSignedIn]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (courseId: string) => {
    try {
      setNotesLoading(true);
      const response = await fetch(`/api/notes?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  const generateSummary = (content: string): string => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const preview = sentences.slice(0, 2).join(". ");
    return preview.length > 120 ? preview.substring(0, 120) + "..." : preview + ".";
  };

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newCourseTitle,
          description: newCourseDescription,
          icon: newCourseIcon,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourses([data.course, ...courses]);
        setNewCourseTitle("");
        setNewCourseDescription("");
        setNewCourseIcon("📚");
        setShowCreateCourse(false);
        setSelectedCourse(data.course);
      }
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!selectedCourse || !newNoteTitle.trim() || !newNoteContent.trim()) return;

    try {
      setLoading(true);
      const summary = generateSummary(newNoteContent);
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse._id,
          title: newNoteTitle,
          content: newNoteContent,
          type: newNoteType,
          summary: summary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNoteTitle("");
        setNewNoteContent("");
        setNewNoteType("lecture");
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? All notes will be deleted.")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCourses(courses.filter((course) => course._id !== courseId));
        if (selectedCourse?._id === courseId) {
          setSelectedCourse(null);
        }
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes(notes.filter((note) => note._id !== noteId));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const getBadgeColor = (type: string) => {
    const colors = {
      lecture: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      reading: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
      assignment: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
      lab: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
      other: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background relative">
      {/* Blurred background overlay when not authenticated */}
      <AnimatePresence>
        {!isSignedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 backdrop-blur-sm bg-background/60"
          />
        )}
      </AnimatePresence>

      {/* Clerk SignIn Modal */}
      <AnimatePresence>
        {!isSignedIn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
              <SignIn
                routing="virtual"
                afterSignInUrl={typeof window !== "undefined" ? window.location.href : "/"}
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0 bg-transparent",
                    cardBox: "w-full",
                  },
                }}
              />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 ${!isSignedIn ? "blur-sm pointer-events-none" : ""}`}>
        {/* Main content area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)] bg-card rounded-xl border border-border overflow-hidden"
        >
            {/* Sidebar */}
            <div className="w-full lg:w-64 bg-muted/20 border-b lg:border-b-0 lg:border-r border-border p-4 sm:p-6 flex-shrink-0">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 bg-background"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Create Course Button */}
              <div className="mb-6">
                <Button
                  onClick={() => setShowCreateCourse(true)}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </div>

              {/* Courses List */}
              <div>
                <div className="text-xs text-muted-foreground px-3 mb-3 font-medium">
                  Courses ({courses.length})
                </div>
                {courses.length === 0 ? (
                  <div className="px-3 py-8 text-center">
                    {loading ? (
                      <Loader2 className="w-8 h-8 mx-auto mb-3 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <BookOpen className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-xs text-muted-foreground">No courses yet</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCourses.map((course) => (
                      <button
                        key={course._id}
                        onClick={() => setSelectedCourse(course)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                          selectedCourse?._id === course._id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        {course.icon ? (
                          <span className="text-lg shrink-0">{course.icon}</span>
                        ) : (
                          <BookOpen className="w-4 h-4 shrink-0" />
                        )}
                        <span className="flex-1 truncate">{course.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-0">
              {showCreateCourse ? (
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                      <h2 className="text-2xl font-semibold mb-2">Create New Course</h2>
                      <p className="text-sm text-muted-foreground">
                        Add a new course to organize your notes
                      </p>
                    </div>

                    <Card>
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Course Icon</label>
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{newCourseIcon}</div>
                            <Input
                              placeholder="📚"
                              value={newCourseIcon}
                              onChange={(e) => setNewCourseIcon(e.target.value)}
                              className="w-32"
                              maxLength={2}
                            />
                            <p className="text-xs text-muted-foreground">Use an emoji</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Course Title</label>
                          <Input
                            placeholder="e.g., CS-UH 2012 - Software Engineering"
                            value={newCourseTitle}
                            onChange={(e) => setNewCourseTitle(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Description (Optional)
                          </label>
                          <Textarea
                            placeholder="Add a description for this course..."
                            value={newCourseDescription}
                            onChange={(e) => setNewCourseDescription(e.target.value)}
                            rows={4}
                            className="w-full"
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button 
                            onClick={handleCreateCourse} 
                            className="flex-1"
                            disabled={loading}
                          >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Course
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCreateCourse(false);
                              setNewCourseTitle("");
                              setNewCourseDescription("");
                              setNewCourseIcon("📚");
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : selectedCourse ? (
                <div className="flex-1 overflow-y-auto bg-background">
                  {selectedNote ? (
                    /* Note Editor View */
                    <div className="min-h-full p-8 md:p-12 max-w-4xl mx-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNote(null)}
                        className="mb-8"
                      >
                        ← Back to {selectedCourse.title}
                      </Button>
                      
                      <div className="space-y-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            <Badge className={`${getBadgeColor(selectedNote.type || "other")} border`}>
                              {selectedNote.type || "other"}
                            </Badge>
                            <h1 className="text-4xl font-semibold tracking-tight">{selectedNote.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {new Date(selectedNote.createdAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNote(selectedNote._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <Separator />

                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                          <p className="text-base leading-relaxed whitespace-pre-wrap">
                            {selectedNote.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Notion-style Roadmap View */
                    <div className="min-h-full">
                      {/* Notion-style Header */}
                      <div className="px-8 md:px-16 pt-12 pb-8">
                        <div className="max-w-7xl mx-auto">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="text-5xl">{selectedCourse.icon || "📚"}</div>
                            <div className="flex-1">
                              <h1 className="text-4xl font-semibold tracking-tight mb-2">
                                {selectedCourse.title}
                              </h1>
                              {selectedCourse.description && (
                                <p className="text-base text-muted-foreground">
                                  {selectedCourse.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCourse(selectedCourse._id)}
                              className="shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span>{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewNoteTitle("");
                                setNewNoteContent("");
                                setNewNoteType("lecture");
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              New Note
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Notes Grid */}
                      <div className="px-8 md:px-16 py-8">
                        <div className="max-w-7xl mx-auto">
                          {/* Create Note Section */}
                          {(newNoteTitle || newNoteContent) && (
                            <Card className="mb-8 border-2 border-primary/20">
                              <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">Create New Note</CardTitle>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setNewNoteTitle("");
                                      setNewNoteContent("");
                                      setNewNoteType("lecture");
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Note Title</label>
                                    <Input
                                      placeholder="e.g., Week 3 - Event Loops"
                                      value={newNoteTitle}
                                      onChange={(e) => setNewNoteTitle(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Type</label>
                                    <select
                                      value={newNoteType}
                                      onChange={(e) => setNewNoteType(e.target.value as any)}
                                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    >
                                      <option value="lecture">Lecture</option>
                                      <option value="reading">Reading</option>
                                      <option value="assignment">Assignment</option>
                                      <option value="lab">Lab</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Content</label>
                                  <Textarea
                                    placeholder="Write your notes here..."
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    rows={6}
                                  />
                                </div>
                                <Button 
                                  onClick={handleCreateNote} 
                                  className="w-full sm:w-auto"
                                  disabled={loading || !newNoteTitle.trim() || !newNoteContent.trim()}
                                >
                                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Create Note
                                </Button>
                              </CardContent>
                            </Card>
                          )}

                          {/* Notes Grid */}
                          {notesLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className="overflow-hidden">
                                  <CardContent className="p-6">
                                    <Skeleton className="h-5 w-20 mb-3" />
                                    <Skeleton className="h-6 w-full mb-2" />
                                    <Skeleton className="h-4 w-24 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : filteredNotes.length === 0 ? (
                            <div className="py-24 text-center">
                              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                              <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                              <p className="text-sm text-muted-foreground mb-6">
                                {notes.length === 0
                                  ? "Create your first note to get started"
                                  : "No notes match your search"}
                              </p>
                              {notes.length === 0 && (
                                <Button
                                  onClick={() => {
                                    setNewNoteTitle("");
                                    setNewNoteContent("");
                                    setNewNoteType("lecture");
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create Note
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredNotes.map((note) => (
                                <motion.div
                                  key={note._id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Card 
                                    className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-border group"
                                    onClick={() => setSelectedNote(note)}
                                  >
                                    <CardContent className="p-6">
                                      {/* Badge */}
                                      <Badge className={`${getBadgeColor(note.type || "other")} border mb-3 text-xs font-medium`}>
                                        {note.type || "other"}
                                      </Badge>

                                      {/* Title */}
                                      <h3 className="text-base font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                        {note.title}
                                      </h3>

                                      {/* Date */}
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                                        <Clock className="w-3 h-3" />
                                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </div>

                                      {/* Summary */}
                                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {note.summary || generateSummary(note.content)}
                                      </p>

                                      {/* Icons Footer */}
                                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Edit3 className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1"></div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteNote(note._id);
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <BookOpen className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No course selected</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {courses.length === 0
                        ? "Create your first course to get started organizing your notes."
                        : "Select a course from the sidebar to view and add notes."}
                    </p>
                    {courses.length === 0 && (
                      <Button onClick={() => setShowCreateCourse(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Course
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
        </motion.div>
      </div>
    </div>
  );
}
