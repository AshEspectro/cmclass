const MIN_COMPRESSION_BYTES = 1024 * 1024; // 1MB
const TARGET_BYTES = 1600 * 1024; // ~1.6MB
const MAX_DIMENSION = 1920;
const MIN_QUALITY = 0.6;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to read image'));
    };
    img.src = objectUrl;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });

const replaceExtension = (filename: string, ext: string) => {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0) return `${filename}.${ext}`;
  return `${filename.slice(0, dot)}.${ext}`;
};

export const optimizeImageForUpload = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  if (file.size < MIN_COMPRESSION_BYTES) return file;

  try {
    const image = await loadImage(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const outputType = 'image/webp';
    let quality = 0.86;
    let bestBlob = await canvasToBlob(canvas, outputType, quality);
    if (!bestBlob) return file;

    while (bestBlob.size > TARGET_BYTES && quality > MIN_QUALITY) {
      quality -= 0.08;
      const nextBlob = await canvasToBlob(canvas, outputType, quality);
      if (!nextBlob) break;
      bestBlob = nextBlob;
    }

    if (bestBlob.size >= file.size * 0.97) return file;

    return new File([bestBlob], replaceExtension(file.name, 'webp'), {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
};

