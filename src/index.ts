import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
}

export interface PresignedUrlOptions {
  fileName: string;
  contentType: string;
  folder?: string;
  expiresIn?: number;
  maxSize?: number;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export class S3UploadService {
  private client: S3Client;
  private bucket: string;
  private region: string;

  constructor(config: S3Config) {
    this.bucket = config.bucket;
    this.region = config.region;

    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint && { endpoint: config.endpoint }),
    });
  }

  /**
   * Generate presigned URL for direct upload
   */
  async getPresignedUploadUrl(options: PresignedUrlOptions): Promise<PresignedUrlResult> {
    const { fileName, contentType, folder = '', expiresIn = 3600 } = options;

    // Generate unique key
    const ext = fileName.split('.').pop();
    const key = folder ? `${folder}/${uuid()}.${ext}` : `${uuid()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });
    const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl, key };
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * Get public URL for a key
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

  /**
   * Check if a file exists and get its metadata
   */
  async getFileMetadata(key: string): Promise<{ contentType?: string; size?: number; lastModified?: Date } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      return {
        contentType: response.ContentType,
        size: response.ContentLength,
        lastModified: response.LastModified,
      };
    } catch {
      return null;
    }
  }

  /**
   * Validate file type against allowed types
   */
  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext ? allowedTypes.includes(ext) : false;
  }
}

export default S3UploadService;
