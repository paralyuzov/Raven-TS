export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface CompressionResult {
  base64: string;
  originalSize: number;
  compressedSize: number;
  originalDimensions: { width: number; height: number };
  newDimensions: { width: number; height: number };
  compressionRatio: number;
}

export const compressImage = (
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const {
    maxWidth = 300,
    maxHeight = 300,
    quality = 0.7,
    outputFormat = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        let { width, height } = calculateNewDimensions(
          originalWidth, 
          originalHeight, 
          maxWidth, 
          maxHeight
        );
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.clearRect(0, 0, width, height);
        ctx?.drawImage(img, 0, 0, width, height);
        
        let compressedBase64 = canvas.toDataURL(outputFormat, quality);
        
        const originalSize = file.size;
        const compressedSize = Math.round(compressedBase64.length * 0.75);
        
        if (compressedSize > 1024 * 1024 && quality > 0.3) {
          compressedBase64 = canvas.toDataURL(outputFormat, 0.3);
        }
        
        const finalCompressedSize = Math.round(compressedBase64.length * 0.75);
        const compressionRatio = ((originalSize - finalCompressedSize) / originalSize) * 100;
        
        resolve({
          base64: compressedBase64,
          originalSize,
          compressedSize: finalCompressedSize,
          originalDimensions: { width: originalWidth, height: originalHeight },
          newDimensions: { width, height },
          compressionRatio: Math.round(compressionRatio * 100) / 100
        });
        
        URL.revokeObjectURL(img.src);
        
      } catch (error) {
        reject(new Error('Failed to compress image: ' + (error as Error).message));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;
  
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const scalingFactor = Math.min(widthRatio, heightRatio);
  
  if (scalingFactor < 1) {
    width = Math.round(originalWidth * scalingFactor);
    height = Math.round(originalHeight * scalingFactor);
  }
  
  return { width, height };
}

export const validateCompressedSize = (
  base64: string, 
  maxSizeInMB: number = 5
): boolean => {
  const sizeInBytes = Math.round(base64.length * 0.75);
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return sizeInMB <= maxSizeInMB;
};

export const getBase64Size = (base64: string): {
  bytes: number;
  kb: number;
  mb: number;
} => {
  const bytes = Math.round(base64.length * 0.75);
  return {
    bytes,
    kb: Math.round(bytes / 1024 * 100) / 100,
    mb: Math.round(bytes / (1024 * 1024) * 100) / 100
  };
};

export const CompressionPresets = {
  avatar: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.8,
    outputFormat: 'image/jpeg' as const
  },
  
  thumbnail: {
    maxWidth: 150,
    maxHeight: 150,
    quality: 0.7,
    outputFormat: 'image/jpeg' as const
  },
  
  standard: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
    outputFormat: 'image/jpeg' as const
  },
  
  aggressive: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.5,
    outputFormat: 'image/jpeg' as const
  }
} as const;
