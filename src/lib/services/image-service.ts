import { cloudinary } from '@/lib/cloudinary';

const FOLDER = 'keydir';

export interface UploadResult {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface OptimizedUrlOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  crop?: 'fill' | 'fit' | 'limit' | 'pad' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed'));
          return;
        }
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      },
    );

    uploadStream.end(buffer);
  });

  return result;
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export async function replaceImage(
  oldPublicId: string,
  file: File,
): Promise<UploadResult> {
  if (oldPublicId) {
    await deleteImage(oldPublicId);
  }
  return uploadImage(file);
}

export function generateOptimizedUrl(
  publicId: string,
  options: OptimizedUrlOptions = {},
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    gravity = 'auto',
  } = options;

  const transformations: string[] = [];

  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  if (crop) transformations.push(`c_${crop}`);
  if (gravity && crop !== 'scale') transformations.push(`g_${gravity}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  return cloudinary.url(publicId, {
    type: 'upload',
    transformation: transformations.join(','),
    secure: true,
  });
}
