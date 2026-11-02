import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const dir = "assets/img";
const out = path.join(dir, "opt");
await fs.mkdir(out, { recursive: true });

const files = (await fs.readdir(dir)).filter((f) => /\.(jpe?g)$/i.test(f));

for (const file of files) {
  const base = path.basename(file, path.extname(file));
  const src = path.join(dir, file);
  const meta = await sharp(src).metadata();
  const widths = [...new Set([900, 1600, meta.width].filter((w) => w && w <= meta.width))].sort((a, b) => a - b);

  for (const width of widths) {
    const target = path.join(out, `${base}-${width}.webp`);
    await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(target);
    const stat = await fs.stat(target);
    console.log(`${target}  ${Math.round(stat.size / 1024)} KB`);
  }
}
