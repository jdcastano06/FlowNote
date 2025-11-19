"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { AudioTranscriptionUpload } from "../audio/AudioTranscriptionUpload";
import { RealTimeRecording } from "../audio/RealTimeRecording";
import { LessonCreationModal } from "../forms/LessonCreationModal";
import { Breadcrumbs } from "../layout/Breadcrumbs";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardView } from "./DashboardView";
import { LessonDetailView } from "./LessonDetailView";
import { 
  FileText,
  Menu,
  PanelLeftOpen
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet";

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

type ViewState = "dashboard" | "lesson-detail" | "upload-audio" | "record-audio";

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
    setMobileMenuOpen(false);
  };

  const handleNewLessonActionWithClose = (action: "record" | "upload" | "manual") => {
    handleNewLessonAction(action);
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    setCurrentView("dashboard");
    setMobileMenuOpen(false);
  };


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
      setCurrentView("record-audio");
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

  const getBreadcrumbs = (): Array<{ label: string; onClick?: () => void }> => {
    const breadcrumbs: Array<{ label: string; onClick?: () => void }> = [];
    
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
    } else if (currentView === "record-audio") {
      breadcrumbs.push(
        { label: "Dashboard", onClick: () => setCurrentView("dashboard") },
        { label: "Record Audio" }
      );
    }
    
    return breadcrumbs;
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
            <DashboardSidebar
              collapsed={true}
              courses={courses}
              lessons={lessons}
              expandedCourses={expandedCourses}
              currentView={currentView}
              onToggleCollapse={() => setSidebarCollapsed(false)}
              onExpandCourse={(courseId) => {
                setSidebarCollapsed(false);
                toggleCourseExpansion(courseId);
              }}
              onLessonClick={handleLessonClick}
              onDashboardClick={handleDashboardClick}
              onRecordAudio={() => handleNewLessonActionWithClose("record")}
              onUploadFile={() => handleNewLessonActionWithClose("upload")}
              onManualNote={() => handleNewLessonActionWithClose("manual")}
            />
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
          <DashboardSidebar
            collapsed={false}
            courses={courses}
            lessons={lessons}
            expandedCourses={expandedCourses}
            currentView={currentView}
            onToggleCollapse={() => setSidebarCollapsed(true)}
            onExpandCourse={toggleCourseExpansion}
            onLessonClick={handleLessonClick}
            onDashboardClick={handleDashboardClick}
            onRecordAudio={() => handleNewLessonActionWithClose("record")}
            onUploadFile={() => handleNewLessonActionWithClose("upload")}
            onManualNote={() => handleNewLessonActionWithClose("manual")}
          />
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
                      <DashboardSidebar
                        collapsed={false}
                        courses={courses}
                        lessons={lessons}
                        expandedCourses={expandedCourses}
                        currentView={currentView}
                        onToggleCollapse={() => {}}
                        onExpandCourse={toggleCourseExpansion}
                        onLessonClick={handleLessonClick}
                        onDashboardClick={handleDashboardClick}
                        onRecordAudio={() => handleNewLessonActionWithClose("record")}
                        onUploadFile={() => handleNewLessonActionWithClose("upload")}
                        onManualNote={() => handleNewLessonActionWithClose("manual")}
                      />
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
            <div className={`flex-1 overflow-y-auto ${currentView === "record-audio" ? "overflow-hidden" : ""}`}>
              {currentView === "dashboard" && (
                <DashboardView
                  lessons={lessons}
                  onRecordClick={() => handleNewLessonAction("record")}
                  onUploadClick={() => handleNewLessonAction("upload")}
                  onManualClick={() => handleNewLessonAction("manual")}
                  onLessonClick={handleLessonClick}
                />
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

              {currentView === "record-audio" && (
                <div className="p-4 md:p-8 pt-2 md:pt-4 flex-1 flex flex-col min-h-0">
                  <RealTimeRecording 
                    onClose={() => setCurrentView("dashboard")}
                  />
                </div>
              )}

              {currentView === "lesson-detail" && selectedLesson && (
                <LessonDetailView lesson={selectedLesson} />
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