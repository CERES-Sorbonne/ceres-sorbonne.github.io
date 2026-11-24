import Calendar from 'react-calendar'

const isoDay = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]

/** events : [{ date: 'AAAA-MM-JJ', title, url }] */
export default function EventCalendar({ events }) {
  return (
    <Calendar
      locale="fr-FR"
      maxDetail="month"
      minDetail="month"
      className="landing-block"
      tileContent={({ date }) => {
        const event = events.find((e) => e.date === isoDay(date))
        if (!event) return null
        const title = event.title.length > 25 ? event.title.slice(0, 23) + '...' : event.title
        return <a href={event.url}>{title}</a>
      }}
    />
  )
}
