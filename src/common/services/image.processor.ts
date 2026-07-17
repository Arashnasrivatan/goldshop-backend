import sharp, { Metadata } from "sharp";

export type ProcessedImageFormat = "webp";

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: "image/webp";
  extension: "webp";
  format: ProcessedImageFormat;
  size: number;
  width: number | null;
  height: number | null;
  originalFormat?: Metadata["format"];
}

export interface ImageProcessorOptions {
  quality?: number;
  effort?: number;
}

const DEFAULT_QUALITY = 80;
const DEFAULT_EFFORT = 4;
const MAX_INPUT_PIXELS = 268402689; // sharp default safety limit

const SUPPORTED_INPUT_MIME_TYPES = new Set<string>([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "image/tiff",
  "image/heif",
  "image/heic",
]);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export class ImageProcessor {
  static isSupportedImageMimeType(mimeType: string): boolean {
    return SUPPORTED_INPUT_MIME_TYPES.has(mimeType.toLowerCase());
  }

  static async process(
    input: Buffer,
    options: ImageProcessorOptions = {},
  ): Promise<ProcessedImage> {
    if (!Buffer.isBuffer(input) || input.length === 0) {
      throw new Error("Invalid image buffer.");
    }

    const quality = clamp(options.quality ?? DEFAULT_QUALITY, 1, 100);
    const effort = clamp(options.effort ?? DEFAULT_EFFORT, 0, 6);

    const image = sharp(input, {
      failOn: "warning",
      limitInputPixels: MAX_INPUT_PIXELS,
    }).rotate();

    const metadata = await image.metadata();

    const outputBuffer = await image
      .webp({
        quality,
        alphaQuality: quality,
        smartSubsample: true,
        smartDeblock: true,
        effort,
      })
      .toBuffer();

    return {
      buffer: outputBuffer,
      mimeType: "image/webp",
      extension: "webp",
      format: "webp",
      size: outputBuffer.length,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      originalFormat: metadata.format,
    };
  }
}

export default ImageProcessor;