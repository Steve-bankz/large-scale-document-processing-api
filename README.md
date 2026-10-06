# Large-Scale Document Processing API

A backend API for authenticated document uploads, project-based organization, file validation, and stream-based processing.

The project is designed around backend engineering concepts that become important when handling large files and concurrent uploads, including Node.js streams, backpressure, multipart form-data processing, asynchronous workflows, and file/database consistency.

## Features

- User authentication with JWT
- Project creation and ownership
- Project-based document uploads
- Multipart file handling with Busboy
- Stream-based file processing
- PDF validation
- Upload size limiting
- Backpressure-aware streaming
- Unique file naming using UUIDs
- Document ownership through `userId`
- Upload status tracking
- Protection against multiple files in a single upload request
- Client-disconnect and aborted-upload handling
- Cleanup of partially written files when uploads fail
- MongoDB persistence using Mongoose

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Busboy
- JavaScript
- JWT
- UUID
- bcrypt

## Architecture

The API is organized into separate layers for routing, controllers, services, storage, streams, validation, middleware, and database models.

```text
src/
├── config/
├── controller/
├── middleware/
├── models/
├── routes/
├── services/
├── storage/
├── streams/
└── validators/
```

The upload flow currently follows this general path:

```text
Client
   │
   ▼
Express Route
   │
   ▼
Authentication
   │
   ▼
Upload Controller
   │
   ▼
Busboy
   │
   ▼
Readable File Stream
   │
   ▼
PDF Validator
   │
   ▼
Size Limiter
   │
   ▼
File Storage
   │
   ▼
MongoDB Document Record
```

## Upload Processing

The upload system is designed to avoid loading entire files into memory.

Files are processed through Node.js streams and written incrementally to disk. This allows the API to handle large files while taking advantage of stream backpressure rather than buffering the complete file in memory.

The upload pipeline also handles failure scenarios such as:

- Invalid file types
- Files exceeding the configured size limit
- Multiple files in one request
- Client disconnection
- Stream failures
- Partially written files
- Database failures after successful file storage

## Current Storage

For the current development implementation, uploaded files are stored on the local filesystem.

Local filesystem storage is intentional at this stage so the upload lifecycle and stream-processing architecture can be developed and tested independently.

For a production deployment, persistent object storage will be introduced so uploaded documents are not dependent on the API server's local filesystem.

## Running Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd large-scale-document-processing-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_secret
```

Do not commit your `.env` file.

### 4. Start the server

```bash
node server.js
```

The API will run on the configured port.

## API Structure

The API is versioned under:

```text
/api/v1
```

Main resource groups include:

```text
/api/v1/auth
/api/v1/projects
/api/v1/documents
```

## Engineering Focus

This project is being developed as a backend engineering portfolio project with particular attention to:

- Streaming architecture
- Backpressure
- Resource management
- Failure handling
- Race conditions
- File/database consistency
- Authentication and authorization
- Ownership boundaries
- Cleanup and recovery
- Scalable processing architecture

## Future Improvements

Planned improvements include:

- Persistent cloud object storage
- Background document processing
- Upload lifecycle reconciliation
- Orphan-file detection and cleanup
- Job queues and workers
- Document processing status management
- Improved observability and logging
- Production deployment
- Automated testing
- Horizontal scaling considerations

## Project Status

**In active development.**

The current implementation focuses on building and validating the upload pipeline and its failure-handling behavior before introducing production infrastructure such as object storage, background workers, and deployment.