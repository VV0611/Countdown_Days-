import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const CROP_ASPECT_RATIO = 16 / 9;
export const CROP_OUTPUT_WIDTH = 800;

interface CoverFit {
  // Size (in frame-space pixels) the image is drawn at when scaled to cover the frame.
  drawWidth: number;
  drawHeight: number;
  // Scale factor from original image pixels to frame-space pixels.
  scale: number;
}

// How big the image must be drawn (preserving aspect ratio) to fully cover a
// frameWidth x frameHeight viewport — the same math as CSS `object-fit: cover`.
export function coverFit(imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number): CoverFit {
  const scale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
  return { drawWidth: imageWidth * scale, drawHeight: imageHeight * scale, scale };
}

// Clamp a pan offset (top-left of the drawn image, in frame-space pixels)
// so the frame is always fully covered by the image.
export function clampPan(offsetX: number, offsetY: number, drawWidth: number, drawHeight: number, frameWidth: number, frameHeight: number) {
  const minX = frameWidth - drawWidth; // <= 0
  const minY = frameHeight - drawHeight;
  return {
    x: Math.min(0, Math.max(minX, offsetX)),
    y: Math.min(0, Math.max(minY, offsetY)),
  };
}

// Given the pan offset (frame-space, top-left of the drawn image) and the
// cover scale, compute the crop rect in the ORIGINAL image's pixel space.
export function frameToSourceCrop(
  offsetX: number,
  offsetY: number,
  scale: number,
  frameWidth: number,
  frameHeight: number
) {
  return {
    originX: -offsetX / scale,
    originY: -offsetY / scale,
    width: frameWidth / scale,
    height: frameHeight / scale,
  };
}

export async function cropImage(uri: string, region: { originX: number; originY: number; width: number; height: number }): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [
      {
        crop: {
          originX: Math.round(region.originX),
          originY: Math.round(region.originY),
          width: Math.round(region.width),
          height: Math.round(region.height),
        },
      },
      { resize: { width: CROP_OUTPUT_WIDTH } },
    ],
    { compress: 0.8, format: SaveFormat.JPEG }
  );
  return result.uri;
}
