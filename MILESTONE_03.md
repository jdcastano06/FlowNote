# Milestone 03

===

## Repository Link

---

https://github.com/jdcastano06/FlowNote

## URL for form 1 (from previous milestone)

---

[https://flow-note-omega.vercel.app/dashboard](https://flow-note-omega.vercel.app/dashboard)

## Special Instructions for Form 1

---

You can access the dashboard by clicking the "Access Noteflow" button on the landing page, or use the "Dashboard" link in the header. You will see a login/sign-up modal if not already authenticated.

### Features Available:
- **Create Courses**: Organize your notes by subject/course with custom emoji icons
- **Add Notes**: Write rich-formatted notes with a Google Docs-like editor
- **Upload Images**: Upload images directly into notes using AJAX (no page refresh)
- **Search**: Search through courses and notes
- **Delete**: Remove courses and notes as needed

## URL for form 2 (for current milestone)

---

**AJAX Image Upload Form**: [https://flow-note-omega.vercel.app/dashboard](https://flow-note-omega.vercel.app/dashboard)

To use the image upload feature:
1. Navigate to the dashboard and select a course
2. Click "New Note" to create a note
3. In the rich text editor toolbar, click the image icon (📷)
4. Select an image file (JPEG, PNG, GIF, WebP - max 10MB)
5. The image uploads via AJAX and appears inline in your note

**Note**: The image upload form uses AJAX (fetch API) to upload files to Azure Blob Storage without page refresh. Files are stored securely with SAS (Shared Access Signature) URLs.

## Special Instructions for Form 2

---

### AJAX Image Upload Form Usage:

1. **Authentication Required**: You must be logged in via Clerk authentication
2. **Course Selection**: Select or create a course first
3. **Create Note**: Click "New Note" button
4. **Upload Image**: 
   - Click the image icon (📷) in the rich text editor toolbar
   - Select an image file from your device
   - Wait for upload to complete (spinner shows progress)
   - Image appears inline in the editor automatically
5. **Supported Formats**: JPEG, PNG, GIF, WebP (max 10MB)
6. **Storage**: Images are stored in Azure Blob Storage with secure SAS URLs

### Technical Details:
- **AJAX Implementation**: Uses native `fetch()` API with FormData
- **No Page Refresh**: Upload happens asynchronously without reloading the page
- **Azure Blob Storage**: Files are uploaded to Azure Storage Account `noteflowapp`
- **SAS URLs**: Secure, time-limited URLs (1 year validity) for file access
- **Private Container**: Files are stored in a private container, accessed via signed URLs

## URL(s) to github repository with commits that show progress on research

---

### Research Topics Continued:

#### 1. **AJAX Form Implementation**
- [AJAX File Upload Handler](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/RichTextEditor.tsx#L101-L134) - Async file upload using fetch API with FormData
- [File Input Handler](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/RichTextEditor.tsx#L136-L149) - File selection and change event handling
- [Upload API Route](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/app/api/upload-file/route.ts#L1-L73) - Server-side API endpoint for handling AJAX uploads

#### 2. **Azure Blob Storage Integration**
- [Azure Storage Client Setup](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/lib/azure.ts#L1-L54) - Azure Blob Storage client initialization and container management
- [File Upload Function](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/lib/azure.ts#L53-L90) - Upload files to Azure Blob Storage with SAS URL generation
- [SAS URL Generation](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/lib/azure.ts#L73-L89) - Generate secure Shared Access Signature URLs for file access
- [Container Management](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/lib/azure.ts#L27-L54) - Private container creation and error handling

#### 3. **Rich Text Editor with Image Support**
- [Tiptap Image Extension](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/RichTextEditor.tsx#L55-L60) - Image extension configuration for inline images
- [Image Upload Button](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/RichTextEditor.tsx#L268-L282) - Toolbar button for triggering image uploads
- [Hidden File Input](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/RichTextEditor.tsx#L158-L164) - Hidden file input element for AJAX uploads

#### 4. **Azure Storage Account Configuration**
- [Connection String Parsing](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/lib/azure.ts#L6-L22) - Extract account name and key from connection string
- [SAS Credentials](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/lib/azure.ts#L74-L85) - Generate SAS URLs using StorageSharedKeyCredential

### Planned Work for Azure Speech-to-Text Integration:

The following Azure endpoints will be implemented for notetaking functionality:

1. **Azure Speech-to-Text API** - For transcribing lecture audio files
   - Batch transcription for long audio files
   - Real-time transcription support
   - Multiple language support
   - Speaker diarization

2. **Audio File Processing Pipeline**:
   - Upload audio files to Azure Blob Storage
   - Trigger Azure Speech-to-Text batch transcription
   - Store transcripts in MongoDB
   - Generate AI summaries using GPT-4o mini

3. **Integration Points**:
   - Connect existing note creation flow with audio upload
   - Store audio URLs in Note model
   - Link transcripts to notes
   - Generate study materials from transcripts

## References

---

### Tutorials and Resources Used:

1. **AJAX File Upload**
   - [MDN: Using Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) - Fetch API for AJAX requests
   - [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) - FormData for file uploads

2. **Azure Blob Storage**
   - [Azure Storage Blob SDK for JavaScript](https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/) - Official Azure SDK documentation
   - [Azure Blob Storage SAS URLs](https://learn.microsoft.com/en-us/azure/storage/blobs/sas-service-create) - Shared Access Signature implementation
   - [Azure Storage Connection Strings](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string) - Connection string format

3. **Tiptap Rich Text Editor**
   - [Tiptap Image Extension](https://tiptap.dev/api/nodes/image) - Image node implementation
   - [Tiptap React Integration](https://tiptap.dev/docs/editor/get-started/react) - React integration guide
   - [Tiptap SSR Configuration](https://tiptap.dev/docs/editor/get-started/install/react#ssr) - Server-side rendering configuration

4. **Azure Speech-to-Text (Planned)**
   - [Azure Speech Service Documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/) - Speech-to-Text API documentation
   - [Batch Transcription](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/batch-transcription) - Batch transcription for long audio files
   - [Speech SDK for JavaScript](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/quickstarts/setup-platform?pivots=programming-language-javascript) - JavaScript SDK setup

5. **Next.js API Routes**
   - [Next.js API Routes](https://nextjs.org/docs/app/api-reference/file-conventions/route) - API route implementation
   - [Next.js File Upload](https://nextjs.org/docs/app/api-reference/functions/next-request) - Handling file uploads in Next.js

---

**Current Status**: 
- ✅ AJAX image upload form implemented and working
- ✅ Azure Blob Storage integration complete with SAS URLs
- ✅ Rich text editor with image support
- 🔄 Azure Speech-to-Text integration planned for next phase
- 🔄 Audio file processing pipeline to be implemented

**Storage Account**: `noteflowapp` (Azure Blob Storage)
**Container**: `note-uploads` (private container with SAS URL access)

