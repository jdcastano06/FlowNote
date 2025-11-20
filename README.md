# Noteflow: AI-Powered Lecture Notetaking Assistant

## Overview

Noteflow is a web application designed to assist students in **reducing cognitive load** during lectures and studying. Many students struggle to take detailed notes while simultaneously trying to understand explanations, examples, and context. Listening, processing, and writing at the same time often leads to incomplete notes and gaps in understanding.

This application allows students to **upload or record lecture audio**, which is automatically transcribed using Azure Speech-to-Text. The transcript is then processed by **DigitalOcean GPT-OSS-120B** (via Inference API) to generate clean, structured summaries, key points, and study materials. Students can organize their notes into different courses with custom emoji icons and revisit summaries to reinforce memory retention.

The goal is to improve **comprehension, study efficiency, and retention**—not just generate raw transcripts, but **meaningful, usable notes**.

---

## Data Model

The system stores **Users**, **Courses**, and **Lectures** (which include transcripts and summaries).

- A **User** may have multiple **Courses**
- Each **Course** may have multiple **Lectures**
- Each **Lecture** contains:
  - Raw transcription text
  - AI-generated summary/content (HTML formatted)
  - Audio URL (if uploaded)
  - Status (uploaded, transcribed, processed)

### Sample Documents

#### User
```ts
{
  clerkUserId: string; // Clerk authentication ID
  email: string;
  firstName?: string;
  lastName?: string;
  courses: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Course

```ts
{
  userId: string; // Clerk user ID
  title: string;
  description?: string;
  icon?: string; // Emoji icon
  createdAt: Date;
  updatedAt: Date;
}
```

#### Lecture

```ts
{
  userId: string; // Clerk user ID
  courseId: ObjectId; // Reference to Course
  title: string;
  audioUrl: string; // Azure Blob Storage URL or empty for manual notes
  status: "uploaded" | "transcribed" | "processed";
  content: string; // AI-generated summary (HTML formatted) or manual content
  transcription?: string; // Raw transcription text from audio
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Schema Implementation

Schemas are implemented using Mongoose and TypeScript, located in:
**`intellinote/models/`** (Note: The codebase folder is still named `intellinote` for historical reasons, but the application is branded as Noteflow)

- `Course.ts` - Course schema with user reference and emoji icons
- `Lecture.ts` - Lecture schema with course reference, transcription, and AI-generated content
- `User.ts` - User schema with Clerk authentication integration
- `index.ts` - Centralized model exports for serverless compatibility

The models use Mongoose schemas with TypeScript interfaces for type safety. The `index.ts` file ensures proper model registration order in Vercel's serverless environment.

---

## Wireframes

Planned Screens:

| Page                       | Description                     |
| -------------------------- | ------------------------------- |
| `/courses`                 | List of all courses             |
| `/courses/create`          | Form to add a new course        |
| `/lectures/upload`         | Upload audio + assign to course |
| `/lectures/:id`            | View transcript + study pack    |
| `/lectures/:id/study-pack` | Generate AI summary button      |

### Wireframe Images

![Courses List](documentation/1.png)

![Create Course](documentation/2.png)

![Upload Lecture](documentation/3.png)

![Lecture Detail](documentation/4.png)

![Study Pack](documentation/5.png)


---

## Site Map

![Site Map](documentation/sitemap.png)

```
Home
 └── Courses
      ├── Create Course
      └── Course Detail
           └── Lectures
                ├── Upload Lecture
                └── Lecture Detail (Transcript + Summary)
```

---

## User Stories

1. As a **student**, I want to **upload lecture audio** so that I don’t have to write notes in real time.
2. As a **student**, I want to **see a clean summary and bullet notes** so that I can study efficiently.
3. As a **student**, I want to **generate flashcards and quick quiz questions** to reinforce my understanding.
4. As a **student**, I want to **organize lectures by course** to keep my materials structured.
5. As a **student**, I want to **revisit past summaries** when preparing for exams.

---

## Research Topics (planned total: 10 points)

### React Frontend + Next.js (6 points)

**What is it?**  
React is a JavaScript library for building user interfaces with component-based architecture. Next.js is a React framework that provides server-side rendering, API routes, file-based routing, and optimized production builds.

**Why use it?**  
React enables reusable components and efficient state management, reducing code duplication and improving maintainability. Next.js adds powerful features like automatic code splitting, image optimization, and built-in API routes, which eliminates the need for a separate backend framework. The combination provides a fast, modern development experience and better performance through client-side navigation and server-side rendering.

**Candidate modules/solutions considered:**
- React + Vite (simpler setup, but missing SSR and routing features)
- Vue.js (alternative framework, but less ecosystem for Next.js features)
- Plain server-side rendering (worse UX, slower page transitions)

---

### shadcn/ui (1 point)

**What is it?**  
shadcn/ui is a collection of accessible, customizable React components built on Radix UI primitives and styled with TailwindCSS. Unlike traditional component libraries, you copy components into your project rather than installing them as dependencies.

**Why use it?**  
It provides professionally designed, accessible components out of the box while allowing full customization since the code lives in your project. This approach gives the benefits of a component library (consistency, accessibility) with the flexibility of custom code. The TailwindCSS styling ensures modern, responsive designs with minimal CSS.

**Candidate modules/solutions considered:**
- Material-UI / MUI (more opinionated, heavier bundle size)
- Chakra UI (good alternative, but less customizable)
- Custom components (more time-consuming, inconsistent design)

---

### Azure Speech-to-Text API (2 points)

**What is it?**  
Azure Speech-to-Text is a cloud service from Microsoft that converts spoken audio into written text. It supports real-time and batch transcription, multiple languages, and can handle long-form audio files.

**Why use it?**  
This API provides accurate transcription of lecture recordings without requiring local processing power or training custom models. It handles various audio formats, background noise, and speaker recognition. The batch transcription feature is ideal for processing longer lecture recordings that students upload.

**Candidate modules/solutions considered:**
- Google Cloud Speech-to-Text (similar features, but Azure was chosen for consistency)
- OpenAI Whisper API (good accuracy, but more expensive for long files)
- Local transcription libraries (less accurate, requires significant processing power)

---

### DigitalOcean GPT-OSS-120B (via Inference API) (1 point)

**What is it?**  
GPT-OSS-120B is a large open-source language model accessible through DigitalOcean's Inference API. It provides powerful text generation capabilities for creating structured summaries, key points, and study materials from transcriptions.

**Why use it?**  
This model offers excellent performance for generating comprehensive study materials from lecture transcriptions. The DigitalOcean Inference API provides a cost-effective way to access large language models without managing infrastructure. It generates well-structured HTML-formatted notes, extracts key points, and classifies course/lesson content effectively.

**Candidate modules/solutions considered:**
- OpenAI GPT-4o mini (good but more expensive for high-volume usage)
- Azure OpenAI (similar features, but DigitalOcean was more cost-effective)
- Local LLMs (requires significant infrastructure, less reliable)

---

**Total:** 10 points

---

## Features

### ✅ Implemented Features

- **Audio Upload & Transcription**: Upload audio files (MP3, WAV, M4A) up to 4.8MB for automatic transcription
- **Real-time Recording**: Browser-based recording with live transcription using Azure Speech SDK
- **AI-Powered Summaries**: Automatic generation of structured, HTML-formatted notes with key points
- **Course Classification**: AI suggests course and lesson titles from transcription content
- **Rich Text Editor**: Tiptap-based editor with formatting, links, and inline image uploads
- **Image Upload**: AJAX image uploads to Azure Blob Storage with secure SAS URLs
- **Course Organization**: Create courses with custom emoji icons and organize lectures
- **Manual Notes**: Create notes manually with rich text formatting
- **Authentication**: Secure user authentication via Clerk
- **Responsive Design**: Modern, mobile-friendly UI with shadcn/ui components

### 🚀 Deployment

**Live Application**: [https://flow-note-omega.vercel.app](https://flow-note-omega.vercel.app)

The application is deployed on Vercel with serverless functions. All environment variables are configured in Vercel project settings.

---

## Tech Stack

- **Frontend**: React 18 + Next.js 16 (App Router) with TypeScript
- **Backend**: Next.js API Routes (serverless)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Storage**: Azure Blob Storage with SAS URLs
- **AI Services**: 
  - Azure Speech-to-Text API (transcription)
  - DigitalOcean Inference API (GPT-OSS-120B for summaries)
- **Authentication**: Clerk
- **UI Components**: shadcn/ui + TailwindCSS
- **Deployment**: Vercel

---

## Setup & Installation

### Prerequisites

- Node.js 18+ and pnpm (or npm)
- MongoDB Atlas account
- Azure Speech Services account
- DigitalOcean account (for Inference API)
- Clerk account (for authentication)
- Azure Storage Account (for file uploads)

### Environment Variables

Create a `.env.local` file in the `intellinote` directory (the codebase folder name):

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Azure Speech Services
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus
AZURE_SPEECH_ENDPOINT=https://...

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...

# LLM API (DigitalOcean Inference)
LLM_API_KEY=...
LLM_ENDPOINT=https://...
```

### Installation

```bash
cd intellinote
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to see the application.

---

## Project Structure

```
intellinote/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── audio/             # Audio upload/recording
│   ├── dashboard/         # Dashboard components
│   ├── forms/             # Form components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── azure.ts           # Azure Blob Storage
│   ├── mongodb.ts         # MongoDB connection
│   ├── TranscriptionProcessor.ts  # ES6 class for text processing
│   └── NoteFormatter.ts   # ES6 class for note formatting
└── models/                # Mongoose schemas
    ├── Course.ts
    ├── Lecture.ts
    ├── User.ts
    └── index.ts           # Centralized exports
```

---

## References Used

- Azure Speech SDK Docs: [https://learn.microsoft.com/azure/cognitive-services/speech-service/](https://learn.microsoft.com/azure/cognitive-services/speech-service/)
- React Docs: [https://react.dev](https://react.dev)
- Next.js Docs: [https://nextjs.org/docs](https://nextjs.org/docs)
- shadcn/ui Documentation: [https://ui.shadcn.com](https://ui.shadcn.com)
- DigitalOcean Inference API: [https://docs.digitalocean.com/products/functions/reference/runtimes/](https://docs.digitalocean.com/products/functions/reference/runtimes/)
- Tiptap Editor: [https://tiptap.dev](https://tiptap.dev)
- Clerk Authentication: [https://clerk.com/docs](https://clerk.com/docs)

---
