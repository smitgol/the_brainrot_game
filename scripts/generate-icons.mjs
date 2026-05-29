import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public", "icons");

const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0a0a0f"/>
  <text x="256" y="200" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="72" fill="#ff2d55">FF</text>
  <text x="256" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#00f5d4">FOCUS</text>
</svg>
`;

async function generate() {
  await mkdir(iconsDir, { recursive: true });
  const buffer = Buffer.from(svg);

  for (const size of [192, 512]) {
    const png = await sharp(buffer).resize(size, size).png().toBuffer();
    await writeFile(join(iconsDir, `${size}.png`), png);
    console.log(`Generated ${size}.png`);
  }
}

generate().catch(console.error);
