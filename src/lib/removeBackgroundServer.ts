import sharp from "sharp";

/**
 * Server-side logo processor: makes the near-uniform background transparent
 * (sampling the corner color, with a soft-edge falloff) and turns dark,
 * low-saturation pixels (black/gray text like a tagline) white so the logo
 * reads clearly on the dark navy header — while leaving saturated colors
 * (like a blue brand mark) untouched. Used to reprocess an already-uploaded
 * logo without requiring the admin to re-upload it.
 */
export async function removeFlatBackgroundServer(input: Buffer, threshold = 28): Promise<Buffer> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of corners) {
    const idx = (y * width + x) * channels;
    r += data[idx];
    g += data[idx + 1];
    b += data[idx + 2];
  }
  r /= 4;
  g /= 4;
  b /= 4;

  const softEdge = threshold * 1.6;
  for (let i = 0; i < data.length; i += channels) {
    const dr = data[i] - r;
    const dg = data[i + 1] - g;
    const db = data[i + 2] - b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist < threshold) {
      data[i + 3] = 0;
    } else if (dist < softEdge) {
      const alpha = (dist - threshold) / (softEdge - threshold);
      data[i + 3] = Math.round(data[i + 3] * alpha);
    }
  }

  whitenDarkGrayscalePixels(data, channels);

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

/**
 * Turns dark, low-saturation (grayscale-ish) pixels white in place — e.g.
 * black or gray logo text — while leaving saturated colors (a blue brand
 * mark, etc.) unchanged. Skips fully transparent pixels.
 */
function whitenDarkGrayscalePixels(data: Buffer | Uint8Array, channels: number, chromaMax = 42, lightnessMax = 170) {
  for (let i = 0; i < data.length; i += channels) {
    if (channels > 3 && data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    const lightness = (max + min) / 2;
    if (chroma < chromaMax && lightness < lightnessMax) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
}
