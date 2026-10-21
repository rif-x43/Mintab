export default function SidebarToggle({ isOpen, onClick, position = 'right' }) {
  const isRight = position === 'right'
  const pointsLeft = isRight ? !isOpen : isOpen

  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 ${isRight ? 'right-12' : 'left-12'} text-fg opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-pointer z-50`}
      aria-label="Toggle sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={pointsLeft ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )
}