"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { AudioTranscriptionUpload } from "./AudioTranscriptionUpload";
import { NewLessonDropdown } from "./NewLessonDropdown";
import { LessonCreationModal } from "./LessonCreationModal";
import { Breadcrumbs } from "./Breadcrumbs";
import { 
  Search, 
  X, 
  Loader2,
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  Mic,
  Upload,
  Plus,
  Settings,
  Home,
  ChevronUp,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";

interface Course {
  _id: string;
  userId: string;
  title: string;
  description: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

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
  content?: string; // AI summary for audio, or manual content
  transcription?: string; // Raw transcription from audio
}

type ViewState = "dashboard" | "lesson-detail" | "upload-audio";

export function DashboardContent() {
  const { isSignedIn, isLoaded } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonModalMode, setLessonModalMode] = useState<"manual" | "audio" | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch data when user signs in
  useEffect(() => {
    if (isSignedIn) {
      fetchCourses();
      fetchLessons();
    }
  }, [isSignedIn]);

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

  const fetchLessons = async () => {
    try {
      const response = await fetch("/api/lectures?limit=10");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched lessons:", data); // Debug log
        setLessons(data.lectures || []);
      } else {
        console.error("Failed to fetch lessons:", response.status);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentView("lesson-detail");
    setShowTranscription(false); // Reset transcription toggle when switching lessons
    setMobileMenuOpen(false); // Close mobile menu when navigating
  };

  const handleNewLessonActionWithClose = (action: "record" | "upload" | "manual") => {
    handleNewLessonAction(action);
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    setCurrentView("dashboard");
    setMobileMenuOpen(false);
  };

  // Sidebar content component (reusable for desktop and mobile)
  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div className={`p-4 md:p-6 border-b border-border ${collapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-background" />
          </div>
          {!collapsed && <span className="text-lg font-semibold">NoteFlow</span>}
        </div>
      </div>

      {/* New Lesson Button */}
      <div className={`p-4 md:p-6 ${collapsed ? 'flex justify-center' : ''}`}>
        <NewLessonDropdown
          onRecordAudio={() => handleNewLessonActionWithClose("record")}
          onUploadFile={() => handleNewLessonActionWithClose("upload")}
          onManualNote={() => handleNewLessonActionWithClose("manual")}
          collapsed={collapsed}
        />
      </div>

      {/* All Lessons Button */}
      <div className={`px-4 md:px-6 pb-4 md:pb-6 ${collapsed ? 'flex justify-center' : ''}`}>
        <Button 
          variant={currentView === "dashboard" ? "default" : "ghost"}
          className={`w-full ${collapsed ? 'w-10 p-0 justify-center' : 'justify-start'}`}
          onClick={handleDashboardClick}
          title={collapsed ? "All Lessons" : undefined}
        >
          <Home className="w-4 h-4" />
          {!collapsed && <span className="ml-2">All Lessons</span>}
        </Button>
      </div>

      {/* Courses Section */}
      <div className={`flex-1 pb-4 md:pb-6 overflow-hidden flex flex-col min-h-0 ${collapsed ? 'px-2' : 'px-4 md:px-6'}`}>
        {!collapsed && (
          <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
            Courses
          </div>
        )}
        
        <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
          {courses.map((course) => {
            const isExpanded = expandedCourses.has(course._id);
            const courseLessons = lessons.filter(lesson => {
              if (!lesson.courseId) return false;
              const courseIdMatch = typeof lesson.courseId === "object" 
                ? lesson.courseId._id === course._id
                : lesson.courseId === course._id;
              return courseIdMatch;
            });

            if (collapsed) {
              return (
                <Button
                  key={course._id}
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10"
                  onClick={() => {
                    // On collapsed, expand sidebar and show course
                    setSidebarCollapsed(false);
                    toggleCourseExpansion(course._id);
                  }}
                  title={course.title}
                >
                  <span className="text-lg">{course.icon || "📚"}</span>
                </Button>
              );
            }

            return (
              <div key={course._id}>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-left h-auto p-2"
                  onClick={() => toggleCourseExpansion(course._id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                    {course.icon && <span className="text-sm shrink-0">{course.icon}</span>}
                    <span className="text-sm font-medium truncate">{course.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {courseLessons.length}
                  </span>
                </Button>
                
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {courseLessons.length > 0 ? (
                      courseLessons.map((lesson) => (
                        <Button
                          key={lesson._id}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto p-2 text-sm text-muted-foreground hover:text-foreground truncate"
                          onClick={() => handleLessonClick(lesson)}
                          title={lesson.title}
                        >
                          {lesson.title}
                        </Button>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        No lessons yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className={`p-4 md:p-6 border-t border-border ${collapsed ? 'flex justify-center' : ''}`}>
        <Button 
          variant="ghost" 
          className={`w-full ${collapsed ? 'w-10 p-0 justify-center' : 'justify-start'}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Settings</span>}
        </Button>
      </div>

      {/* Collapse/Expand Button (Desktop only) */}
      {!collapsed && (
        <div className="hidden md:block p-2 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={() => setSidebarCollapsed(true)}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );

  const toggleCourseExpansion = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
      } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const handleNewLessonAction = (action: "record" | "upload" | "manual") => {
    if (action === "upload") {
      setCurrentView("upload-audio");
    } else if (action === "manual") {
      setLessonModalMode("manual");
      setShowLessonModal(true);
    } else if (action === "record") {
      // TODO: Implement recording functionality
      console.log("Record audio functionality to be implemented");
    }
  };

  const handleCreateLesson = async (data: {
    courseName: string;
    courseEmoji: string;
    lessonTitle: string;
    content: string;
  }) => {
    try {
      // Validate input data
      if (!data.courseName || !data.courseName.trim()) {
        throw new Error("Course name is required");
      }
      if (!data.lessonTitle || !data.lessonTitle.trim()) {
        throw new Error("Lesson title is required");
      }
      if (!data.content || !data.content.trim()) {
        throw new Error("Content is required");
      }

      const courseName = data.courseName.trim();
      const lessonTitle = data.lessonTitle.trim();
      const content = data.content.trim();

      console.log("handleCreateLesson called with validated data:", {
        courseName,
        courseEmoji: data.courseEmoji,
        lessonTitle,
        contentLength: content.length
      });

      // Create or find course - ensure we use the courseName for the course title
      let courseId = "";
      const existingCourse = courses.find(c => 
        c.title.toLowerCase().trim() === courseName.toLowerCase()
      );

      if (existingCourse) {
        courseId = existingCourse._id;
        console.log("Using existing course - Course title:", existingCourse.title, "Course ID:", courseId);
      } else {
        console.log("Creating new course - Course title:", courseName, "Icon:", data.courseEmoji);
        const courseResponse = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: courseName, // Course title comes from courseName field
            description: "",
            icon: data.courseEmoji || "📚",
          }),
        });

        if (!courseResponse.ok) {
          const errorData = await courseResponse.json();
          console.error("Failed to create course:", errorData);
          throw new Error(`Failed to create course: ${errorData.error || "Unknown error"}`);
        }

        const courseData = await courseResponse.json();
        courseId = courseData.course._id;
        console.log("Course created successfully - Course title:", courseData.course.title, "Course ID:", courseId);
        setCourses(prev => [courseData.course, ...prev]);
      }

      if (!courseId) {
        throw new Error("Failed to get or create course ID");
      }

      // Create lecture - ensure we use lessonTitle for the lecture title
      console.log("Creating lecture - Lecture title:", lessonTitle, "Course ID:", courseId);
      const lectureResponse = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: lessonTitle, // Lecture title comes from lessonTitle field
          audioUrl: "",
          content: content, // Content goes directly to lecture.content
        }),
      });

      if (!lectureResponse.ok) {
        const errorData = await lectureResponse.json();
        console.error("Failed to create lecture:", errorData);
        throw new Error(`Failed to create lecture: ${errorData.error || errorData.details || "Unknown error"}`);
      }

      const lectureData = await lectureResponse.json();
      console.log("Lecture created successfully:", {
        lectureTitle: lectureData.lecture?.title,
        courseTitle: typeof lectureData.lecture?.courseId === 'object' ? lectureData.lecture.courseId.title : 'N/A',
        noteContentLength: lectureData.note?.content?.length || 0
      });
      
      fetchLessons();
      fetchCourses();
    } catch (error: any) {
      console.error("Error creating lesson:", error);
      throw error;
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    
    if (currentView === "dashboard") {
      breadcrumbs.push({ label: "Dashboard" });
    } else if (currentView === "lesson-detail" && selectedLesson) {
      breadcrumbs.push(
        { label: "Dashboard", onClick: () => setCurrentView("dashboard") },
        { label: selectedLesson.title }
      );
    } else if (currentView === "upload-audio") {
      breadcrumbs.push(
        { label: "Dashboard", onClick: () => setCurrentView("dashboard") },
        { label: "Upload Audio" }
      );
    }
    
    return breadcrumbs;
  };

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

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex bg-background border-r border-border flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-72'
      }`}>
        {sidebarCollapsed ? (
          <>
            <SidebarContent collapsed={true} />
            <div className="p-2 border-t border-border">
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <SidebarContent collapsed={false} />
        )}
      </aside>


      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        {/* Auth Overlay */}
      <AnimatePresence>
        {!isSignedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
              <SignIn
                routing="virtual"
                afterSignInUrl={typeof window !== "undefined" ? window.location.href : "/"}
              />
          </motion.div>
        )}
      </AnimatePresence>

        {isSignedIn && (
          <>
            {/* Mobile Header with Menu Button */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-0">
                    <div className="h-full flex flex-col">
                      <SidebarContent collapsed={false} />
              </div>
                  </SheetContent>
                </Sheet>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-foreground rounded-lg flex items-center justify-center">
                    <FileText className="w-3 h-3 text-background" />
                  </div>
                  <span className="font-semibold">NoteFlow</span>
                  </div>
              </div>
            </div>

            {/* Breadcrumbs */}
            <div className="p-4 md:p-8 pb-2 md:pb-4">
              <Breadcrumbs items={getBreadcrumbs()} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {currentView === "dashboard" && (
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
                      onClick={() => handleNewLessonAction("record")}
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
                      onClick={() => handleNewLessonAction("upload")}
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
                      onClick={() => handleNewLessonAction("manual")}
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
                            onClick={() => handleLessonClick(lesson)}
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
              )}

              {currentView === "upload-audio" && (
                <div className="p-4 md:p-8 pt-2 md:pt-4">
                  <AudioTranscriptionUpload 
                    onNotesGenerated={() => {
                      fetchLessons();
                      fetchCourses();
                      setCurrentView("dashboard");
                    }}
                  />
                </div>
              )}

              {currentView === "lesson-detail" && selectedLesson && (
                <div className="p-4 md:p-8 pt-2 md:pt-4">
                  <div className="max-w-4xl mx-auto">
                    <div className="space-y-4 md:space-y-6">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                          {selectedLesson.title}
                        </h1>
                        {typeof selectedLesson.courseId !== "string" && (
                          <p className="text-muted-foreground">
                            {selectedLesson.courseId.title}
                          </p>
                        )}
                      </div>
                      
                      <Separator />
                      
                      {/* Main Content - AI Summary or Manual Content */}
                      <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {selectedLesson.content ? (
                          <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                        ) : (
                          <p className="text-muted-foreground italic">No content available</p>
                        )}
                      </div>

                      {/* Transcription Side Note (if available) */}
                      {selectedLesson.transcription && selectedLesson.transcription.trim() && (
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
                                  {selectedLesson.transcription}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lesson Creation Modal */}
      <LessonCreationModal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setLessonModalMode(null);
        }}
        mode={lessonModalMode}
        onCreateLesson={handleCreateLesson}
      />
    </div>
  );
}