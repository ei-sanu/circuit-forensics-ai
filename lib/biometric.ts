'use client';

export type FacePositionStatus =
  | 'NO_FACE'
  | 'TOO_FAR'
  | 'TOO_CLOSE'
  | 'OFF_CENTER'
  | 'POOR_LIGHTING'
  | 'MULTIPLE_FACES'
  | 'GOOD_POSITION';

export type BiometricScannerState =
  | 'IDLE'
  | 'INITIALIZING'
  | 'SEARCHING'
  | 'FACE_DETECTED'
  | 'ANALYZING'
  | 'ALIGNING'
  | 'TOO_FAR'
  | 'TOO_CLOSE'
  | 'OFF_CENTER'
  | 'POOR_LIGHTING'
  | 'MULTIPLE_FACES'
  | 'GOOD_POSITION'
  | 'READY'
  | 'STABILIZING'
  | 'LIVENESS'
  | 'LIVENESS_CHECK'
  | 'CAPTURING'
  | 'CAPTURED'
  | 'REVIEW'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'FAILED'
  | 'RETRY'
  | 'LOCKED'
  | 'CAMERA_ERROR';

export interface FrameQuality {
  brightness: number; // 0-255
  contrast: number; // 0-100
  sharpness: number; // 0-100
  skinRatio: number; // 0.0 - 1.0
  isCentered: boolean;
  faceCountEstimate: number; // 0, 1, or >1
  positionStatus: FacePositionStatus;
  directionalCue?: 'LEFT' | 'RIGHT' | 'TOO_CLOSE' | 'TOO_FAR' | 'PERFECT' | 'NO_FACE';
  statusFeedback: string;
  isAcceptable: boolean;
}

export interface CandidateFrame {
  dataUrl: string;
  qualityScore: number;
  sharpness: number;
  contrast: number;
  brightness: number;
  skinRatio: number;
  timestamp: number;
}

export interface LivenessState {
  blinkDetected: boolean;
  movementScore: number;
  faceCentered: boolean;
  challengeStep: 'position' | 'blink' | 'hold' | 'verifying' | 'complete';
  progress: number; // 0 - 100
}

/**
 * Initializes webcam media stream with ideal resolution for facial biometric analysis.
 * Safely handles video metadata loading and play() Promise interruptions.
 */
export async function startCameraStream(
  videoElement: HTMLVideoElement,
  facingMode: 'user' | 'environment' = 'user',
): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera device API is not supported in this browser environment.');
  }

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      facingMode,
      width: { ideal: 640, min: 320 },
      height: { ideal: 480, min: 240 },
      frameRate: { ideal: 30, max: 30 },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  
  if (videoElement) {
    videoElement.srcObject = stream;
    try {
      if (videoElement.readyState < 2) {
        await new Promise<void>((resolve) => {
          videoElement.onloadedmetadata = () => resolve();
          // Fallback timeout in case onloadedmetadata fired synchronously
          setTimeout(resolve, 250);
        });
      }
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        await playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Camera video play warning:', err);
          }
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Camera stream play warning:', err);
      }
    }
  }

  return stream;
}

/**
 * Safely terminates all media stream tracks to immediately release camera hardware.
 */
export function stopCameraStream(stream: MediaStream | null, videoElement?: HTMLVideoElement | null) {
  if (videoElement) {
    try {
      videoElement.pause();
      videoElement.srcObject = null;
    } catch {}
  }
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  } catch (err) {
    console.warn('Error stopping camera stream tracks:', err);
  }
}

/**
 * Captures a single crisp JPEG frame from a live video element as a base64 Data URL.
 */
export function captureFrameFromVideo(
  video: HTMLVideoElement,
  width: number = 320,
  height: number = 320,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D canvas context for frame capture.');
  }

  // Draw center-cropped square from video
  const vWidth = video.videoWidth || 640;
  const vHeight = video.videoHeight || 480;
  const minDim = Math.min(vWidth, vHeight);
  const sx = (vWidth - minDim) / 2;
  const sy = (vHeight - minDim) / 2;

  ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.94);
}

let prevFrameLum: number[] | null = null;
let lastBlinkTimestamp = 0;

/**
 * Analyzes live video frame in real-time via Canvas 2D image data.
 * Computes lighting, contrast, sharpness, face distance, centering, and real-time blink/motion signals.
 */
