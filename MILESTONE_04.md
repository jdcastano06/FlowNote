# Milestone 04 - Final Project Documentation
===

NetID
---
jdc9881

Name
---
Juan Diego Castano

Repository Link
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06.git

URL for deployed site 
---
https://flow-note-omega.vercel.app

URL for form 1 (from previous milestone) 
---
https://flow-note-omega.vercel.app/dashboard

Special Instructions for Form 1
---
**Manual Note Creation Form** - Authentication required via Clerk. Click "Access Noteflow" on landing page or "Dashboard" in header. To create a note: 1) Click "New Note" in dashboard, 2) Fill in course name, select emoji icon, and lesson title, 3) Use rich text editor to write content with formatting options (bold, italic, lists, headings, links), 4) Click "Create Note" to save. The form validates required fields and supports rich text formatting.

URL for form 2 (for current milestone)
---
https://flow-note-omega.vercel.app/dashboard

Special Instructions for Form 2
---
**Audio Upload Form** - Authentication required. Navigate to dashboard and click "Upload Audio". Process: 1) Upload audio file (MP3, WAV, M4A - max 4.8MB), 2) System transcribes using Azure Speech-to-Text, 3) AI classifies and suggests course/lesson titles, 4) Edit suggestions in confirmation form, 5) Click "Confirm & Generate Notes" to create AI-powered summary. The form handles file validation, shows upload progress, and displays transcription preview before final submission.

URL for form 3 (from previous milestone) 
---
https://flow-note-omega.vercel.app/dashboard

Special Instructions for Form 3
---
**AJAX Image Upload Form** - Authentication required. Navigate to dashboard and create/edit a note. Process: 1) Click image icon (📷) in rich text editor toolbar, 2) Select image file (JPEG, PNG, GIF, WebP - max 10MB), 3) Image uploads via AJAX (fetch API with FormData) to Azure Blob Storage without page refresh, 4) Image appears inline in editor with secure SAS URL. The form uses asynchronous file upload, displays loading spinner during upload, and handles errors gracefully. Files are stored in private Azure Blob Storage container with time-limited SAS URLs for security.

First link to github line number(s) for constructor, HOF, etc.
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/blob/main/intellinote/lib/TranscriptionProcessor.ts#L7-L117

Second link to github line number(s) for constructor, HOF, etc.
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/blob/main/intellinote/lib/NoteFormatter.ts#L7-L120

Short description for links above
---
TranscriptionProcessor (line 7-117) is an ES6 class written with the class keyword that processes and formats transcriptions with methods for cleaning, chunking, extracting key terms, and formatting text. NoteFormatter (line 7-120) is an ES6 class that handles HTML generation and section organization for notes, including methods to format sections, escape HTML, and generate structured output.

Link to github line number(s) for schemas (db.js or models folder)
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/tree/main/intellinote/models

Note: The models folder includes an index.ts file for centralized model exports. This was necessary to resolve Mongoose schema registration issues in Vercel's serverless environment, ensuring models are loaded in the correct dependency order (Course before Lecture) when using .populate() references.

Description of research topics above with points
---
6 points - React Frontend + Next.js: Component-based UI architecture with server-side rendering, API routes, and optimized production builds. Used for the entire application frontend and backend API routes.

1 point - shadcn/ui: Accessible React components built on Radix UI primitives and styled with TailwindCSS. Used throughout the application for consistent, modern UI components.

2 points - Azure Speech-to-Text API: Cloud service for converting audio to text with batch transcription support. Used for transcribing uploaded lecture audio files and real-time browser-based recording.

1 point - DigitalOcean GPT-OSS-120B (via Inference API): Large language model for generating structured summaries, key points, and study materials from transcriptions. Used for AI-powered note generation and course/lesson classification.

Links to github line number(s) for research topics described above (one link per line)
---
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/blob/main/intellinote/app/dashboard/page.tsx#L1-L50
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/blob/main/intellinote/components/ui/button.tsx#L1-L56
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/blob/main/intellinote/app/api/transcribe/route.ts#L1-L154
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/blob/main/intellinote/components/audio/RealTimeRecording.tsx#L1-L100
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/blob/main/intellinote/app/api/generate-summary/route.ts#L1-L250
https://github.com/nyu-csci-ua-0467-001-002-fall-2025/final-project-jdcastano06/blob/main/intellinote/app/api/classify-course/route.ts#L1-L151

Optional project notes 
--- 
**IntelliNote** is an AI-powered lecture notetaking assistant designed to reduce cognitive load during lectures. Students can upload or record lecture audio, which is automatically transcribed using Azure Speech-to-Text and processed by GPT-OSS-120B to generate structured summaries, key points, and study materials.

**Key Features:**
- Audio file upload with automatic transcription (max 4.8MB due to Vercel Hobby plan limits)
- Real-time browser-based recording with live transcription
- AI-powered course and lesson title classification
- Automated summary generation with formatted notes
- Rich text editor with image upload to Azure Blob Storage
- Course organization with custom emoji icons
- MongoDB Atlas for data persistence
- Clerk authentication for secure access

**Technical Stack:**
- Frontend: React + Next.js 16 with TypeScript
- Backend: Next.js API routes (serverless)
- Database: MongoDB Atlas with Mongoose schemas
- Storage: Azure Blob Storage with SAS URLs
- AI Services: Azure Speech-to-Text + DigitalOcean Inference API (GPT-OSS-120B)
- Authentication: Clerk
- Deployment: Vercel

**Environment Variables Required:**
MONGODB_URI, CLERK keys, AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, AZURE_STORAGE_CONNECTION_STRING, LLM_API_KEY, LLM_ENDPOINT

Attributions
---
intellinote/lib/mongodb.ts - MongoDB connection pattern based on Next.js with-mongodb example - https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
intellinote/components/forms/RichTextEditor.tsx - Tiptap editor setup based on official documentation - https://tiptap.dev/docs/editor/get-started/react
intellinote/app/api/transcribe/route.ts - Azure Speech-to-Text Fast Transcription API implementation - https://learn.microsoft.com/azure/ai-services/speech-service/fast-transcription-create
intellinote/app/api/generate-summary/route.ts - DigitalOcean Inference API for LLM integration using GPT-OSS-120B - https://docs.digitalocean.com/products/functions/reference/runtimes/
intellinote/lib/azure.ts - Azure Blob Storage with SAS URLs - https://learn.microsoft.com/azure/storage/blobs/sas-service-create
intellinote/components/ui/* - shadcn/ui components - https://ui.shadcn.com
