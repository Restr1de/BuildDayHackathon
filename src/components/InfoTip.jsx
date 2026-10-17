import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// An "i" button. Tap or click it to read a plain-language explanation; no hovering needed.
//  - Desktop / tablet: a small popover next to the button.
//  - Phone (narrow screens): a bottom sheet with large text and a big Close button.
// Closes on Esc, on tapping outside, or on Close. Rendered in a portal so a scrolling table can't clip it.

const POPOVER_WIDTH = 304
const isNarrow = () => window.matchMedia('(max-width: 639px)').matches

export default function InfoTip({ title, children }) {
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState(null) // { sheet } or { top | bottom, left, width }
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const panelId = useId()

  const close = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const toggle = () => {
    if (open) return close()
    if (isNarrow()) {
      setPlace({ sheet: true })
    } else {
      const r = buttonRef.current.getBoundingClientRect()
      const width = Math.min(POPOVER_WIDTH, window.innerWidth - 16)
      const left = Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8))
      const below = window.innerHeight - r.bottom > 240
      setPlace(
        below
          ? { top: r.bottom + 8, left, width }
          : { bottom: window.innerHeight - r.top + 8, left, width },
      )
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && close()
    // A floating popover would drift away from its button if the page moved under it.
    const onMove = () => !place?.sheet && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, place])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={`What does “${title}” mean?`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="-my-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-primary"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 11v5.5" />
          <circle cx="12" cy="7.6" r="0.6" fill="currentColor" />
        </svg>
      </button>

      {open &&
        place &&
        createPortal(
          place.sheet ? (
            <div className="fixed inset-0 z-50 bg-black/40">
              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-label={title}
                tabIndex={-1}
                className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-2xl outline-none"
              >
                <h3 className="text-xl font-bold text-ink">{title}</h3>
                <div className="mt-2 text-lg leading-relaxed text-ink">{children}</div>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-lg font-semibold text-on-primary hover:bg-primary-hover"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={title}
              tabIndex={-1}
              style={{ position: 'fixed', top: place.top, bottom: place.bottom, left: place.left, width: place.width }}
              className="z-50 rounded-lg border border-line bg-surface p-4 shadow-xl outline-none"
            >
              <h3 className="text-base font-bold text-ink">{title}</h3>
              <div className="mt-1 text-base leading-relaxed text-ink">{children}</div>
            </div>
          ),
          document.body,
        )}
    </>
  )
}
