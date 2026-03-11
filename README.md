# S3 Upload Service

![AWS](https://img.shields.io/badge/AWS-S3-FF9900?style=flat-square&logo=amazon-aws)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

Simple S3 file upload service with presigned URLs, image optimization, and TypeScript support.

## Features

- **Presigned URLs** - Secure direct uploads to S3
- **Image Optimization** - Automatic resizing and compression
- **Multiple Formats** - Support for images, documents, videos
- **Validation** - File type and size validation
- **TypeScript** - Full type safety

## Installation

```bash
npm install @marwantech/s3-upload-service
```

## Quick Start

```typescript
import { S3UploadService } from '@marwantech/s3-upload-service';

const uploadService = new S3UploadService({
  bucket: process.env.S3_BUCKET!,
  region: process.env.AWS_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});

// Generate presigned URL for upload
const { uploadUrl, fileUrl, key } = await uploadService.getPresignedUploadUrl({
  fileName: 'photo.jpg',
  contentType: 'image/jpeg',
  folder: 'avatars',
});

// Client uploads directly to S3 using uploadUrl
```

## API

### Get Presigned Upload URL

```typescript
const result = await uploadService.getPresignedUploadUrl({
  fileName: 'document.pdf',
  contentType: 'application/pdf',
  folder: 'documents',        // Optional subfolder
  expiresIn: 3600,            // URL expiry in seconds (default: 3600)
  maxSize: 10 * 1024 * 1024,  // Max file size in bytes
});

// Returns:
// {
//   uploadUrl: 'https://...',  // PUT this URL with file
//   fileUrl: 'https://...',    // Final public URL
//   key: 'documents/abc123.pdf'
// }
```

### Upload with Image Optimization

```typescript
const result = await uploadService.uploadImage(buffer, {
  fileName: 'photo.jpg',
  folder: 'avatars',
  resize: { width: 200, height: 200 },
  quality: 80,
  format: 'webp',
});
```

### Delete File

```typescript
await uploadService.deleteFile('avatars/abc123.jpg');
```

## Express Integration

```typescript
import { createUploadMiddleware } from '@marwantech/s3-upload-service';

const upload = createUploadMiddleware(uploadService, {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ url: req.file.location });
});
```

## License

MIT
