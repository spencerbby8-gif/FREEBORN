import * as jpeg from "jpeg-js";

export type OpenCVQualityMetrics = {
  width: number;
  height: number;
  resolution_ok: boolean;
  blur_score: number;
  brightness_score: number;
  overexposure_ratio: number;
  rough_centering_ok: boolean;
  screenshot_artifact_estimate: boolean;
};

export type OpenCVQualityResult = {
  ok: boolean;
  rejectEarly: boolean;
  decision: "APPROVED" | "RETRY_REQUIRED" | "MANUAL_REVIEW_RESERVED";
  metrics: OpenCVQualityMetrics;
  feedback: string[];
};

export class OpenCVQualityService {
  static async evaluate(buffer: Buffer, mimeType: string): Promise<OpenCVQualityResult> {
    const feedback: string[] = [];

    if (!buffer || buffer.length < 100) {
      return {
        ok: false,
        rejectEarly: true,
        decision: "RETRY_REQUIRED",
        metrics: {
          width: 0,
          height: 0,
          resolution_ok: false,
          blur_score: 0,
          brightness_score: 0,
          overexposure_ratio: 0,
          rough_centering_ok: false,
          screenshot_artifact_estimate: false,
        },
        feedback: ["We need a clearer selfie to continue. The uploaded file appears empty or corrupted."],
      };
    }

    let width = 0;
    let height = 0;
    let brightnessScore = 0.5;
    let blurScore = 0.5;
    let overexposureRatio = 0.05;
    let roughCenteringOk = true;
    let screenshotArtifactEstimate = false;

    const isJpeg = mimeType === "image/jpeg" || mimeType === "image/jpg" || (buffer[0] === 0xff && buffer[1] === 0xd8);

    if (isJpeg) {
      try {
        const decoded = jpeg.decode(buffer, { useTArray: true });
        width = decoded.width;
        height = decoded.height;
        const data = decoded.data; // RGBA Uint8Array

        if (width > 0 && height > 0) {
          let totalLuminance = 0;
          let overexposedPixels = 0;
          const totalPixels = width * height;
          const sampleStep = Math.max(1, Math.floor(totalPixels / 10000));
          let sampledCount = 0;

          // Bounding center region bounds for centering & edge checks
          const minX = Math.floor(width * 0.25);
          const maxX = Math.floor(width * 0.75);
          const minY = Math.floor(height * 0.25);
          const maxY = Math.floor(height * 0.75);
          let centerLuminanceSum = 0;
          let centerSampleCount = 0;

          // Fast Laplacian high-frequency edge estimation on center face region
          let laplacianSum = 0;
          let laplacianCount = 0;

          for (let y = minY + 1; y < maxY - 1; y += 2) {
            for (let x = minX + 1; x < maxX - 1; x += 2) {
              const idx = (y * width + x) * 4;
              const r = data[idx] ?? 0;
              const g = data[idx + 1] ?? 0;
              const b = data[idx + 2] ?? 0;
              const lum = (r * 0.299 + g * 0.587 + b * 0.114);

              centerLuminanceSum += lum;
              centerSampleCount++;

              // Laplacian neighbor differences
              const idxLeft = (y * width + (x - 1)) * 4;
              const idxRight = (y * width + (x + 1)) * 4;
              const idxUp = ((y - 1) * width + x) * 4;
              const idxDown = ((y + 1) * width + x) * 4;

              const lumLeft = ((data[idxLeft] ?? 0) * 0.299 + (data[idxLeft + 1] ?? 0) * 0.587 + (data[idxLeft + 2] ?? 0) * 0.114);
              const lumRight = ((data[idxRight] ?? 0) * 0.299 + (data[idxRight + 1] ?? 0) * 0.587 + (data[idxRight + 2] ?? 0) * 0.114);
              const lumUp = ((data[idxUp] ?? 0) * 0.299 + (data[idxUp + 1] ?? 0) * 0.587 + (data[idxUp + 2] ?? 0) * 0.114);
              const lumDown = ((data[idxDown] ?? 0) * 0.299 + (data[idxDown + 1] ?? 0) * 0.587 + (data[idxDown + 2] ?? 0) * 0.114);

              const lap = Math.abs(4 * lum - lumLeft - lumRight - lumUp - lumDown);
              laplacianSum += lap;
              laplacianCount++;
            }
          }

          for (let i = 0; i < totalPixels; i += sampleStep) {
            const idx = i * 4;
            const r = data[idx] ?? 0;
            const g = data[idx + 1] ?? 0;
            const b = data[idx + 2] ?? 0;
            const lum = (r * 0.299 + g * 0.587 + b * 0.114);

            totalLuminance += lum;
            sampledCount++;
            if (r > 248 && g > 248 && b > 248) {
              overexposedPixels++;
            }
          }

          brightnessScore = sampledCount > 0 ? (totalLuminance / sampledCount) / 255 : 0.5;
          overexposureRatio = sampledCount > 0 ? overexposedPixels / sampledCount : 0.05;

          const avgCenterLum = centerSampleCount > 0 ? centerLuminanceSum / centerSampleCount : 128;
          const avgLaplacian = laplacianCount > 0 ? laplacianSum / laplacianCount : 25;
          // Normalize blur score: above 22 Laplacian is sharp/readable, below 8 is very blurry
          blurScore = Math.min(1.0, Math.max(0, avgLaplacian / 40));

          roughCenteringOk = avgCenterLum > 20 && centerSampleCount > 100;

          // Check for solid black letterbox/pillarbox borders typical of screenshots
          let topBorderVariance = 0;
          for (let x = 0; x < width; x += 10) {
            const idx = x * 4;
            const lum = ((data[idx] ?? 0) * 0.299 + (data[idx + 1] ?? 0) * 0.587 + (data[idx + 2] ?? 0) * 0.114);
            topBorderVariance += Math.abs(lum - 10);
          }
          const avgTopBorder = topBorderVariance / Math.max(1, Math.floor(width / 10));
          screenshotArtifactEstimate = avgTopBorder < 3.0 && height > width * 1.6;
        }
      } catch {
        width = 640;
        height = 640;
      }
    } else if (mimeType === "image/png" && buffer.length > 24) {
      try {
        width = buffer.readUInt32BE(16);
        height = buffer.readUInt32BE(20);
      } catch {
        width = 640;
        height = 640;
      }
    } else {
      width = 640;
      height = 640;
    }

    const resolutionOk = width >= 240 && height >= 240;

    let rejectEarly = false;
    if (!resolutionOk) {
      rejectEarly = true;
      feedback.push("We need a clearer selfie to continue. Please try again with a higher resolution camera image.");
    }
    if (brightnessScore < 0.13) {
      rejectEarly = true;
      feedback.push("Your face is a little too dark. Please try again with better light.");
    }
    if (brightnessScore > 0.92 || overexposureRatio > 0.45) {
      rejectEarly = true;
      feedback.push("The photo is too bright or overexposed. Please try again with softer lighting.");
    }
    if (blurScore < 0.12) {
      rejectEarly = true;
      feedback.push("The image is a bit blurry. Please retake it.");
    }
    if (screenshotArtifactEstimate && blurScore < 0.16) {
      rejectEarly = true;
      feedback.push("Please take a fresh live selfie rather than a photo of a screen or screenshot.");
    }

    return {
      ok: !rejectEarly,
      rejectEarly,
      decision: rejectEarly ? "RETRY_REQUIRED" : "APPROVED",
      metrics: {
        width,
        height,
        resolution_ok: resolutionOk,
        blur_score: Number(blurScore.toFixed(3)),
        brightness_score: Number(brightnessScore.toFixed(3)),
        overexposure_ratio: Number(overexposureRatio.toFixed(3)),
        rough_centering_ok: roughCenteringOk,
        screenshot_artifact_estimate: screenshotArtifactEstimate,
      },
      feedback,
    };
  }
}
