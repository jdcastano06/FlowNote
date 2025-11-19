# Components Organization

This directory contains all React components organized by feature/domain for easier navigation and maintenance.

## Folder Structure

```
components/
├── layout/          # Shared layout components used across pages
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Breadcrumbs.tsx
│
├── dashboard/       # Dashboard-specific components
│   ├── DashboardContent.tsx    # Main dashboard container
│   ├── DashboardSidebar.tsx   # Sidebar navigation
│   ├── DashboardView.tsx      # Main dashboard view
│   ├── LessonDetailView.tsx    # Lesson detail page
│   ├── RecentLessons.tsx      # Recent lessons list
│   └── NewLessonDropdown.tsx  # New lesson creation dropdown
│
├── audio/           # Audio recording and transcription features
│   ├── AudioTranscriptionUpload.tsx  # Upload audio file for transcription
│   ├── AudioUpload.tsx               # Simple audio file upload
│   └── RealTimeRecording.tsx         # Real-time microphone recording
│
├── forms/           # Form components and modals
│   ├── ConfirmationCard.tsx      # Confirmation dialog for lessons
│   ├── LessonCreationModal.tsx   # Modal for creating lessons
│   ├── EmojiPicker.tsx           # Emoji picker component
│   └── RichTextEditor.tsx        # Rich text editor component
│
├── landing/         # Landing page/marketing components
│   ├── Hero.tsx         # Hero section
│   ├── Features.tsx     # Features showcase
│   ├── CTA.tsx          # Call-to-action section
│   └── AppPreview.tsx   # App preview/mockup
│
└── ui/              # Reusable UI primitives (shadcn/ui components)
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── ... (other UI components)
```

## Import Examples

### From app pages:
```typescript
// Landing page
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";

// Dashboard page
import { DashboardContent } from "@/components/dashboard/DashboardContent";
```

### From other components:
```typescript
// Within dashboard folder
import { DashboardSidebar } from "./DashboardSidebar";

// From different folder
import { AudioTranscriptionUpload } from "../audio/AudioTranscriptionUpload";
import { Breadcrumbs } from "../layout/Breadcrumbs";
```

## Component Categories

### Layout Components (`layout/`)
Shared components that appear on multiple pages:
- **Header**: Top navigation bar
- **Footer**: Site footer
- **Breadcrumbs**: Navigation breadcrumbs

### Dashboard Components (`dashboard/`)
Components specific to the dashboard/lessons area:
- **DashboardContent**: Main container managing dashboard state
- **DashboardSidebar**: Left sidebar with courses and navigation
- **DashboardView**: Main dashboard view with action cards
- **LessonDetailView**: Individual lesson detail page
- **RecentLessons**: List of recent lessons
- **NewLessonDropdown**: Dropdown for creating new lessons

### Audio Components (`audio/`)
Components related to audio recording and transcription:
- **AudioTranscriptionUpload**: Upload audio file and get transcription
- **AudioUpload**: Simple audio file upload component
- **RealTimeRecording**: Real-time microphone recording with live transcription

### Form Components (`forms/`)
Form-related components and modals:
- **ConfirmationCard**: Confirmation dialog for lesson creation
- **LessonCreationModal**: Modal for creating new lessons
- **EmojiPicker**: Emoji selection component
- **RichTextEditor**: Rich text editing component

### Landing Components (`landing/`)
Marketing/landing page components:
- **Hero**: Hero section with main CTA
- **Features**: Features showcase section
- **CTA**: Call-to-action section
- **AppPreview**: App preview/mockup section

### UI Components (`ui/`)
Reusable UI primitives from shadcn/ui:
- All base UI components (buttons, cards, inputs, etc.)
- These are low-level, reusable components

## Benefits of This Organization

1. **Easy Navigation**: Components are grouped by feature, making it easy to find what you need
2. **Clear Separation**: Each folder has a clear purpose and responsibility
3. **Scalability**: Easy to add new components to the appropriate folder
4. **Maintainability**: Related components are grouped together
5. **Onboarding**: New developers can quickly understand the codebase structure

