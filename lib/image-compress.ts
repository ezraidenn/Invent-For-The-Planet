/**
 * Client-side image capture & compression utility.
 * Reads a File (from <input type="file" capture>), draws it onto a
 * hidden canvas at a capped resolution, and re-exports as a compressed
 * JPEG data-URL.  The result is small enough to store directly in the
 * database (typically 30-80 KB for 800px-wide photos at quality 0.6).
 */

const MAX_DIMENSION = 800;   // px — longest side
const JPEG_QUALITY = 0.55;   // 0-1, lower = smaller

export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        // Calculate scaled dimensions keeping aspect ratio
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round(height * (MAX_DIMENSION / width));
            width = MAX_DIMENSION;
          } else {
            width = Math.round(width * (MAX_DIMENSION / height));
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        // Cleanup
        canvas.width = 0;
        canvas.height = 0;

        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Returns estimated KB of a data-URL string */
export function dataUrlSizeKB(dataUrl: string): number {
  // data:image/jpeg;base64, ... → remove header, measure base64 payload
  const base64 = dataUrl.split(",")[1] || "";
  return Math.round((base64.length * 3) / 4 / 1024);
}
