import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type HeadObjectCommandOutput,
  type ListObjectsV2CommandOutput,
  type PutObjectCommandOutput,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

import ImageProcessor, {
  type ImageProcessorOptions,
  type ProcessedImage,
} from "./image.processor";

import { AppError } from "../errors/AppError";
import logger from "../utils/logger";

export type UploadVisibility = "public" | "private";

export interface UploadedFile {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype?: string;
  size?: number;
  buffer: Buffer;
}

/**
 * Arvan Object Storage / Any S3 Compatible Storage
 */
export interface S3StorageConfig {
  accessKey: string;
  secretKey: string;
  bucketName: string;
  endpoint: string;
  publicUrl: string;

  region?: string;
}

export interface StorageLogger {
  error?: (message: string, meta?: unknown) => void;
  warn?: (message: string, meta?: unknown) => void;
  info?: (message: string, meta?: unknown) => void;
  debug?: (message: string, meta?: unknown) => void;
}

export interface S3StorageDependencies {
  logger?: StorageLogger;
  errorFactory?: (
    message: string,
    statusCode?: number,
    cause?: unknown,
  ) => Error;
  defaultSignedUrlExpiresInSeconds?: number;
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  visibility?: UploadVisibility;
  cacheControl?: string;
  metadata?: Record<string, string>;
  signedUrlExpiresInSeconds?: number;
  processor?: ImageProcessorOptions;
}

export interface UploadResult {
  key: string;
  bucket: string;
  visibility: UploadVisibility;
  url: string;
  publicUrl: string;
  signedUrl?: string;
  etag?: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  originalFormat?: string;
}

export interface FileItem {
  key: string;
  lastModified?: Date;
  size?: number;
  etag?: string;
  storageClass?: string;
  url: string;
}

export interface ListFilesOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface ListFilesResult {
  items: FileItem[];
  nextContinuationToken?: string;
  isTruncated: boolean;
}

export interface CopyFileOptions {
  metadata?: Record<string, string>;
  cacheControl?: string;
  visibility?: UploadVisibility;
}

const DEFAULT_PUBLIC_CACHE_CONTROL = "public, max-age=31536000, immutable";
const DEFAULT_PRIVATE_CACHE_CONTROL =
  "private, max-age=0, no-cache, no-store, must-revalidate";
const DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS = 300;

const sanitizeSegment = (value: string): string =>
  value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .trim()
        .replace(/[^\w.-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^\.+/, "")
        .replace(/\.+$/, ""),
    )
    .filter(Boolean)
    .join("/");

const sanitizeBaseName = (value: string): string => {
  const withoutExtension = value.replace(/\.[^/.]+$/, "");

  const sanitized = withoutExtension
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .replace(/\.+$/, "");

  return sanitized || "file";
};

const normalizeEndpoint = (value: string): string => value.replace(/\/+$/, "");

const joinKey = (
  folder: string | undefined,
  fileName: string,
  extension: string,
): string => {
  const safeFolder = folder ? sanitizeSegment(folder) : "";
  const safeFileName = sanitizeBaseName(fileName);
  const unique = uuidv4().replace(/-/g, "");
  const key = `${safeFileName}-${unique}.${extension}`;

  return safeFolder ? `${safeFolder}/${key}` : key;
};

const metadataToLowerCase = (
  metadata?: Record<string, string>,
): Record<string, string> | undefined => {
  if (!metadata) return undefined;

  const entries = Object.entries(metadata)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [key.toLowerCase(), String(value)] as const);

  return entries.length ? Object.fromEntries(entries) : undefined;
};

const isNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  const e = error as {
    name?: string;
    code?: string;
    Code?: string;
    $metadata?: {
      httpStatusCode?: number;
    };
  };

  return (
    e.name === "NotFound" ||
    e.name === "NoSuchKey" ||
    e.code === "NotFound" ||
    e.code === "NoSuchKey" ||
    e.Code === "NotFound" ||
    e.Code === "NoSuchKey" ||
    e.$metadata?.httpStatusCode === 404
  );
};