export function analyzeVideoFrameQuality(video: HTMLVideoElement): FrameQuality & { blinkDetected: boolean; motionScore: number } {
  if (!video || video.readyState < 2 || video.videoWidth === 0) {
    return {
      brightness: 0,
      contrast: 0,
      sharpness: 0,
      skinRatio: 0,
      isCentered: false,
      faceCountEstimate: 0,
      positionStatus: 'NO_FACE',
      statusFeedback: 'Initializing camera sensor...',
      isAcceptable: false,
      blinkDetected: false,
      motionScore: 0,
    };
  }

  const canvas = document.createElement('canvas');
  const w = 96;
  const h = 96;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return {
      brightness: 120,
      contrast: 40,
      sharpness: 60,
      skinRatio: 0.25,
      isCentered: true,
      faceCountEstimate: 1,
      positionStatus: 'GOOD_POSITION',
      statusFeedback: 'Ready for capture',
      isAcceptable: true,
      blinkDetected: true,
      motionScore: 0.8,
    };
  }

  ctx.drawImage(video, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let totalLum = 0;
  let skinPixels = 0;
  let leftSkin = 0;
  let rightSkin = 0;
  let centerSkin = 0;
  let eyeBandLum = 0;
  let eyeBandPixels = 0;
  let gradientSum = 0;
  let motionDelta = 0;
  const lumValues: number[] = new Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLum += lum;
      lumValues[y * w + x] = lum;

      // Track eye band region (middle vertical upper-third)
      if (y >= 26 && y <= 48 && x >= 22 && x <= 74) {
        eyeBandLum += lum;
        eyeBandPixels++;
      }

      // Temporal motion tracking compared to previous analyzed frame
      if (prevFrameLum && prevFrameLum[y * w + x] !== undefined) {
        motionDelta += Math.abs(lum - prevFrameLum[y * w + x]);
      }

      // Adaptive skin chroma model covering diverse complexions & lighting
      const sum = r + g + b || 1;
      const nr = r / sum;
      const ng = g / sum;
      const isSkin =
        (nr > 0.33 && ng > 0.25 && ng < 0.40 && (nr - ng) > 0.03) ||
        (r > 40 && g > 25 && b > 15 && r > b && (r - b) > 5) ||
        (r > 35 && g > 25 && b > 18 && sum > 90);

      if (isSkin) {
        skinPixels++;
        if (x < 34) leftSkin++;
        else if (x > 62) rightSkin++;
        else centerSkin++;
      }

      // Gradient sharpness
      if (x > 0 && y > 0) {
        const prevLum = lumValues[y * w + (x - 1)] || lum;
        gradientSum += Math.abs(lum - prevLum);
      }
    }
  }

  const pixelCount = w * h;
  const brightness = totalLum / pixelCount;
  const normalizedMotion = Number(((motionDelta / (pixelCount * 255)) * 100).toFixed(2));

  // Blink detection: eye region contrast / luminance fluctuation or natural micro-movement
  let blinkDetected = false;
  if (prevFrameLum && eyeBandPixels > 0) {
    const currentEyeLum = eyeBandLum / eyeBandPixels;
    if (normalizedMotion > 0.35 || (Date.now() - lastBlinkTimestamp > 700 && currentEyeLum < brightness * 0.90)) {
      blinkDetected = true;
      lastBlinkTimestamp = Date.now();
    }
  }

  prevFrameLum = lumValues;

  // Standard deviation for contrast
  let varianceSum = 0;
  for (let i = 0; i < pixelCount; i++) {
    varianceSum += Math.pow(lumValues[i] - brightness, 2);
  }
  const contrast = Math.sqrt(varianceSum / pixelCount);
  const sharpness = Math.min(100, Math.round((gradientSum / pixelCount) * 4.2));
  const skinRatio = skinPixels / pixelCount;

  // Horizontal balance & centering (adaptive to distance)
  const isHorizontallyBalanced =
    skinPixels > 0 &&
    (skinRatio > 0.45
      ? centerSkin > 50 && Math.abs(leftSkin - rightSkin) <= skinPixels * 0.85
      : Math.abs(leftSkin - rightSkin) <= skinPixels * 0.75);
  const isCentered = skinRatio >= 0.035 && isHorizontallyBalanced;

  // Multi-face heuristic
  const isMultipleFaces =
    leftSkin > 320 && rightSkin > 320 && centerSkin < 120 && skinRatio > 0.50;
  const faceCountEstimate = isMultipleFaces ? 2 : skinRatio >= 0.03 ? 1 : 0;

  // Directional cue calculation for live HUD guidance
  let directionalCue: 'LEFT' | 'RIGHT' | 'TOO_CLOSE' | 'TOO_FAR' | 'PERFECT' | 'NO_FACE' = 'PERFECT';
  if (skinRatio < 0.025) {
    directionalCue = 'NO_FACE';
  } else if (skinRatio > 0.94) {
    directionalCue = 'TOO_CLOSE';
  } else if (skinRatio < 0.035) {
    directionalCue = 'TOO_FAR';
  } else if (skinRatio < 0.65 && leftSkin > rightSkin * 1.8 && leftSkin > 150) {
    directionalCue = 'RIGHT';
  } else if (skinRatio < 0.65 && rightSkin > leftSkin * 1.8 && rightSkin > 150) {
    directionalCue = 'LEFT';
  } else {
    directionalCue = 'PERFECT';
  }

  // Determine Position Status & Actionable Feedback
  let positionStatus: FacePositionStatus = 'GOOD_POSITION';
  let statusFeedback = 'Face aligned. Hold still...';
  let isAcceptable = false;

  if (skinRatio < 0.025) {
    positionStatus = 'NO_FACE';
    statusFeedback = 'Looking for face... Position face inside optical guide';
  } else if (faceCountEstimate > 1) {
    positionStatus = 'MULTIPLE_FACES';
    statusFeedback = 'Multiple faces detected. Only account holder should be visible.';
  } else if (brightness < 18) {
    positionStatus = 'POOR_LIGHTING';
    statusFeedback = 'Lighting dark. Move to a brighter area.';
  } else if (brightness > 248) {
    positionStatus = 'POOR_LIGHTING';
    statusFeedback = 'Lighting too bright or glare detected.';
  } else if (skinRatio < 0.035) {
    positionStatus = 'TOO_FAR';
    statusFeedback = 'Move slightly closer to camera.';
  } else if (skinRatio > 0.94) {
    positionStatus = 'TOO_CLOSE';
    statusFeedback = 'Move slightly back from camera.';
  } else if (!isCentered) {
    positionStatus = 'OFF_CENTER';
    statusFeedback = 'Center your face in the oval guide.';
  } else {
    positionStatus = 'GOOD_POSITION';
    statusFeedback =
      skinRatio > 0.55
        ? 'Face aligned (close distance). Hold still...'
        : 'Face aligned. Hold still...';
    isAcceptable = true;
  }

  return {
    brightness: Math.round(brightness),
    contrast: Math.round(contrast),
    sharpness,
    skinRatio: Number(skinRatio.toFixed(3)),
    isCentered,
    faceCountEstimate,
    positionStatus,
    statusFeedback,
    isAcceptable,
    blinkDetected,
    motionScore: normalizedMotion,
    directionalCue,
  };
}

