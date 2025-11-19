"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { 
  Upload, 
  Loader2, 
  CheckCircle, 
  FileAudio,
  X,
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { ConfirmationCard } from "../forms/ConfirmationCard";

interface TranscriptionResult {
  transcription: string;
  duration: number;
  locale: string;
  phrases?: any[];
}

interface ClassificationResult {
  suggestedCourse: string;
  suggestedLessonTitle: string;
  isNewCourse: boolean;
  courseId?: string;
}

interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

interface AudioTranscriptionUploadProps {
  onNotesGenerated?: () => void;
}

export function AudioTranscriptionUpload({ onNotesGenerated }: AudioTranscriptionUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("audio/")) {
      setFile(droppedFile);
      setError(null);
      setTranscriptionResult(null);
      setClassificationResult(null);
      setSummaryResult(null);
      await handleAutoTranscribe(droppedFile);
    } else {
      setError("Please drop an audio file");
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File is too large. Maximum size is 500MB.");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setTranscriptionResult(null);
    setClassificationResult(null);
    setSummaryResult(null);

    // Auto-transcribe
    await handleAutoTranscribe(selectedFile);
  };

  const handleAutoTranscribe = async (audioFile: File) => {
    setTranscribing(true);
    setError(null);

    try {
      // Step 1: Transcribe
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("locale", "en-US");

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error("Transcription failed");
      }

      const transcription = await transcribeResponse.json();
      setTranscriptionResult(transcription);

      // Step 2: Classify
      const classifyResponse = await fetch("/api/classify-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: transcription.transcription,
        }),
      });

      if (classifyResponse.ok) {
        const classification = await classifyResponse.json();
        setClassificationResult(classification);
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Failed to process audio");
    } finally {
      setTranscribing(false);
    }
  };

  const handleCopyTranscription = () => {
    if (transcriptionResult?.transcription) {
      navigator.clipboard.writeText(transcriptionResult.transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTranscriptionResult(null);
    setClassificationResult(null);
    setSummaryResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmAndGenerate = async (
    courseTitle: string,
    lessonTitle: string,
    courseId?: string,
    originalCourseTitle?: string
  ) => {
    if (!transcriptionResult) return;

    setGeneratingNotes(true);
    setError(null);

    try {
      // Determine which course to use
      // If user changed the course name, we need to find or create the new course
      let finalCourseId = courseId;
      const courseTitleTrimmed = courseTitle.trim();
      const originalCourseTitleTrimmed = originalCourseTitle?.trim() || "";
      
      // Check if course name was changed from the original
      const courseNameChanged = courseId && 
        originalCourseTitleTrimmed && 
        courseTitleTrimmed.toLowerCase() !== originalCourseTitleTrimmed.toLowerCase();

      if (courseNameChanged || !finalCourseId) {
        // Fetch all courses to check if the new course name already exists
        const coursesResponse = await fetch("/api/courses");
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          const existingCourse = coursesData.courses?.find((c: any) => 
            c.title.toLowerCase().trim() === courseTitleTrimmed.toLowerCase()
          );

          if (existingCourse) {
            // Use existing course with the new name
            finalCourseId = existingCourse._id;
            console.log("Found existing course with edited name:", existingCourse.title);
          } else {
            // Create new course with the edited name
            console.log("Creating new course with edited name:", courseTitleTrimmed);
            const courseResponse = await fetch("/api/courses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: courseTitleTrimmed,
                description: "",
              }),
            });

            if (courseResponse.ok) {
              const courseData = await courseResponse.json();
              finalCourseId = courseData.course._id;
              console.log("Created new course:", courseData.course.title);
            } else {
              throw new Error("Failed to create course");
            }
          }
        }
      }

      // Create lecture
      const lectureResponse = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: finalCourseId,
          title: lessonTitle,
          audioUrl: "",
          transcription: transcriptionResult.transcription,
          content: "", // Will be filled with AI summary
        }),
      });

      if (!lectureResponse.ok) {
        throw new Error("Failed to create lecture");
      }

      const lectureData = await lectureResponse.json();

      // Generate summary with course/lesson context (using edited values from confirmation modal)
      const summaryResponse = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: transcriptionResult.transcription,
          courseTitle: courseTitle, // Use edited course title from confirmation modal
          lessonTitle: lessonTitle, // Use edited lesson title from confirmation modal
        }),
      });

      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        
        // Update the lecture with AI-generated summary in the content field
        const lectureId = lectureData.lecture?._id;
        if (lectureId) {
          await fetch(`/api/lectures/${lectureId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: summary.summary, // Save summary to content field
            }),
          });
        }

        setSummaryResult(summary);
        setClassificationResult(null);

        if (onNotesGenerated) {
          onNotesGenerated();
        }
      }
    } catch (err: any) {
      console.error("Error generating notes:", err);
      setError(err.message || "Failed to generate notes");
    } finally {
      setGeneratingNotes(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card
              className={`border border-border/50 transition-all duration-150 bg-card/50 ${
                dragActive
                  ? "border-foreground/30 bg-accent/30"
                  : "hover:border-foreground/20"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="p-20">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-foreground/50" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-medium tracking-tight text-foreground/90">
                      Upload Audio
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Drop an audio file here or click to browse
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="audio-upload-input"
                  />

                  <Button
                    size="default"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 h-10 font-normal"
                  >
                    Upload Class
                  </Button>

                  <p className="text-xs text-muted-foreground pt-3">
                    MP3, WAV, M4A · Max 500MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : transcribing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="border border-border/50 bg-card/50">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* File Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                        <FileAudio className="w-5 h-5 text-foreground/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground/90 truncate">{file.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="border-border/50" />

                  {/* Loading State */}
                  {transcribing && (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 text-foreground animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">Transcribing...</p>
                      </div>
                      
                      {/* Skeleton Loading */}
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : classificationResult && !summaryResult ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ConfirmationCard
              suggestedCourse={classificationResult.suggestedCourse}
              suggestedLessonTitle={classificationResult.suggestedLessonTitle}
              isNewCourse={classificationResult.isNewCourse}
              courseId={classificationResult.courseId}
              transcription={transcriptionResult?.transcription}
              onConfirm={handleConfirmAndGenerate}
              onCancel={handleReset}
            />
          </motion.div>
        ) : summaryResult ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="border border-border/50 bg-card/50">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Success Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-foreground/60" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-0.5 text-foreground/90">Notes Generated</h3>
                        <p className="text-sm text-muted-foreground">{file.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleReset}
                      className="-mt-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <Separator className="border-border/50" />

                  {/* Summary Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground/80 mb-2">Summary</h4>
                      <div className="border border-border/50 rounded-lg p-4 bg-muted/30">
                        <p className="text-sm leading-relaxed text-foreground/90">
                          {summaryResult.summary}
                        </p>
                      </div>
                    </div>
                    
                    {summaryResult.keyPoints && summaryResult.keyPoints.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground/80">Key Points</h4>
                        <ul className="space-y-2">
                          {summaryResult.keyPoints.map((point, index) => (
                            <li key={index} className="text-sm text-foreground/90 flex gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      onClick={handleReset}
                      className="w-full font-normal"
                      variant="outline"
                    >
                      Upload Another
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

