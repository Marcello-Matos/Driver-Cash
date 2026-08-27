// Gera os ícones PNG do PWA a partir de pwa-assets/icon.svg
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, 'icon.svg')
const outDir = resolve(__dirname, '..', 'public')

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'maskable-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 }
]

for (const t of targets) {
  await sharp(src, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(resolve(outDir, t.file))
  console.log('gerado:', t.file)
}
console.log('Ícones gerados em /public')
