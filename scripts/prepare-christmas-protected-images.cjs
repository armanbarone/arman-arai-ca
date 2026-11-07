// Publish web-sized previews without altering the photographs. Sources stay in the supplied
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
  const result = await sharp(path.join(sourceDirectory, source)).rotate()
    .resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82, effort: 6 })
    .toFile(path.join(__dirname, '../public/christmas', destination));
  console.log(JSON.stringify({ file: destination, width: result.width, height: result.height, bytes: result.size }));
}
Promise.all(photos.map(prepare)).catch(error => { console.error(error); process.exitCode = 1; });
