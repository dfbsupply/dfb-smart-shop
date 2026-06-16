// ----------------------------------------------------------------------
// Image helpers for visual search — turn a File or a live <video> frame into
// a downscaled JPEG data URL that's small enough to carry through the order
// flow and store offline (until Firebase Storage is wired).
// ----------------------------------------------------------------------

const MAX_DIM = 720;
const QUALITY = 0.72;

function drawToDataUrl(source: CanvasImageSource, w: number, h: number): string {
  const scale = Math.min(1, MAX_DIM / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', QUALITY);
}

/** Load a File into an HTMLImageElement. */
export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Downscaled data URL from a loaded image element. */
export function imageToDataUrl(img: HTMLImageElement): string {
  return drawToDataUrl(img, img.naturalWidth, img.naturalHeight);
}

/** Capture the current frame of a playing <video> as a data URL + image. */
export async function captureVideoFrame(
  video: HTMLVideoElement
): Promise<{ dataUrl: string; image: HTMLImageElement }> {
  const dataUrl = drawToDataUrl(video, video.videoWidth, video.videoHeight);
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return { dataUrl, image };
}