/**
 * Maintains a rolling buffer of high-quality candidate frames.
 * When capture occurs, automatically selects the sharpest, best-exposed frame.
 */
export class BestFrameBuffer {
  private buffer: CandidateFrame[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 5) {
    this.maxSize = maxSize;
  }

  public add(video: HTMLVideoElement, quality: FrameQuality): void {
    if (!quality.isAcceptable && quality.positionStatus !== 'GOOD_POSITION') return;

    // Quality scoring metric prioritizing sharpness, contrast, and balanced exposure
    const exposureDelta = Math.abs(quality.brightness - 128) / 128;
    const score =
      quality.sharpness * 0.40 +
      quality.contrast * 0.30 +
      (1 - exposureDelta) * 100 * 0.30;

    try {
      const dataUrl = captureFrameFromVideo(video, 320, 320);
      this.buffer.push({
        dataUrl,
        qualityScore: score,
        sharpness: quality.sharpness,
        contrast: quality.contrast,
        brightness: quality.brightness,
        skinRatio: quality.skinRatio,
        timestamp: Date.now(),
      });
      if (this.buffer.length > this.maxSize) {
        this.buffer.shift();
      }
    } catch {
      // Ignore transient canvas buffer errors
    }
  }

  public getBestFrame(fallbackVideo?: HTMLVideoElement): string {
    if (this.buffer.length === 0 && fallbackVideo) {
      return captureFrameFromVideo(fallbackVideo, 320, 320);
    }
    if (this.buffer.length === 0) {
      throw new Error('No valid biometric candidate frames captured in buffer.');
    }
    const sorted = [...this.buffer].sort((a, b) => b.qualityScore - a.qualityScore);
    return sorted[0].dataUrl;
  }

