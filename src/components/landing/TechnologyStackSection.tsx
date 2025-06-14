import React, { useState, useEffect, useRef } from 'react'

/**
 * TechnologyStackSection
 * ----------------------
 * Renders the "Technology Stack" drag-to-explore card carousel
 * that lives directly beneath the Testimonials section on the
 * landing page. All CSS from the original HTML snippet has been
 * converted to styled-jsx so it applies only to this component.
 */
const DOT_COUNT = 4

const TechnologyStackSection: React.FC = () => {
  // The active (front-most) card. Defaults to the 4th so we match
  // the supplied snippet (card-4-active).
  const [activeCard, setActiveCard] = useState<number>(4)
  // Reference to the card container for potential future DOM interactions
  const containerRef = useRef<HTMLElement | null>(null)


  /* ------------------------------------------------------------------
   * Drag handling — only the foremost card is draggable. We track the
   * initial pointer position and decide swipe direction on release.
   * ----------------------------------------------------------------*/
  const startDrag = (
    e: React.PointerEvent<HTMLElement>,
    cardIndex: number,
  ) => {
    if (cardIndex !== activeCard) return
    const startX = e.clientX
    const cardEl = e.currentTarget as HTMLElement
    cardEl.setPointerCapture(e.pointerId)

    const onMove = (ev: PointerEvent) => {
      const diff = ev.clientX - startX
      if (diff > 10) {
        cardEl.classList.add('dragging-right')
        cardEl.classList.remove('dragging-left')
      } else if (diff < -10) {
        cardEl.classList.add('dragging-left')
        cardEl.classList.remove('dragging-right')
      } else {
        cardEl.classList.remove('dragging-left', 'dragging-right')
      }
    }

    const onUp = (ev: PointerEvent) => {
      cardEl.releasePointerCapture(e.pointerId)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      if (cardEl.classList.contains('dragging-right')) {
        setActiveCard((prev) => (prev === 1 ? DOT_COUNT : prev - 1))
      } else if (cardEl.classList.contains('dragging-left')) {
        setActiveCard((prev) => (prev === DOT_COUNT ? 1 : prev + 1))
      }
      cardEl.classList.remove('dragging-left', 'dragging-right')
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  // Utility to style the carousel navigation dots
  const dotClass = (idx: number) =>
    `w-2 h-2 rounded-full transition-all ${
      activeCard === idx ? 'bg-white scale-125' : 'bg-gray-600 hover:bg-gray-300'
    }`

  return (
    <div className="max-w-5xl bg-white/5 border border-white/5 rounded-3xl mt-8 mx-auto pt-24 pb-24 px-8">
      <div className="flex items-center justify-between gap-8">
        {/* Textual side */}
        <div className="flex-1 max-w-lg pr-8">
          <div className="flex items-center gap-2 text-gray-400 mb-6">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="uppercase text-xs font-medium tracking-wide">
              BookmarkAI Tech
            </span>
          </div>
          <h2 className="text-4xl font-medium tracking-tighter mb-6">
            Technology Stack
          </h2>
          <p className="text-base text-gray-400 mb-8">
            Drag cards to explore our technology solutions and discover how
            we&apos;re building innovative platforms.
          </p>

          {/* Navigation dots */}
          <div className="flex gap-3 mb-8">
            {Array.from({ length: DOT_COUNT }).map((_, idx) => (
              <button
                key={idx}
                aria-label={`Card ${idx + 1}`}
                className={dotClass(idx + 1)}
                onClick={() => setActiveCard(idx + 1)}
              />
            ))}
          </div>

          {/* Feature bullets */}
          <div className="space-y-4 text-sm text-gray-400">
            {[
              'Built on Next.js 15 for blazing performance',
              'Supabase Postgres & Edge Functions for realtime data',
              'Clerk authentication baked in for secure access',
              'Tailwind CSS for fully responsive design',
              'Sentry observability & error monitoring',
            ].map((txt) => (
              <div key={txt} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card stack */}
        <section
          id="tech-cards-container"
          ref={containerRef}
          className={`card-${activeCard}-active`}
        >
          {/* Card 1 */}
          <article
            className="relative h-96 glass rounded-2xl shadow-2xl rotate-x-10 -rotate-y-20"
            onPointerDown={(e) => startDrag(e, 1)}
          >
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-white/10 border border-white/20">
                  {/* Flame icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-white"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
                <span className="text-xs uppercase tracking-wide text-gray-300 font-medium">
                  Sync
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Seamless Sync</h3>
              <p className="text-gray-300 mb-6 flex-1">
                BookmarkAI keeps your links in perfect harmony across every
                device in real-time—no manual refresh required.
              </p>
              <div className="flex items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-gray-400">98% accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-gray-400">Real-time processing</span>
                </div>
              </div>
              <button className="w-full py-3 px-4 glass rounded-lg text-white hover:bg-white/10 transition-colors">
                Improve insights by 40%
              </button>
            </div>
          </article>

          {/* Card 2 */}
          <article
            className="relative h-96 glass rounded-2xl shadow-2xl rotate-x-10 -rotate-y-20"
            onPointerDown={(e) => startDrag(e, 2)}
          >
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-white/10 border border-white/20">
                  {/* Lightning icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-white"
                  >
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                  </svg>
                </div>
                <span className="text-xs uppercase tracking-wide text-gray-300 font-medium">
                  Search
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Instant Search</h3>
              <p className="text-gray-300 mb-6 flex-1">
                Lightning-fast, AI-powered search means you'll find any saved
                resource in milliseconds—even from years ago.
              </p>
              <div className="flex items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-gray-400">24/7 monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-gray-400">Auto-scaling</span>
                </div>
              </div>
              <button className="w-full py-3 px-4 glass rounded-lg text-white hover:bg-white/10 transition-colors">
                Boost efficiency by 35%
              </button>
            </div>
          </article>

          {/* Card 3 */}
          <article
            className="relative h-96 glass rounded-2xl shadow-2xl rotate-x-10 -rotate-y-20"
            onPointerDown={(e) => startDrag(e, 3)}
          >
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-white/10 border border-white/20">
                  {/* Workflow icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-white"
                  >
                    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
                    <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
                    <path d="m14 16-3 3 3 3" />
                    <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
                    <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
                    <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
                  </svg>
                </div>
                <span className="text-xs uppercase tracking-wide text-gray-300 font-medium">
                  Insights
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Smart Insights</h3>
              <p className="text-gray-300 mb-6 flex-1">
                Personalized recommendations bubble up hidden gems from your
                archive so great content never gets lost.
              </p>
              <div className="flex items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-gray-400">Zero downtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-gray-400">Smart workflows</span>
                </div>
              </div>
              <button className="w-full py-3 px-4 glass rounded-lg text-white hover:bg-white/10 transition-colors">
                Automate 90% of tasks
              </button>
            </div>
          </article>

          {/* Card 4 */}
          <article
            className="relative h-96 glass rounded-2xl shadow-2xl rotate-x-10 -rotate-y-20"
            onPointerDown={(e) => startDrag(e, 4)}
          >
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-white/10 border border-white/20">
                  {/* Check square icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-white"
                  >
                    <path d="M16 7h6v6" />
                    <path d="m22 7-8.5 8.5-5-5L2 17" />
                  </svg>
                </div>
                <span className="text-xs uppercase tracking-wide text-gray-300 font-medium">
                  Security
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Privacy First</h3>
              <p className="flex-1 text-gray-300 mb-6">
                End-to-end encryption and best-in-class auth keep your
                bookmarks safe, secure, and for your eyes only.
              </p>
              <div className="flex items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-gray-400">Custom dashboards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-gray-400">Real-time updates</span>
                </div>
              </div>
              <button className="w-full py-3 px-4 glass rounded-lg text-white hover:bg-white/10 transition-colors">
                Enhanced reporting suite
              </button>
            </div>
          </article>
        </section>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        #tech-cards-container {
          --_offset-steps: 4rem;
          --_scale-steps: 15;
          --_opacity-steps: 20;
          --_offset-steps-two: calc(var(--_offset-steps) * -1);
          --_offset-steps-three: calc(var(--_offset-steps) * -2);
          --scale-steps-two: calc(1 - var(--_scale-steps) * 0.01);
          --scale-steps-three: calc(1 - var(--_scale-steps) * 0.02);
          --opacity-steps-two: calc(1 - var(--_opacity-steps) * 0.02);
          --opacity-steps-three: calc(1 - var(--_opacity-steps) * 0.04);
          display: grid;
          grid-template-areas: 'stack';
          width: min(calc(100% - 2rem), 26rem);
        }
        #tech-cards-container article {
          grid-area: stack;
          transition: 500ms ease-in-out;
          translate: var(--_offset) 0;
          order: var(--_order);
          z-index: var(--_order);
          scale: var(--_scale);
          opacity: var(--_opacity);
          cursor: grab;
          user-select: none;
        }
        #tech-cards-container article:nth-of-type(1) {
          --_order: var(--_1-order);
          --_scale: var(--_1-scale);
          --_opacity: var(--_1-opacity);
          --_offset: var(--_1-offset);
        }
        #tech-cards-container article:nth-of-type(2) {
          --_order: var(--_2-order);
          --_scale: var(--_2-scale);
          --_opacity: var(--_2-opacity);
          --_offset: var(--_2-offset);
        }
        #tech-cards-container article:nth-of-type(3) {
          --_order: var(--_3-order);
          --_scale: var(--_3-scale);
          --_opacity: var(--_3-opacity);
          --_offset: var(--_3-offset);
        }
        #tech-cards-container article:nth-of-type(4) {
          --_order: var(--_4-order);
          --_scale: var(--_4-scale);
          --_opacity: var(--_4-opacity);
          --_offset: var(--_4-offset);
        }
        #tech-cards-container article:active {
          cursor: grabbing;
        }
        #tech-cards-container.card-1-active {
          --_1-order: 4;
          --_1-scale: 1;
          --_1-opacity: 1;
          --_1-offset: 0;
          --_2-order: 3;
          --_2-scale: var(--scale-steps-two);
          --_2-opacity: var(--opacity-steps-two);
          --_2-offset: var(--_offset-steps-two);
          --_3-order: 2;
          --_3-scale: var(--scale-steps-three);
          --_3-opacity: var(--opacity-steps-three);
          --_3-offset: var(--_offset-steps-three);
          --_4-order: 1;
          --_4-scale: calc(1 - var(--_scale-steps) * 0.03);
          --_4-opacity: calc(1 - var(--_opacity-steps) * 0.06);
          --_4-offset: calc(var(--_offset-steps) * -3);
        }
        #tech-cards-container.card-2-active {
          --_2-order: 4;
          --_2-scale: 1;
          --_2-opacity: 1;
          --_2-offset: 0;
          --_3-order: 3;
          --_3-scale: var(--scale-steps-two);
          --_3-opacity: var(--opacity-steps-two);
          --_3-offset: var(--_offset-steps-two);
          --_4-order: 2;
          --_4-scale: var(--scale-steps-three);
          --_4-opacity: var(--opacity-steps-three);
          --_4-offset: var(--_offset-steps-three);
          --_1-order: 1;
          --_1-scale: calc(1 - var(--_scale-steps) * 0.03);
          --_1-opacity: calc(1 - var(--_opacity-steps) * 0.06);
          --_1-offset: calc(var(--_offset-steps) * -3);
        }
        #tech-cards-container.card-3-active {
          --_3-order: 4;
          --_3-scale: 1;
          --_3-opacity: 1;
          --_3-offset: 0;
          --_4-order: 3;
          --_4-scale: var(--scale-steps-two);
          --_4-opacity: var(--opacity-steps-two);
          --_4-offset: var(--_offset-steps-two);
          --_1-order: 2;
          --_1-scale: var(--scale-steps-three);
          --_1-opacity: var(--opacity-steps-three);
          --_1-offset: var(--_offset-steps-three);
          --_2-order: 1;
          --_2-scale: calc(1 - var(--_scale-steps) * 0.03);
          --_2-opacity: calc(1 - var(--_opacity-steps) * 0.06);
          --_2-offset: calc(var(--_offset-steps) * -3);
        }
        #tech-cards-container.card-4-active {
          --_4-order: 4;
          --_4-scale: 1;
          --_4-opacity: 1;
          --_4-offset: 0;
          --_1-order: 3;
          --_1-scale: var(--scale-steps-two);
          --_1-opacity: var(--opacity-steps-two);
          --_1-offset: var(--_offset-steps-two);
          --_2-order: 2;
          --_2-scale: var(--scale-steps-three);
          --_2-opacity: var(--opacity-steps-three);
          --_2-offset: var(--_offset-steps-three);
          --_3-order: 1;
          --_3-scale: calc(1 - var(--_scale-steps) * 0.03);
          --_3-opacity: calc(1 - var(--_opacity-steps) * 0.06);
          --_3-offset: calc(var(--_offset-steps) * -3);
        }
        .dragging-left {
          transform: translateX(-50px);
        }
        .dragging-right {
          transform: translateX(50px);
        }
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}

export default TechnologyStackSection 