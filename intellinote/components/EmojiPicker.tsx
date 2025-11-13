"use client";

import { useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface EmojiPickerComponentProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPickerComponent({
  value,
  onChange,
}: EmojiPickerComponentProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-16 w-16 text-4xl p-0 hover:scale-110 transition-transform"
          type="button"
        >
          {value || "📚"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          width={350}
          height={400}
          searchPlaceHolder="Search emoji..."
          previewConfig={{ showPreview: false }}
        />
      </PopoverContent>
    </Popover>
  );
}

