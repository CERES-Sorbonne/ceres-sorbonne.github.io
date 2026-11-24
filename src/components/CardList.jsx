import { useEffect, useRef } from 'react'
import { filterCards, filterStore, useFilter } from './filterStore'
import { Tag } from './TagPanel'

// Même structure que GatsbyImage : .image-card est le conteneur dimensionné par le CSS,
// l'image le remplit.
const CardImage = ({ image, title }) =>
  image ? (
    <div className="image-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <img
        src={image.src}
        srcSet={image.srcset}
        width={image.width}
        height={image.height}
        alt={title}
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          margin: 0, padding: 0, maxWidth: 'none', maxHeight: 'none',
        }}
      />
    </div>
  ) : (
    <div className="image-card" />
  )

const Details = ({ card }) => (
  <div className="card-details">
    <time dateTime={card.date}>{card.dateLabel}</time> •{' '}
    <a className="section-name" href={`/${card.section}`}>{card.section}</a>
  </div>
)

const Tags = ({ card, selectedTags }) =>
  card.tags.length > 0 && (
    <div className="small-tags-container">
      {card.tags.map((t) => (
        <Tag key={t} tagName={t} selected={selectedTags.includes(t)} onClick={() => filterStore.toggleTag(t)} />
      ))}
    </div>
  )

export const Card = ({ card, selectedTags }) => (
  <div className="small-card">
    <a className="card-link" href={card.url} aria-label={card.title} />
    <CardImage image={card.image} title={card.title} />
    <h4>{card.title}</h4>
    <Details card={card} />
    <Tags card={card} selectedTags={selectedTags} />
    <p className="text-sample">{card.text}</p>
  </div>
)

export const LongCard = ({ card, selectedTags }) => (
  <div className="long-card">
    <a className="card-link" href={card.url} aria-label={card.title} />
    <CardImage image={card.image} title={card.title} />
    <div className="description">
      <h4>{card.title}</h4>
      {card.sound && (
        <audio controls>
          <source src={card.sound} type="audio/wav" />
        </audio>
      )}
      {card.date && <Details card={card} />}
      <Tags card={card} selectedTags={selectedTags} />
      <p className="text-sample">{card.text}</p>
    </div>
  </div>
)

/**
 * Grille de cartes filtrée par le panneau de tags.
 * scrollTo : id d'un élément à faire défiler en vue quand un filtre s'applique (accueil).
 */
export default function CardList({ cards, variant = 'card', scrollTo }) {
  const { tags, search } = useFilter()
  const filtered = filterCards(cards, search, tags)
  const isFiltered = filtered.length !== cards.length
  const first = useRef(true)

  useEffect(() => {
    if (first.current) return void (first.current = false)
    if (scrollTo && isFiltered) document.getElementById(scrollTo)?.scrollIntoView()
  }, [tags, search])

  const Component = variant === 'long' ? LongCard : Card
  return (
    <div id="cards-container">
      {filtered.map((card) => (
        <Component key={card.url} card={card} selectedTags={tags} />
      ))}
    </div>
  )
}
