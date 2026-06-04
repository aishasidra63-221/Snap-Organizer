import jsQR from "jsqr";
import { Jimp } from "jimp";
import { logger } from "./logger.js";

/**
 * Attempts to decode a QR code from an image file.
 * Returns the decoded text (lowercased) or null if no QR found.
 */
export async function scanQrCode(filePath: string): Promise<string | null> {
  try {
    const image = await Jimp.read(filePath);
    const { width, height } = image.bitmap;
    const data = new Uint8ClampedArray(image.bitmap.data);
    const code = jsQR(data, width, height);
    if (code?.data) {
      logger.info({ filePath, qrText: code.data.slice(0, 80) }, "QR code decoded");
      return code.data.toLowerCase();
    }
    return null;
  } catch (e) {
    logger.warn({ err: e, filePath }, "QR scan failed");
    return null;
  }
}
