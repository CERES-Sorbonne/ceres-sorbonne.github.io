import { useEffect } from 'react'
import { filterStore, useFilter } from './filterStore'

export const Tag = ({ tagName, selected, onClick }) => (
  <a className={'small-tag' + (selected ? ' selected' : '')} onClick={onClick}>
    {tagName}
  </a>
)

/**
 * Panneau latéral « Recherche de contenus par concepts » (LeftNav de l'ancien layout).
 * mode="filter" : filtre les cartes de la page.
 * mode="navigate" : sur une page sans liste, renvoie vers l'accueil filtré.
 */
export default function TagPanel({ allTags, mode = 'filter' }) {
  const { tags, search, open } = useFilter()

  useEffect(() => {
    if (mode === 'filter') filterStore.initFromUrl()
  }, [mode])

  const toggle = (tag) => {
    if (mode === 'navigate') window.location.href = `/?tags=${encodeURIComponent(tag)}`
    else filterStore.toggleTag(tag, true)
  }
  const visibility = open ? 'visible' : 'hidden'

  return (
    <div id="tags-panel-container" style={{ left: open ? '1rem' : '-17rem', paddingRight: open ? '1rem' : '0.5rem' }}>
      <nav id="tags-panel">
        <div id="title-button-container">
          <p style={{ visibility }}>
            <strong>Recherche de contenus par concepts</strong>
          </p>
          <button className="discrete-button" onClick={() => filterStore.setOpen(!open)}>
            <div style={{ fontSize: open ? '1rem' : '1.4rem', transform: open ? 'none' : 'rotate(50deg)' }}>
              {' '}{open ? '←' : '⚲'}{' '}
            </div>
          </button>
        </div>
        <div id="tags-panel-text" style={{ visibility }}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (mode === 'navigate') window.location.href = `/?q=${encodeURIComponent(search)}`
            }}
          >
            <input
              type="text"
              placeholder="Recherche dans le texte"
              value={search}
              onChange={(e) => filterStore.setSearch(e.target.value)}
            />
          </form>
        </div>
        <hr style={{ visibility }} />
        <div id="tags-panel-tree" style={{ visibility }}>
          <div className="wild-tags">
            {allTags.map((t) => (
              <Tag key={t} tagName={t} selected={tags.includes(t)} onClick={() => toggle(t)} />
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
