// Remplace onCreateNode / createPages de gatsby-node.js : calcule pour chaque
// article sa section, sa date (tirée du nom de dossier), son image de carte,
// son extrait et ses URL.
import fs from 'node:fs'
import path from 'node:path'
import type { ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import { getCollection, type CollectionEntry } from 'astro:content'
import { CONTENT_DIR } from './content-paths.mjs'

export type Post = {
  entry: CollectionEntry<'posts'>
  uuid: string
  title: string
  section: string // ex. ateliers
  isIntro: boolean // index.md à la racine d'une section
  date: string | null // AAAA-MM-JJ
  url: string
  imageFile: string | null // chemin relatif à src/data
}

/** Données sérialisables passées aux îles React (cartes). */
export type CardData = {
  url: string
  title: string
  date: string | null
  dateLabel: string | null
  section: string
  tags: string[]
  text: string
  sound: string | null
  image: { src: string; srcset: string; width: number; height: number } | null
}

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/data/**/*.{png,jpg,jpeg,PNG,JPG,JPEG}',
)
const IMAGE_FILE = /\.(png|jpe?g)$/i

function firstImage(dir: string) {
  const abs = path.join(CONTENT_DIR, dir)
  const file = fs
    .readdirSync(abs)
    .filter((f) => IMAGE_FILE.test(f))
    .sort((a, b) => a.localeCompare(b))[0]
  return file ? path.posix.join(dir, file) : null
}

let cache: Promise<Post[]> | null = null

/** Tous les articles valides, du plus récent au plus ancien (sans date : par nom de dossier). */
export function getPosts(): Promise<Post[]> {
  cache ??= (async () => {
    const entries = await getCollection('posts')
    const posts: Post[] = []
    for (const entry of entries) {
      const parts = entry.id.split('/')
      const { uuid, title, prettyName } = entry.data
      if (!uuid || !title) {
        console.warn(`[contenu] ${entry.id} ignoré : ${!uuid ? 'uuid' : 'title'} manquant`)
        continue
      }
      const folder = parts[1] ?? ''
      const date = folder.split('_')[0].match(/^\d{4}-\d{2}-\d{2}$/)?.[0] ?? null
      posts.push({
        entry,
        uuid,
        title,
        section: parts[0].split('_')[2],
        isIntro: parts.length === 1,
        date,
        url: `/${prettyName ?? uuid}`,
        imageFile: firstImage(entry.id),
      })
    }
    return posts.sort(
      (a, b) =>
        (b.date ?? '').localeCompare(a.date ?? '') || a.entry.id.localeCompare(b.entry.id),
    )
  })()
  return cache
}

export const allTags = (posts: Post[]) =>
  [...new Set(posts.flatMap((p) => p.entry.data.tags))].sort()

const MONTHS = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' })

/** Même rendu que `formatString: "DD MMMM, YYYY"` de Gatsby : « 08 février, 2024 ». */
export function formatDate(iso: string | null) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d} ${MONTHS.format(new Date(Date.UTC(+y, +m - 1, 1)))}, ${y}`
}

/** Texte brut tiré du Markdown, coupé comme `excerpt(pruneLength)` de Gatsby. */
export function excerpt(markdown: string, length = 600) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\^[^\]]+\]:?/g, '')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`~]+/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= length) return text
  const cut = text.slice(0, length)
  return cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : length) + '…'
}

export async function cardImage(post: Post) {
  if (!post.imageFile) return null
  const load = images[`/src/data/${post.imageFile}`]
  if (!load) return null
  const img = await getImage({ src: (await load()).default, width: 400, densities: [1, 2] })
  return {
    src: img.src,
    srcset: img.srcSet.attribute,
    width: Number(img.attributes.width),
    height: Number(img.attributes.height),
  }
}

export async function toCard(post: Post): Promise<CardData> {
  const { tags, abstract, sound } = post.entry.data
  return {
    url: post.url,
    title: post.title,
    date: post.date,
    dateLabel: formatDate(post.date),
    section: post.section,
    tags,
    text: abstract ?? excerpt(post.entry.body ?? ''),
    sound: sound ?? null,
    image: await cardImage(post),
  }
}

/**
 * Toutes les URL d'articles : /<uuid>, et pour un prettyName /<prettyName>
 * et sa variante en minuscules, comme dans gatsby-node.js.
 */
export function articleRoutes(posts: Post[], reserved: string[]) {
  const routes = new Map<string, Post>()
  const claim = (slug: string, post: Post) => {
    const other = routes.get(slug)
    if (other && other !== post)
      throw new Error(`URL /${slug} en conflit entre ${other.entry.id} et ${post.entry.id}`)
    if (reserved.includes(slug))
      throw new Error(`URL /${slug} (${post.entry.id}) déjà prise par une section`)
    routes.set(slug, post)
  }
  for (const post of posts.filter((p) => !p.isIntro)) {
    // uuid en double : Gatsby ne le vérifiait pas et gardait la dernière page créée
    // (la plus ancienne) ; on fait de même, avec un avertissement.
    const other = routes.get(post.uuid)
    if (other && other !== post) {
      console.warn(`[contenu] uuid ${post.uuid} en double : ${other.entry.id} et ${post.entry.id} ; /${post.uuid} affiche ${post.entry.id}`)
      routes.set(post.uuid, post)
    } else claim(post.uuid, post)
    const pretty = post.entry.data.prettyName
    if (pretty) {
      claim(pretty, post)
      claim(pretty.toLowerCase(), post)
    }
  }
  return routes
}
