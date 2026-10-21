import { useEffect, useState } from 'react'
import { Bookmark, Folder, FolderOpen, Link } from 'lucide-react'
import { useSettings } from '../store/settings'

const MOCK = [
  { id: '1', title: 'Bookmarks bar', children: [
    { id: '10', title: 'AUST', children: [] },
    { id: '11', title: 'Competitive Programming', children: [
      { id: '110', title: 'CSES Problemset', url: 'https://cses.fi/problemset/' },
    ] },
    { id: '12', title: 'Capture The Flag', children: [] },
  ] },
  { id: '2', title: 'Other bookmarks', children: [] },
]

const api = () => globalThis.chrome?.bookmarks

export function useBookmarks() {
  const [roots, setRoots] = useState([])

  useEffect(() => {
    const bm = api()
    if (!bm) {
      setRoots(MOCK) // dev server fallback
      return
    }
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

function BookmarkNode({ node, expand }) {
  const [open, setOpen] = useState(!!expand)
  const row = 'flex items-center gap-2 py-0.5 text-left text-[#f6f6f6]/50 hover:text-[#f6f6f6] transition-colors'

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
          {node.children?.map((c) => <BookmarkNode key={c.id} node={c} expand={expand} />)}
        </div>
      )}
    </div>
  )
}

export default function Bookmarks() {
  const { showBookmarks, expandBookmarks, bookmarkFolder } = useSettings((s) => s.settings)
  const folder = bookmarkFolder ?? 'all'
  const roots = useBookmarks()

  if (!showBookmarks) return null

  const selected = folder === 'all' ? null : findNode(roots, folder)
  const items = selected ? selected.children ?? [] : roots.flatMap((r) => r.children ?? [])
  const title = selected?.title || 'All Bookmarks'

  return (
    <div className="fixed top-6 left-6 z-10 max-w-[280px] text-lg">
      <div className="flex items-center gap-2 text-[#f6f6f6] text-xl">
        <Bookmark size={18} />
        <span>{title}</span>
      </div>
      <div key={`${expandBookmarks}-${folder}`} className="ml-6 mt-1 flex flex-col">
        {items.map((n) => <BookmarkNode key={n.id} node={n} expand={expandBookmarks} />)}
      </div>
    </div>
  )
}