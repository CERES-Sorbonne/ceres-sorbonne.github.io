// Remplace gatsby-remark-copy-linked-files.
// Les articles sont servis à /<uuid>, donc les liens relatifs du Markdown
// (pdf, csv, zip, gif, bmp, <img src> en HTML…) sont réécrits vers /files/…,
// où scripts/copy-content-files.mjs copie les fichiers.
// Un lien vers le dossier d'un autre article est réécrit vers sa page.
import fs from 'node:fs'
import path from 'node:path'
import {
  isRelativeUrl,
  OPTIMIZED_IMAGE,
  publicFileUrl,
  relativeToContent,
  resolveContentUrl,
} from './content-paths.mjs'

function articleRoute(dirAbs, rel) {
  const index = path.join(dirAbs, 'index.md')
  if (!fs.existsSync(index)) return null
  const parts = rel.split(path.sep).filter(Boolean)
  if (parts.length === 1) return `/${parts[0].split('_')[2]}/` // racine d'une collection
  const fm = fs.readFileSync(index, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const field = (name) => fm.match(new RegExp(`^${name}:\\s*["']?([^"'\\n]+?)["']?\\s*$`, 'm'))?.[1]
  const target = field('prettyName') ?? field('uuid')
  return target ? `/${target}` : null
}

function rewrite(mdFile, url, { keepOptimizedImages }) {
  const hit = resolveContentUrl(mdFile, url)
  if (!hit) {
    // Image relative introuvable : Astro ferait échouer le build ; on la laisse
    // cassée (comme sous Gatsby) en la sortant du pipeline d'images.
    if (keepOptimizedImages && isRelativeUrl(url)) {
      const rel = relativeToContent(path.resolve(path.dirname(mdFile), url))
      console.warn(`[contenu] image introuvable : ${url} (${relativeToContent(mdFile) ?? mdFile})`)
      return rel ? publicFileUrl(rel) : url
    }
    return url
  }
  if (hit.kind === 'dir') return articleRoute(hit.abs, hit.rel) ?? url
  if (keepOptimizedImages && OPTIMIZED_IMAGE.test(hit.rel)) return url
  const suffix = url.match(/[?#].*$/)?.[0] ?? ''
  return publicFileUrl(hit.rel) + suffix
}

const HTML_ATTR = /\b(src|href)=(["'])(.*?)\2/gi

export default function remarkContentLinks() {
  return (tree, file) => {
    const mdFile = file.path ?? file.history?.[0]
    if (!mdFile) return
    const walk = (node) => {
      if (node.type === 'image') {
        node.url = rewrite(mdFile, node.url, { keepOptimizedImages: true })
      } else if (node.type === 'link' || node.type === 'definition') {
        node.url = rewrite(mdFile, node.url, { keepOptimizedImages: false })
      } else if (node.type === 'html') {
        node.value = node.value.replace(HTML_ATTR, (all, attr, q, url) =>
          `${attr}=${q}${rewrite(mdFile, url, { keepOptimizedImages: false })}${q}`)
      }
      node.children?.forEach(walk)
    }
    walk(tree)
  }
}
