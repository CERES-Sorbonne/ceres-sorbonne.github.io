// Copie dans public/files/ les fichiers référencés par le contenu Markdown
// et non pris en charge par l'optimisation d'images d'Astro
// (voir src/lib/remark-content-links.mjs, qui réécrit les URL correspondantes).
import fs from 'node:fs'
import path from 'node:path'
import { CONTENT_DIR, OPTIMIZED_IMAGE, resolveContentUrl } from '../src/lib/content-paths.mjs'

const OUT = path.resolve('public/files')

if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`Contenu introuvable dans ${CONTENT_DIR} : lancer ./dev.sh d'abord.`)
  process.exit(1)
}

const MD_IMAGE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)/g
const MD_LINK = /(?<!!)\[[^\]]*\]\(\s*<?([^)\s>]+)/g
const MD_DEFINITION = /^\s*\[[^\]]+\]:\s*<?(\S+?)>?(\s|$)/gm
const HTML_ATTR = /\b(?:src|href)=(["'])(.*?)\1/gi

function* markdownFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* markdownFiles(full)
    else if (entry.name.endsWith('.md')) yield full
  }
}

fs.rmSync(OUT, { recursive: true, force: true })
const wanted = new Map()

for (const md of markdownFiles(CONTENT_DIR)) {
  const text = fs.readFileSync(md, 'utf8')
  const refs = [
    ...[...text.matchAll(MD_IMAGE)].map((m) => [m[1], true]),
    ...[...text.matchAll(MD_LINK)].map((m) => [m[1], false]),
    ...[...text.matchAll(MD_DEFINITION)].map((m) => [m[1], false]),
    ...[...text.matchAll(HTML_ATTR)].map((m) => [m[2], false]),
  ]
  for (const [url, isMdImage] of refs) {
    const hit = resolveContentUrl(md, url)
    if (!hit || hit.kind !== 'file' || hit.rel.endsWith('.md')) continue
    if (isMdImage && OPTIMIZED_IMAGE.test(hit.rel)) continue
    wanted.set(hit.rel, hit.abs)
  }
}

for (const [rel, abs] of wanted) {
  const dest = path.join(OUT, rel)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(abs, dest)
}
console.log(`copy-content-files : ${wanted.size} fichiers copiés dans public/files/`)
