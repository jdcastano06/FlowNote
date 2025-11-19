"use client";

import { Button } from "../ui/button";
import { NewLessonDropdown } from "./NewLessonDropdown";
import {
  FileText,
  ChevronRight,
  ChevronDown,
  Settings,
  Home,
  PanelLeftClose,
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  icon?: string;
}

interface Lesson {
  _id: string;
  title: string;
  courseId: {
    _id: string;
    title: string;
  } | string;
  createdAt: string;
}

interface DashboardSidebarProps {
  collapsed: boolean;
  courses: Course[];
  lessons: Lesson[];
  expandedCourses: Set<string>;
  currentView: string;
  onToggleCollapse: () => void;
  onExpandCourse: (courseId: string) => void;
  onLessonClick: (lesson: Lesson) => void;
  onDashboardClick: () => void;
  onRecordAudio: () => void;
  onUploadFile: () => void;
  onManualNote: () => void;
}

export function DashboardSidebar({
  collapsed,
  courses,
  lessons,
  expandedCourses,
  currentView,
  onToggleCollapse,
  onExpandCourse,
  onLessonClick,
  onDashboardClick,
  onRecordAudio,
  onUploadFile,
  onManualNote,
}: DashboardSidebarProps) {
  return (
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
          onRecordAudio={onRecordAudio}
          onUploadFile={onUploadFile}
          onManualNote={onManualNote}
          collapsed={collapsed}
        />
      </div>

      {/* All Lessons Button */}
      <div className={`px-4 md:px-6 pb-4 md:pb-6 ${collapsed ? 'flex justify-center' : ''}`}>
        <Button 
          variant={currentView === "dashboard" ? "default" : "ghost"}
          className={`w-full ${collapsed ? 'w-10 p-0 justify-center' : 'justify-start'}`}
          onClick={onDashboardClick}
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
                    onToggleCollapse();
                    onExpandCourse(course._id);
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
                  onClick={() => onExpandCourse(course._id)}
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
                          onClick={() => onLessonClick(lesson)}
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
            onClick={onToggleCollapse}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );
}

