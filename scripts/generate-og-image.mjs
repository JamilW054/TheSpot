/**
 * Generates an OG image 1200×630, <600 KB for WhatsApp and social.
 * Run: node scripts/generate-og-image.mjs
 * Output: public/banner/og.jpg
 */

import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const input = join(root, "public", "banner", "1.png");
const output = join(root, "public", "banner", "og.jpg");

const W = 1200;
const H = 630;
const MAX_BYTES = 600 * 1024;

if (!existsSync(input)) {
  console.error("Missing public/banner/1.png");
  process.exit(1);
}

let quality = 88;
let buffer = await sharp(input)
  .resize(W, H, { fit: "cover", position: "center" })
  .jpeg({ quality, mozjpeg: true })
  .toBuffer();

while (buffer.length > MAX_BYTES && quality > 50) {
  quality -= 8;
  buffer = await sharp(input)
    .resize(W, H, { fit: "cover", position: "center" })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
}

await sharp(buffer).toFile(output);
const sizeKB = (buffer.length / 1024).toFixed(1);
console.log(`Wrote ${output} (1200×630, ${sizeKB} KB)`);
