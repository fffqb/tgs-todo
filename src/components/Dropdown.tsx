import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  renderTrigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
}

export function Dropdown({ renderTrigger, children, align = 'left' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  const close = () => setOpen(false)

  return (
    <div className="dropdown" ref={ref}>
      {renderTrigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && <div className={`popover popover-${align}`}>{children(close)}</div>}
    </div>
  )
}
