import { useEffect, useState } from 'react'
import { Bookmark, Folder, FolderOpen, Link } from 'lucide-react'
import { useSettings } from '../store/settings'

const api = () => globalThis.chrome?.bookmarks

export function useBookmarks() {
  const [roots, setRoots] = useState([])

  useEffect(() => {
    const bm = api()
    if (!bm) return // not running as an extension
    const load = () => bm.getTree(([root]) => setRoots(root.children ?? []))
    load()
    const events = [bm.onCreated, bm.onRemoved, bm.onChanged, bm.onMoved]
    events.forEach((e) => e.addListener(load))
    return () => events.forEach((e) => e.removeListener(load))
  }, [])

  return roots
}

export function findNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n
    const hit = n.children && findNode(n.children, id)
    if (hit) return hit
  }
}

// for the "Select Folder" dropdown in Settings
export function folderOptions(nodes, depth = 0) {
  return nodes.flatMap((n) =>
    n.url ? [] : [
      { value: n.id, label: `${'\u00A0\u00A0'.repeat(depth)}${n.title || 'Untitled'}` },
      ...folderOptions(n.children ?? [], depth + 1),
    ]
  )
}

function BookmarkNode({ node }) {
  const [open, setOpen] = useState(false)
  const row = 'flex items-center gap-2 py-0.5 text-left text-fg/50 hover:text-fg transition-colors cursor-pointer'

  if (node.url) {
    return (
      <a href={node.url} className={row}>
        <Link size={14} className="shrink-0" />
        <span className="truncate">{node.title || node.url}</span>
      </a>
    )
  }

  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className={row}>
        {open ? <FolderOpen size={14} className="shrink-0" /> : <Folder size={14} className="shrink-0" />}
        <span className="truncate">{node.title || 'Untitled'}</span>
      </button>
      {open && (
        <div className="ml-4 flex flex-col">
          {node.children?.length
            ? node.children.map((c) => <BookmarkNode key={c.id} node={c} />)
            : <span className="py-0.5 text-fg/30 text-base">Empty</span>}
        </div>
      )}
    </div>
  )
}

export default function Bookmarks() {
  const { showBookmarks, expandBookmarks, bookmarkFolder } = useSettings((s) => s.settings)
  const folder = bookmarkFolder ?? 'all'
  const roots = useBookmarks()
  const [pinned, setPinned] = useState(!!expandBookmarks)
  const [hovered, setHovered] = useState(false)

  useEffect(() => setPinned(!!expandBookmarks), [expandBookmarks])

  if (!showBookmarks) return null

  const selected = folder === 'all' ? null : findNode(roots, folder)
  const items = selected ? selected.children ?? [] : roots.flatMap((r) => r.children ?? [])
  const title = selected?.title || 'All Bookmarks'
  const expanded = pinned || hovered

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed top-6 left-6 z-10 w-[280px] text-lg"
    >
      <button
        onClick={() => setPinned((p) => !p)}
        aria-expanded={expanded}
        className="flex items-center gap-2 text-fg text-xl cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Bookmark size={18} />
        <span>{title}</span>
      </button>

      {/* Smooth expand/collapse */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="ml-6 mt-1 flex flex-col max-h-[calc(100vh-9rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((n) => <BookmarkNode key={n.id} node={n} />)}
          </div>
        </div>
      </div>
    </div>
  )
}