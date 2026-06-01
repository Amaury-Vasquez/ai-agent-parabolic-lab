// Genera el set de iconos PNG (PWA, Apple, favicon) y la imagen Open Graph
// a partir de los SVG fuente en scripts/. Ejecutar: node scripts/generate-icons.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = (f) => join(root, "scripts", f);
const pub = (f) => join(root, "public", f);
const app = (f) => join(root, "src", "app", f);

const iconSvg = await readFile(src("icon-source.svg"));
const maskableSvg = await readFile(src("icon-maskable.svg"));
const ogSvg = await readFile(src("og-source.svg"));

const png = (svg, size) =>
  sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

await mkdir(pub("icons"), { recursive: true });

// Iconos PWA (referenciados en app/manifest.ts)
await writeFile(pub("icons/icon-192.png"), await png(iconSvg, 192));
await writeFile(pub("icons/icon-512.png"), await png(iconSvg, 512));
await writeFile(pub("icons/maskable-192.png"), await png(maskableSvg, 192));
await writeFile(pub("icons/maskable-512.png"), await png(maskableSvg, 512));

// Convenciones de archivo de Next.js (App Router los enlaza automáticamente)
await writeFile(app("icon.png"), await png(iconSvg, 512));
await writeFile(app("apple-icon.png"), await png(iconSvg, 180));

// Favicon SVG escalable (convención app/icon.svg)
await writeFile(app("icon.svg"), iconSvg);

// favicon.ico con entradas PNG de 16/32/48 px (soportado por navegadores modernos)
function buildIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: icono
  header.writeUInt16LE(count, 4);

  const entries = [];
  const blobs = [];
  let offset = 6 + count * 16;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // ancho
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // alto
    entry.writeUInt8(0, 2); // paleta
    entry.writeUInt8(0, 3); // reservado
    entry.writeUInt16LE(1, 4); // planos
    entry.writeUInt16LE(32, 6); // bits por pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    blobs.push(data);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

const icoImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await png(iconSvg, size) }))
);
await writeFile(app("favicon.ico"), buildIco(icoImages));

// Open Graph / Twitter (1200x630)
await writeFile(
  pub("og-image.png"),
  await sharp(ogSvg, { density: 192 }).resize(1200, 630).png().toBuffer()
);

console.log("Iconos e imagen OG generados correctamente.");
