/**
 * Avatar upload utility functions
 * Handles validation, compression, and preparation of avatar images
 */

import { CompressionPresets, compressImage, getBase64Size, validateCompressedSize } from './imageCompression';

interface AvatarProcessingResult {
  base64: string;
  compressionRatio: number;
  sizeMB: number;
}

/**
 * Processes an avatar image file by validating and compressing it
 * @param file - The image file to process
 * @returns Promise<AvatarProcessingResult> - The processed avatar data
 * @throws Error if validation fails or compression fails
 */
export const processAvatarImage = async (file: File): Promise<AvatarProcessingResult> => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }

  // Validate file size (max 10MB original file)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size must be less than 10MB');
  }

  // Compress the image using the avatar preset
  const compressionResult = await compressImage(file, CompressionPresets.avatar);
  
  // Log compression results
  console.log('Compression completed:', {
    originalSize: compressionResult.originalSize,
    compressedSize: compressionResult.compressedSize,
    compressionRatio: compressionResult.compressionRatio,
    dimensions: `${compressionResult.originalDimensions.width}x${compressionResult.originalDimensions.height} → ${compressionResult.newDimensions.width}x${compressionResult.newDimensions.height}`
  });
  
  // Validate compressed size (4MB limit to be safe)
  if (!validateCompressedSize(compressionResult.base64, 4)) {
    const size = getBase64Size(compressionResult.base64);
    throw new Error(`Image is still too large (${size.mb}MB) even after compression. Please use a smaller image.`);
  }

  return {
    base64: compressionResult.base64,
    compressionRatio: compressionResult.compressionRatio,
    sizeMB: getBase64Size(compressionResult.base64).mb
  };
};

/**
 * Extracts user-friendly error message from error object
 * @param error - The error that occurred during avatar processing
 * @returns string - User-friendly error message
 */
export const getAvatarUploadErrorMessage = (error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  if (errorMessage.includes('too large') || errorMessage.includes('entity too large')) {
    return 'Image file is too large for upload. Please choose a smaller image.';
  } else if (errorMessage.includes('compress')) {
    return 'Failed to process image. Please try a different image format.';
  } else {
    return `Failed to upload avatar: ${errorMessage}`;
  }
};
