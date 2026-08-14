import sharp from "sharp";

/**
 * Server-side equivalent of removeBackground.ts — makes the near-uniform
 * background of a logo transparent by sampling the corner color and
 * clearing pixels close to it, with a soft-edge falloff. Used to reprocess
 * an already-uploaded logo without requiring the admin to re-upload it.
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

  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}
