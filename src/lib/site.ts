import fs from 'node:fs'
import { CONTENT_DIR } from './content-paths.mjs'

export const SITE_TITLE = 'CERES Sorbonne Université'

export const AUTHORS: Record<string, string> = {
  gael: 'Gaël Lejeune',
  virginie: 'Virginie Julliard',
  lea: 'Léa Andolfi',
  julien: 'Julien Bezançon',
  felix: 'Félix Alié',
  msd: 'Marie-Sophie Desmarest',
  edouard: 'Édouard Bouté',
  victor: 'Victor Ecrement',
  thibault: 'Thibault Grison',
  marceau: 'Marceau Hernandez',
  rimane: 'Rimane Karam',
  clara: 'Clara Bordier',
  emile: 'Émile Rebours',
  adelie: 'Adélie Laruncet',
  marine: 'Marine Tiger',
  denisa: 'Denisa-Florina Bumba',
  laurene: 'Laurène Cave',
  mateo: 'Matteo Zibardi',
  fred: 'fred Pailler',
  thomas: 'Thomas Bottini',
  ceres: "L'équipe CERES",
}

export const authorNames = (ids: string[]) =>
  ids.filter((id) => id in AUTHORS).map((id) => AUTHORS[id]).join(' & ')

export type Section = {
  folder: string // ex. 1_cards_ateliers
  group: string // ex. 1
  template: 'cards' | 'longcards'
  name: string // ex. ateliers (segment d'URL)
  label: string // ex. Ateliers
  link: string // ex. /ateliers/
}

/** Une section par dossier `<N>_<gabarit>_<nom>` du contenu, dans l'ordre des dossiers. */
export function getSections(): Section[] {
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d+_(cards|longcards)_/.test(d.name))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
    .map((folder) => {
      const [group, template, name] = folder.split('_')
      return {
        folder,
        group,
        template: template as Section['template'],
        name,
        label: name[0].toUpperCase() + name.slice(1),
        link: `/${name}/`,
      }
    })
}

/** Le menu : les sections, avec un séparateur à chaque changement de groupe. */
export function getMenu() {
  const menu: ({ label: string; link: string } | 'separator')[] = []
  let group = '1'
  for (const s of getSections()) {
    if (s.group !== group) {
      menu.push('separator')
      group = s.group
    }
    menu.push({ label: s.label, link: s.link })
  }
  return menu
}