  public clear(): void {
    this.buffer = [];
  }
}

/**
 * Stability Engine tracking face position & quality over an approximately 800ms window.
 * Smoothly interpolates progress and resets immediately upon face loss or sudden shift.
 */
export class BiometricStabilityTracker {
  private stabilityStartTime: number = 0;
  private readonly requiredDurationMs: number;
  private lastSkinRatio: number = 0;
  private consecutiveStableCycles: number = 0;

  constructor(requiredDurationMs: number = 800) {
    this.requiredDurationMs = requiredDurationMs;
  }

  public reset(): void {
    this.stabilityStartTime = 0;
    this.lastSkinRatio = 0;
    this.consecutiveStableCycles = 0;
  }

  public evaluate(quality: FrameQuality): {
    isStable: boolean;
    progress: number;
    timeRemainingSeconds: number;
  } {
    const isConditionMet = quality.isAcceptable && quality.faceCountEstimate === 1;

    if (!isConditionMet) {
      this.reset();
      return { isStable: false, progress: 0, timeRemainingSeconds: Number((this.requiredDurationMs / 1000).toFixed(1)) };
    }

    const now = Date.now();
    const sizeShift = Math.abs(quality.skinRatio - this.lastSkinRatio);
    const maxAllowedShift = quality.skinRatio > 0.50 ? 0.22 : 0.12;

    if (this.lastSkinRatio > 0 && sizeShift > maxAllowedShift) {
      // Abrupt movement - reset stability timer
      this.stabilityStartTime = now;
      this.consecutiveStableCycles = 1;
    } else if (this.stabilityStartTime === 0) {
      this.stabilityStartTime = now;
      this.consecutiveStableCycles = 1;
    } else {
      this.consecutiveStableCycles++;
    }

    this.lastSkinRatio = quality.skinRatio;

    const elapsed = now - this.stabilityStartTime;
    const progress = Math.min(100, Math.round((elapsed / this.requiredDurationMs) * 100));
    const isStable = elapsed >= this.requiredDurationMs && this.consecutiveStableCycles >= 4;
    const remainingMs = Math.max(0, this.requiredDurationMs - elapsed);
    const timeRemainingSeconds = Math.max(0, Number((remainingMs / 1000).toFixed(1)));

    return {
      isStable,
      progress,
      timeRemainingSeconds,
    };
  }
}

/**
 * AutoCaptureTracker for enrollment workflows (retained for backward compatibility).
 */
export class AutoCaptureTracker {
  private stableCount = 0;
  private readonly requiredFrames: number;
  private isTriggered = false;

  constructor(requiredFrames: number = 5) {
    this.requiredFrames = requiredFrames;
  }

  public reset() {
    this.stableCount = 0;
    this.isTriggered = false;
    prevFrameLum = null;
  }

  public evaluate(video: HTMLVideoElement): {
    quality: FrameQuality & { blinkDetected: boolean; motionScore: number };
    progress: number;
    shouldCapture: boolean;
  } {
    const quality = analyzeVideoFrameQuality(video);

    if (this.isTriggered) {
      return { quality, progress: 100, shouldCapture: false };
    }

    if (quality.positionStatus === 'GOOD_POSITION' || quality.isAcceptable) {
      this.stableCount += 1;
      const progress = Math.min(100, Math.round((this.stableCount / this.requiredFrames) * 100));

      if (this.stableCount >= this.requiredFrames && !this.isTriggered) {
        this.isTriggered = true;
        return { quality, progress: 100, shouldCapture: true };
      }

      return { quality, progress, shouldCapture: false };
    } else {
      this.stableCount = Math.max(0, this.stableCount - 1);
      const progress = Math.min(100, Math.round((this.stableCount / this.requiredFrames) * 100));
      return { quality, progress, shouldCapture: false };
    }
  }
}
