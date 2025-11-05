# Milestone 02

===

## Repository Link

---

https://github.com/jdcastano06/FlowNote

## Special Instructions for Using Form (or Login details if auth is part of your project)

---

You can simply click the "Access Noteflow" button on the landing page, or use the "Dashboard" link in the header. Either option will take you to the dashboard, where you will see a login/sign-up modal if not already authenticated.

### Features Available:
- **Create Courses**: Organize your notes by subject/course
- **Add Notes**: Write and manage notes within each course
- **Search**: Search through courses and notes
- **Delete**: Remove courses and notes as needed

## URL for form

---

[https://flow-note-omega.vercel.app/dashboard](https://flow-note-omega.vercel.app/dashboard)

## URL for form result

[https://flow-note-omega.vercel.app/dashboard](https://flow-note-omega.vercel.app/dashboard)


---

**Dashboard URL**: `/dashboard` (after authentication)

This shows the main application interface where users can:
- View their courses in a sidebar
- Create new courses
- Add notes to selected courses
- Search through content

## URL to github that shows line of code where research topic(s) are used / implemented

---

### Research Topics Implemented:

#### 1. **React Frontend + Next.js**
- [React Hooks & State Management](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/DashboardContent.tsx#L32-L44) - useState, useEffect hooks for component state
- [API Routes with TypeScript](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/app/api/courses/route.ts#L1-L25) - Server-side API routes using Next.js App Router
- [Client-Side Data Fetching](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/DashboardContent.tsx#L62-L75) - async/await with fetch API

#### 2. **shadcn/ui Component Library**
- [Component Imports & Usage](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/DashboardContent.tsx#L1-L12) - Importing and using shadcn/ui components
- [Responsive Layout](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/DashboardContent.tsx#L244-L250) - Flexbox layout using shadcn/ui Card and responsive design
- [Form Components](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/DashboardContent.tsx#L332-L336) - Input and Button components in forms

#### 3. **MongoDB + Mongoose** (Database Integration)
- [Database Connection Setup](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/lib/mongodb.ts#L1-L25) - MongoDB connection with connection pooling
- [Mongoose Schema Definition](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/models/Course.ts#L10-L25) - Schema definition with TypeScript interfaces
- [CRUD Operations](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/app/api/courses/route.ts#L26-L45) - Create, Read operations with Mongoose

#### 4. **AWS S3** (File Upload Infrastructure - Partially Implemented)
- [Presigned URL Generation](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/lib/s3.ts#L8-L25) - AWS SDK S3 presigned URL creation
- [Secure Upload API](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/app/api/upload/route.ts#L8-L35) - Server-side upload URL generation with validation
- [Client Upload Component](https://github.com/jdcastano06/FlowNote/blob/main/intellinote/components/AudioUpload.tsx#L60-L85) - Direct-to-S3 file upload with progress

## References

---

### Tutorials and Resources Used:

1. **Next.js Documentation**
   - [App Router](https://nextjs.org/docs/app) - Used for routing and API routes
   - [API Routes](https://nextjs.org/docs/app/api-reference/file-conventions/route) - Server-side API implementation

2. **shadcn/ui Documentation**
   - [Installation](https://ui.shadcn.com/docs) - UI component library setup
   - [Components](https://ui.shadcn.com/docs/components) - Individual component implementations

3. **MongoDB + Mongoose**
   - [Mongoose Documentation](https://mongoosejs.com/docs/) - Database modeling and operations
   - [Next.js with MongoDB](https://www.mongodb.com/developer/languages/javascript/nextjs-with-mongodb/) - Integration guide

4. **Clerk Authentication**
   - [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs) - Authentication setup
   - [Middleware](https://clerk.com/docs/references/nextjs/clerk-middleware) - Route protection

5. **AWS S3 File Upload**
   - [AWS SDK S3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-creating-buckets.html) - S3 integration
   - [Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) - Secure upload implementation

---

**Note**: Azure Speech-to-Text API and GPT-4o mini integration are planned for future milestones but not yet implemented in this codebase.