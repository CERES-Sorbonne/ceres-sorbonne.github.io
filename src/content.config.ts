import { defineCollection } from 'astro:content'
import { file, glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { parse } from 'csv-parse/sync'

// Une valeur YAML vide (`tags:`) donne null : on la ramène à une liste vide.
const list = z.preprocess(
  (v) => (v == null ? [] : Array.isArray(v) ? v : [v]),
  z.array(z.coerce.string()),
)

// Articles : src/data/<N>_<gabarit>_<collection>/[<date>_<nom>/]index.md
const posts = defineCollection({
  loader: glob({
    base: './src/data',
    pattern: '[0-9]*/**/index.md',
    generateId: ({ entry }) => entry.replace(/\/?index\.md$/, ''),
  }),
  schema: z.object({
    // uuid et title sont censés être présents ; les entrées incomplètes
    // (brouillons) sont écartées dans src/lib/content.ts avec un avertissement.
    uuid: z.string().optional(),
    title: z.coerce.string().optional(),
    author: list,
    tags: list,
    abstract: z.coerce.string().optional(),
    sound: z.string().optional(),
    event: z.boolean().optional(),
    prettyName: z.coerce.string().optional(),
  }),
})

// Tableau des outils : src/data/_outils/outils_numeriques.csv
const toSlug = (nom: string) => nom.split(' ').join('-').toLowerCase()
const outils = defineCollection({
  loader: file('src/data/_outils/outils_numeriques.csv', {
    parser: (text) =>
      parse(text, { columns: true, skip_empty_lines: true, trim: true }).map(
        (row: Record<string, string>) => ({ id: toSlug(row.nom), ...row }),
      ),
  }),
  schema: z.object({
    nom: z.string(),
    description: z.string().default(''),
    fonctions: z.string().default(''),
    phases: z.string().default(''),
    donnees: z.string().default(''),
    difficulte: z.string().default(''),
    source: z.string().default(''),
  }),
})

export const collections = { posts, outils }
