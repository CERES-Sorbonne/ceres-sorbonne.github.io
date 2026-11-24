// État partagé entre les îles React d'une page (panneau de tags et liste de cartes).
// Les îles d'une même page partagent ce module : c'est l'équivalent du
// state que layout.jsx passait aux pages via une fonction enfant.
import { useSyncExternalStore } from 'react'

let state = { tags: [], search: '', open: false }
const listeners = new Set()

const set = (patch) => {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const filterStore = {
  get: () => state,
  subscribe: (l) => (listeners.add(l), () => listeners.delete(l)),
  setSearch: (search) => set({ search }),
  setOpen: (open) => set({ open }),
  /** `nav` : clic depuis le panneau (ne le referme pas). */
  toggleTag(tag, nav = false) {
    const { tags, open } = state
    if (tags.includes(tag)) {
      set({ tags: tags.filter((t) => t !== tag), open: open && !(!nav && tags.length === 1) })
    } else {
      set({ tags: [...tags, tag], open: true })
    }
  },
  /** Reprend ?tags=a,b&q=texte (liens depuis les pages article). */
  initFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const tags = params.get('tags')?.split(',').filter(Boolean) ?? []
    const search = params.get('q') ?? ''
    if (tags.length || search) set({ tags, search, open: true })
  },
}

const SERVER_STATE = { tags: [], search: '', open: false }
export const useFilter = () =>
  useSyncExternalStore(filterStore.subscribe, filterStore.get, () => SERVER_STATE)

/** Même logique que filterNodes() de l'ancien helpers.js. */
export function filterCards(cards, search, tags) {
  const q = search.trim().toLowerCase()
  return cards.filter((card) => {
    if (q && !card.tags.includes(search) && !card.title.toLowerCase().includes(q) && !card.text.toLowerCase().includes(q))
      return false
    return tags.every((t) => card.tags.includes(t))
  })
}
