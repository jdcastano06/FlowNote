"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";

interface AudioUploadProps {
  courseId: string;
  onUploadComplete: (audioUrl: string, fileName: string) => void;
}

export function AudioUpload({ courseId, onUploadComplete }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 500MB.");
      return;
    }

    setFileName(file.name);
    setUploadStatus("uploading");
    setUploading(true);

    try {
      // Step 1: Get presigned URL from our API
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, key } = await response.json();

      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Step 3: Get the public URL for the uploaded file
      const audioUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;

      setUploadStatus("success");
      setUploadProgress(100);
      
      // Notify parent component
      onUploadComplete(audioUrl, file.name);

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadProgress(0);
        setFileName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Lecture Audio</CardTitle>
        <CardDescription>
          Upload an audio recording of your lecture (MP3, M4A, WAV)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="audio-upload"
          />
          
          <label htmlFor="audio-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              asChild
            >
              <div className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? "Uploading..." : "Select Audio File"}
              </div>
            </Button>
          </label>

          {fileName && (
            <div className="text-sm text-muted-foreground">
              Selected: {fileName}
            </div>
          )}

          {uploadStatus === "uploading" && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Upload successful!</span>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span className="text-sm">Upload failed. Please try again.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

