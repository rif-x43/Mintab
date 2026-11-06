import { useNotifications } from '../store/notifications'

function inline(text) {
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https:\/\/[^)\s]+\))/g
  return text.split(re).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('`')) return <code key={i} className="px-1 rounded bg-card">{part.slice(1, -1)}</code>
    const m = part.match(/^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/)
    if (m) return <a key={i} href={m[2]} target="_blank" rel="noreferrer" className="underline hover:opacity-70">{m[1]}</a>
    return part
  })
}

function Body({ text }) {
  return (
    <div className="flex flex-col gap-1 text-base opacity-80">
      {text.split('\n').map((line, i) =>
        line.startsWith('- ') ? (
          <div key={i} className="flex gap-2"><span>•</span><span>{inline(line.slice(2))}</span></div>
        ) : line.trim() ? (
          <p key={i}>{inline(line)}</p>
        ) : null
      )}
    </div>
  )
}

export default function NotificationsView() {
  const items = useNotifications((s) => s.items)

  if (!items.length) return <p className="text-lg opacity-60">No notifications yet.</p>

  return (
    <div className="flex flex-col gap-4">
      {items.map((n) => (
        <article key={n.id} className="bg-card rounded-[9px] p-5 flex flex-col gap-3 text-fg">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-medium">{n.title}</h2>
            <span className="text-base opacity-60">{n.date}</span>
          </div>
          {n.body && <Body text={n.body} />}
          {n.button?.url?.startsWith('https://') && (
            <a
              href={n.button.url}
              target="_blank"
              rel="noreferrer"
              className="self-start h-10 px-5 bg-fg text-bg rounded-[5px] flex items-center text-base hover:opacity-80 transition-opacity"
            >
              {n.button.label || 'Open'}
            </a>
          )}
        </article>
      ))}
    </div>
  )
}