'use client'

// Duplicate of original landing page for experimentation.
// Once validated, changes can be merged back into src/app/landing/page.tsx

import { useEffect } from 'react'
import LandingPage from '../landing/page'
import Head from 'next/head'

export default function LandingCopy() {
  // On mount tweak copy and branding in the imported landing page DOM
  useEffect(() => {
    // 1. Update header brand and nav link copy
    document.querySelectorAll('header a').forEach((el) => {
      const txt = el.textContent?.trim()
      if (txt === 'FlowSync') {
        el.textContent = 'BookmarkAI'
      } else if (txt?.toLowerCase() === 'sign in') {
        el.textContent = 'SIGN IN'
      }
    })
    // Update primary CTA in nav if present
    const startTrialBtn = document.querySelector('header button span')
    if (startTrialBtn) {
      startTrialBtn.textContent = 'START FREE TRIAL'
    }

    // 2. Replace hero headline & sub-headline copy
    const heroSection = document.querySelector(
      'section.relative.overflow-hidden.bg-gradient-to-b',
    )
    if (heroSection) {
      const h1 = heroSection.querySelector('h1')
      if (h1) {
        h1.innerHTML =
          '<span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">#1&nbsp;BOOKMARK</span>&nbsp;APP&nbsp;IN&nbsp;THE&nbsp;WORLD'
        h1.style.fontFamily = 'Saira, sans-serif'
        h1.style.fontWeight = '700'
      }

      const p = heroSection.querySelector('p')
      if (p) {
        p.textContent =
          'BookmarkAI fuses deep analytics, an AI co-pilot that auto-organizes your links, and a built-in task workspace — making it the most powerful bookmark app on the planet.'
      }

      // 3. Update hero badge text
      const badgeSpan = heroSection.querySelector('div > span.font-semibold')
      if (badgeSpan) {
        badgeSpan.textContent =
          'Analytics-Powered Insights • AI-Driven Organization • Task-Focused Workspace'
      }
    }

    // 4. Ensure CTA button (inside the hero form) reads JOIN BETA WAITLIST in all caps
    const heroFormBtnSpan = heroSection?.querySelector('form button span')
    if (
      heroFormBtnSpan &&
      heroFormBtnSpan.textContent?.trim() !== 'JOIN BETA WAITLIST'
    ) {
      heroFormBtnSpan.textContent = 'JOIN BETA WAITLIST'
    }
  }, [])

  const FontHead = () => (
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Saira:wght@700&display=swap"
        rel="stylesheet"
      />
    </Head>
  )

  return (
    <>
      <FontHead />
      <LandingPage />
    </>
  )
} 