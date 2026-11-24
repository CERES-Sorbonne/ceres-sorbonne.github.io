// Résolution des liens relatifs du contenu Markdown, partagée entre le plugin
// remark (réécriture des URL) et scripts/copy-content-files.mjs (copie des fichiers).
import fs from 'node:fs'
import path from 'node:path'

export const CONTENT_DIR = path.resolve('src/data')
export const FILES_PREFIX = '/files'

/** Images que Astro optimise lui-même quand elles sont insérées en Markdown. */
export const OPTIMIZED_IMAGE = /\.(png|jpe?g|webp)$/i

const realContentDir = () => fs.realpathSync(CONTENT_DIR)

/** Chemin relatif au dossier de contenu, que le fichier soit vu via le lien symbolique ou non. */
export function relativeToContent(absPath) {
  for (const root of [CONTENT_DIR, realContentDir()]) {
    const rel = path.relative(root, absPath)
    if (!rel.startsWith('..') && !path.isAbsolute(rel)) return rel
  }
  return null
}

export function isRelativeUrl(url) {
  return !!url && !/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(url.trim())
}

/**
 * Résout une URL relative trouvée dans `mdFile`.
 * Renvoie { kind: 'file', rel } pour un fichier existant,
 * { kind: 'dir', rel } pour un dossier de contenu, ou null.
 */
export function resolveContentUrl(mdFile, url) {
  if (!isRelativeUrl(url)) return null
  const clean = decodeURIComponent(url.trim().split(/[?#]/)[0])
  if (!clean) return null
  const abs = path.resolve(path.dirname(mdFile), clean)
  const rel = relativeToContent(abs)
  if (rel === null || !fs.existsSync(abs)) return null
  return { kind: fs.statSync(abs).isDirectory() ? 'dir' : 'file', rel, abs }
}

export const publicFileUrl = (rel) =>
  `${FILES_PREFIX}/${rel.split(path.sep).map(encodeURIComponent).join('/')}`