const encodeCopySource = (bucketName: string, key: string): string => {
  const bucket = encodeURIComponent(bucketName);
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${bucket}/${encodedKey}`;
};

export class S3StorageService {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly publicUrlBase: string;
  private readonly logger: StorageLogger;
  private readonly errorFactory: (
    message: string,
    statusCode?: number,
    cause?: unknown,
  ) => Error;
  private readonly defaultSignedUrlExpiresInSeconds: number;

  constructor(
    config: S3StorageConfig,
    dependencies: S3StorageDependencies = {},
  ) {
    if (!config.accessKey) {
      throw new Error("S3 accessKey is required.");
    }

    if (!config.secretKey) {
      throw new Error("S3 secretKey is required.");
    }

    if (!config.bucketName) {
      throw new Error("S3 bucketName is required.");
    }

    if (!config.endpoint) {
      throw new Error("S3 endpoint is required.");
    }

    if (!config.publicUrl) {
      throw new Error("S3 publicUrl is required.");
    }

    this.bucketName = config.bucketName;
    this.endpoint = normalizeEndpoint(config.endpoint);
    this.publicUrlBase = normalizeEndpoint(config.publicUrl);
    this.logger = dependencies.logger ?? {};

    this.errorFactory =
      dependencies.errorFactory ??
      ((message, statusCode = 500, cause) =>
        new AppError(message, statusCode, cause));

    this.defaultSignedUrlExpiresInSeconds =
      dependencies.defaultSignedUrlExpiresInSeconds ??
      DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS;

    this.client = new S3Client({
      region: config.region ?? "default",
      endpoint: this.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
  }

  private fail(message: string, statusCode = 500, cause?: unknown): never {
    throw this.errorFactory(message, statusCode, cause);
  }

  private logError(
    message: string,
    error: unknown,
    meta?: Record<string, unknown>,
  ) {
    this.logger.error?.(message, {
      ...meta,
      error,
    });
  }

  private rethrowIfAppError(error: unknown): void {
    if (error instanceof AppError) {
      throw error;
    }
  }

  private getPublicUrl(key: string): string {
    return `${this.publicUrlBase}/${key.replace(/^\/+/, "")}`;
  }

  private resolveCacheControl(
    visibility: UploadVisibility,
    cacheControl?: string,
  ): string {
    if (cacheControl && cacheControl.trim()) {
      return cacheControl.trim();
    }

    return visibility === "public"
      ? DEFAULT_PUBLIC_CACHE_CONTROL
      : DEFAULT_PRIVATE_CACHE_CONTROL;
  }

  private buildUploadResult(
    key: string,
    visibility: UploadVisibility,
    processed: ProcessedImage,
    result: PutObjectCommandOutput,
    signedUrl?: string,
  ): UploadResult {
    const publicUrl = this.getPublicUrl(key);

    return {
      key,
      bucket: this.bucketName,
      visibility,
      url: visibility === "public" ? publicUrl : (signedUrl ?? publicUrl),
      publicUrl,
      signedUrl,
      etag: result.ETag,
      mimeType: processed.mimeType,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      originalFormat: processed.originalFormat,
    };
  }

  async upload(
    file: UploadedFile | Buffer,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const visibility = options.visibility ?? "public";

    const originalName = Buffer.isBuffer(file)
      ? (options.fileName ?? "image")
      : file.originalname;

    const buffer = Buffer.isBuffer(file) ? file : file.buffer;

    if (!buffer || buffer.length === 0) {
      this.fail("File buffer is empty.", 400);
    }

    try {
      const processed = await ImageProcessor.process(buffer, options.processor);

      const key = joinKey(options.folder, originalName, processed.extension);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: processed.buffer,
        ContentType: processed.mimeType,
        CacheControl: this.resolveCacheControl(
          visibility,
          options.cacheControl,
        ),
        ...(visibility === "public" && {
          ACL: "public-read",
        }),
        Metadata: metadataToLowerCase({
          ...options.metadata,
          originalname: originalName,
          visibility,
          originalformat: processed.originalFormat ?? "unknown",
          width: String(processed.width ?? ""),
          height: String(processed.height ?? ""),
        }),
      });

      const uploadResult = await this.client.send(command);

      let signedUrl: string | undefined;

      if (visibility === "private") {
        signedUrl = await this.generateSignedUrl(
          key,
          options.signedUrlExpiresInSeconds ??
            this.defaultSignedUrlExpiresInSeconds,
        );
      }

      return this.buildUploadResult(
        key,
        visibility,
        processed,
        uploadResult,
        signedUrl,
      );
    } catch (error) {
      this.rethrowIfAppError(error);

      this.logError("S3 upload failed", error, {
        folder: options.folder,
        visibility: options.visibility ?? "public",
      });

      this.fail("File upload failed.", 500, error);
    }
  }

  async uploadMany(
    files: Array<UploadedFile | Buffer>,
    options: UploadOptions = {},
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    try {
      for (const file of files) {
        results.push(await this.upload(file, options));
      }

      return results;
    } catch (err) {
      if (results.length > 0) {
        const keysToDelete = results.map((res) => res.key);

        this.deleteManyFiles(keysToDelete).catch((deleteErr) => {
          logger.error(
            "Critical: Failed to clean up partially uploaded files in uploadMany",
            deleteErr,
          );
        });
      }
      throw err;
    }
  }

  async generateSignedUrl(
    key: string,
    expiresInSeconds = this.defaultSignedUrlExpiresInSeconds,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      this.rethrowIfAppError(error);

      this.logError("S3 signed url generation failed", error, { key });
      this.fail("Could not generate signed URL.", 500, error);
    }
  }

  async generateUploadUrl(
    key: string,
    expiresInSeconds = this.defaultSignedUrlExpiresInSeconds,
    contentType = "image/webp",
    cacheControl = DEFAULT_PUBLIC_CACHE_CONTROL,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        CacheControl: cacheControl,
      });

      return await getSignedUrl(this.client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      this.rethrowIfAppError(error);

      this.logError("S3 presigned upload url generation failed", error, {
        key,
      });
      this.fail("Could not generate upload URL.", 500, error);
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      return true;
    } catch (error) {
      this.rethrowIfAppError(error);

      this.logError("S3 delete failed", error, { key });
      this.fail("File deletion failed.", 500, error);
    }
  }

  async deleteManyFiles(keys: string[]): Promise<boolean> {
    if (keys.length === 0) {
      return true;
    }

    try {
      const result = await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: {
            Objects: keys.map((key) => ({ Key: key })),
            Quiet: true,
          },
        }),
      );

      if (result.Errors?.length) {
        this.logError("S3 bulk delete partial failure", result.Errors, {
          keys,
        });
        this.fail("Bulk file deletion failed.", 500, result.Errors);
      }

      return true;
    } catch (error) {
      this.rethrowIfAppError(error);

      this.logError("S3 bulk delete failed", error, { keys });
      this.fail("Bulk file deletion failed.", 500, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );

      return true;
    } catch (error) {
      if (isNotFoundError(error)) {
        return false;
      }

      this.rethrowIfAppError(error);

      this.logError("S3 exists check failed", error, { key });
      this.fail("Could not check file existence.", 500, error);
    }
  }

  async getMetadata(key: string): Promise<HeadObjectCommandOutput> {
    try {
      return await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      this.rethrowIfAppError(error);

      this.logError("S3 metadata fetch failed", error, { key });
      this.fail("Could not fetch metadata.", 500, error);
    }
  }

  async listFiles(options: ListFilesOptions = {}): Promise<ListFilesResult> {
    try {
      const result: ListObjectsV2CommandOutput = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: options.prefix,
          MaxKeys: options.maxKeys,
          ContinuationToken: options.continuationToken,
        }),
      );

      return {
        items:
          result.Contents?.map((item) => ({
            key: item.Key ?? "",
            lastModified: item.LastModified,
            size: item.Size,
            etag: item.ETag,
            storageClass: item.StorageClass,
            url: item.Key ? this.getPublicUrl(item.Key) : "",
          })).filter((item) => item.key !== "") ?? [],
        nextContinuationToken: result.NextContinuationToken,
        isTruncated: Boolean(result.IsTruncated),
      };
    } catch (error) {
      this.rethrowIfAppError(error);

      this.logError("S3 list files failed", error, {
        prefix: options.prefix,
      });
      this.fail("Could not list files.", 500, error);
    }
  }

  async copyFile(
    sourceKey: string,
    destinationKey: string,
    options: CopyFileOptions = {},
  ): Promise<boolean> {
    try {
      const metadata = metadataToLowerCase({
        ...options.metadata,
        ...(options.visibility && {
          visibility: options.visibility,
        }),
      });

      const visibility = options.visibility;

      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucketName,
          Key: destinationKey,
          CopySource: encodeCopySource(this.bucketName, sourceKey),
          CacheControl: options.cacheControl,
          MetadataDirective: metadata ? "REPLACE" : "COPY",
          Metadata: metadata,
          ...(visibility === "public" && {
            ACL: "public-read",
          }),
          ...(visibility === "private" && {
            ACL: "private",
          }),
        }),
      );

      return true;
    } catch (error) {
      this.rethrowIfAppError(error);

      this.logError("S3 copy failed", error, {
        sourceKey,
        destinationKey,
      });
      this.fail("File copy failed.", 500, error);
    }
  }

  async moveFile(
    sourceKey: string,
    destinationKey: string,
    options: CopyFileOptions = {},
  ): Promise<boolean> {
    const copied = await this.copyFile(sourceKey, destinationKey, options);

    if (!copied) {
      return false;
    }

    return this.deleteFile(sourceKey);
  }

  async renameFile(
    sourceKey: string,
    destinationKey: string,
    options: CopyFileOptions = {},
  ): Promise<boolean> {
    return this.moveFile(sourceKey, destinationKey, options);
  }

  async getPublicUrlForKey(key: string): Promise<string> {
    return this.getPublicUrl(key);
  }

  async getSignedUrlForKey(
    key: string,
    expiresInSeconds = this.defaultSignedUrlExpiresInSeconds,
  ): Promise<string> {
    return this.generateSignedUrl(key, expiresInSeconds);
  }
}

export default S3StorageService;
