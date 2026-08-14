function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Makes the near-uniform background of a logo transparent by sampling the
 * corner color and clearing pixels close to it, with a soft-edge falloff so
 * anti-aliased edges don't get a hard cutout look.
 */
export async function removeFlatBackground(file: File, threshold = 28): Promise<File> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0);

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

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
    const i = (y * width + x) * 4;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  r /= 4;
  g /= 4;
  b /= 4;

  const softEdge = threshold * 1.6;
  for (let i = 0; i < data.length; i += 4) {
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

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(file);
        return;
      }
      const name = file.name.replace(/\.\w+$/, "") + "-transparente.png";
      resolve(new File([blob], name, { type: "image/png" }));
    }, "image/png");
  });
}
