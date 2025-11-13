"use client";

import { motion } from "framer-motion";
import { Trash2, Filter, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CourseHeaderProps {
  course: {
    _id: string;
    title: string;
    description?: string;
    icon?: string;
  };
  notesCount: number;
  onDelete: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
}

export function CourseHeader({
  course,
  notesCount,
  onDelete,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
}: CourseHeaderProps) {
  return (
    <div className="space-y-8">
      {/* Course Title Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-4 pt-8"
      >
        {/* Course Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border/50 mb-2">
          <span className="text-4xl">{course.icon || "📚"}</span>
        </div>

        {/* Course Title - Apple-like Typography */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {/* Note count */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{notesCount}</span>
          <span>{notesCount === 1 ? "note" : "notes"}</span>
        </div>
      </motion.div>

      <Separator className="bg-border/50" />

      {/* Filters & Search Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-muted/50 border-border/50 rounded-xl focus:bg-background transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[130px] rounded-xl bg-muted/50 border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="w-[140px] rounded-xl bg-muted/50 border-border/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Lecture">Lecture</SelectItem>
              <SelectItem value="Reading">Reading</SelectItem>
              <SelectItem value="Assignment">Assignment</SelectItem>
              <SelectItem value="Lab">Lab</SelectItem>
              <SelectItem value="Exam">Exam</SelectItem>
              <SelectItem value="Note">Note</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-8 w-px bg-border/50" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

