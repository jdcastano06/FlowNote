"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Plus, Mic, Upload, Edit3 } from "lucide-react";

interface NewLessonDropdownProps {
  onRecordAudio: () => void;
  onUploadFile: () => void;
  onManualNote: () => void;
  collapsed?: boolean;
}

export function NewLessonDropdown({ onRecordAudio, onUploadFile, onManualNote, collapsed = false }: NewLessonDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className={`bg-foreground text-background hover:bg-foreground/90 ${collapsed ? 'w-10 p-0' : 'w-full'}`} 
          size={collapsed ? "icon" : "sm"}
          title={collapsed ? "New Lesson" : undefined}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span className="ml-2">New Lesson</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={onRecordAudio} className="cursor-pointer">
          <Mic className="w-4 h-4 mr-2" />
          Record Audio
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUploadFile} className="cursor-pointer">
          <Upload className="w-4 h-4 mr-2" />
          Upload Audio
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onManualNote} className="cursor-pointer">
          <Edit3 className="w-4 h-4 mr-2" />
          Manual Note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
