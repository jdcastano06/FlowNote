"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Plus, BookOpen, FileText, Trash2, Search, X, Loader2 } from "lucide-react";

interface Course {
  _id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  _id: string;
  courseId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function DashboardContent() {
  const { isSignedIn, isLoaded } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourses([data.course, ...courses]);
        setNewCourseTitle("");
        setNewCourseDescription("");
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
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse._id,
          title: newNoteTitle,
          content: newNoteContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNoteTitle("");
        setNewNoteContent("");
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
                        <BookOpen className="w-4 h-4 shrink-0" />
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
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                  <div className="max-w-4xl mx-auto">
                    {/* Course Header */}
                    <div className="mb-8 pb-6 border-b border-border">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h2 className="text-2xl font-semibold mb-2">{selectedCourse.title}</h2>
                          {selectedCourse.description && (
                            <p className="text-sm text-muted-foreground">
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
                      <p className="text-xs text-muted-foreground mt-4">
                        {notes.length}{" "}
                        {notes.length === 1 ? "note" : "notes"}
                      </p>
                    </div>

                    {/* Create Note Form */}
                    <Card className="mb-8">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Add Note</CardTitle>
                        <CardDescription>Create a new note for this course</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Note Title</label>
                          <Input
                            placeholder="e.g., Week 3 - Event Loops"
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                          />
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
                          disabled={loading}
                        >
                          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Add Note
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Notes List */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Notes ({filteredNotes.length})
                      </h3>
                      {notesLoading ? (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                            <p className="text-sm text-muted-foreground">Loading notes...</p>
                          </CardContent>
                        </Card>
                      ) : filteredNotes.length === 0 ? (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-sm text-muted-foreground">
                              {notes.length === 0
                                ? "No notes yet. Create your first note above."
                                : "No notes match your search."}
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {filteredNotes.map((note) => (
                            <Card key={note._id}>
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <CardTitle className="text-base mb-1">{note.title}</CardTitle>
                                    <CardDescription className="text-xs">
                                      {new Date(note.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </CardDescription>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    onClick={() => handleDeleteNote(note._id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                  {note.content}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
