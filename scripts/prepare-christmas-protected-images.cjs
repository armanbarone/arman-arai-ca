// Publish only branded web previews. Source photographs stay in the supplied
// local source folder and are never copied into the public website directory.
const sharp = require('sharp');
const path = require('node:path');
const sourceDirectory = process.argv[2];
if (!sourceDirectory) throw Error('Provide the local source-photo folder.');
const photos = [
  ['hf_20261107_050617_a32e0927-2a0d-4e20-b1d7-4727ea2e8949.png', 'santa-portrait-2026.webp'],
  ['Joyful Toddler Riding a Christmas Reindeer.png', 'toddler-reindeer-2026.webp'],
  ['Tender Christmas Family Portrait.png', 'family-portrait-2026.webp'],
  ['Cozy Family Christmas in a Snowy Forest (2).png', 'family-window-2026.webp'],
  ['Snowy Christmas Reindeer Gift Glow.png', 'reindeer-glow-2026.webp'],
];
async function prepare([source, destination]) {
  const { data, info } = await sharp(path.join(sourceDirectory, source)).rotate()
    .resize({ width: 1200, withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const markSize = Math.round(width * 0.067), footerSize = Math.max(17, Math.round(width * 0.023));
  const mark = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <g transform="rotate(-18 ${width / 2} ${height * .63})" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${markSize}" letter-spacing="${width * .003}">
      <text x="${width / 2}" y="${height * .63}" fill="#000" fill-opacity=".15" stroke="#000" stroke-opacity=".15" stroke-width="2">ARMAN ARAI</text>
      <text x="${width / 2}" y="${height * .63 - 1}" fill="#fff" fill-opacity=".32">ARMAN ARAI</text>
    </g>
    <text x="${width * .95}" y="${height * .965}" text-anchor="end" font-family="Arial,sans-serif" font-size="${footerSize}" font-weight="700" fill="#fff" stroke="#000" stroke-opacity=".45" stroke-width="1" paint-order="stroke">© ARMAN ARAI</text>
  </svg>`);
  const result = await sharp(data).composite([{ input: mark }]).webp({ quality: 82, effort: 6 })
    .toFile(path.join(__dirname, '../public/christmas', destination));
  console.log(JSON.stringify({ file: destination, width, height, bytes: result.size }));
}
Promise.all(photos.map(prepare)).catch(error => { console.error(error); process.exitCode = 1; });
