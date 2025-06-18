import React from 'react'

/**
 * ComparisonPricingTableSection
 * -----------------------------
 * Large feature-comparison table (Choose your plan) inserted beneath the
 * existing pricing cards. The original snippet had 3 plan columns; we
 * duplicated the last column so there are now 4 plans (Free, Pro,
 * Business, Enterprise). All custom colours are preserved via Tailwind
 * classes and scoped styled-jsx.
 */
const ComparisonPricingTableSection: React.FC = () => {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto" style={{fontFamily:'Saira, sans-serif'}}>
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-4 inline-block bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text uppercase tracking-tight">
          BOOKMARK AI COMPARISON CHART
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-base">
          Below is a side-by-side breakdown of every feature included in our Free, Navigator, Accelerator, and Apex plans so you can pick the workflow booster that fits you best.
        </p>
      </div>

      {/* Comparison grid */}
      <div className="grid grid-cols-5 rounded-xl overflow-hidden border border-gray-800 shadow-xl text-base">
        {/* Header row with icon placeholder */}
        <div className="p-6 border-b border-gray-800 bg-[#12121a] flex items-center">
          {/* Core features icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-indigo-400"
          >
            <path d="M12 2a1 1 0 01.894.553l2.618 5.302 5.858.852a1 1 0 01.554 1.706l-4.237 4.13.999 5.835a1 1 0 01-1.451 1.054L12 18.77l-5.235 2.762a1 1 0 01-1.451-1.054l.999-5.835L2.076 10.413a1 1 0 01.554-1.706l5.858-.852L11.106 2.553A1 1 0 0112 2z" />
          </svg>
        </div>
        {/* Plan headers */}
        <div className="p-6 border-b border-gray-800 text-left bg-[#12121a] ring-1 ring-gray-700 transition-all duration-200 hover:bg-[#15151f]">
          <div className="text-xl font-extrabold">FREE</div>
          <div className="mt-2 text-3xl font-extrabold">$0</div>
          <div className="mt-1 text-gray-400 text-xs">Forever</div>
        </div>
        <div className="p-6 border-b border-gray-800 text-left bg-[#14142a] ring-1 ring-gray-700 relative transition-all duration-200 hover:bg-[#17173a]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="text-xl font-extrabold">NAVIGATOR</div>
          <div className="mt-2 text-3xl font-extrabold">$4.99</div>
          <div className="mt-1 text-gray-400 text-xs">per user / month</div>
          <div className="mt-2 inline-block rounded-full bg-indigo-900/50 px-2.5 py-0.5 text-[10px] text-indigo-300 ring-1 ring-indigo-700">
            Popular
          </div>
        </div>
        <div className="p-6 border-b border-gray-800 text-left bg-[#12121a] ring-1 ring-gray-700 transition-all duration-200 hover:bg-[#15151f]">
          <div className="text-xl font-extrabold">ACCELERATOR</div>
          <div className="mt-2 text-3xl font-extrabold">$9.99</div>
          <div className="mt-1 text-gray-400 text-xs">per user / month</div>
        </div>
        <div className="p-6 border-b border-gray-800 text-left bg-[#12121a] ring-1 ring-gray-700 transition-all duration-200 hover:bg-[#15151f]">
          <div className="text-xl font-extrabold">APEX</div>
          <div className="mt-2 text-3xl font-extrabold">$19.99</div>
          <div className="mt-1 text-gray-400 text-xs">per user / month</div>
        </div>

        {/* --- CORE FEATURES LABEL ROW --- */}
        {['Core Features', '', '', '', ''].map((txt, i) => (
          <div
            key={`core-${i}`}
            className={`p-6 border-b border-gray-800 ${i === 0 ? 'bg-[#0f0f14]' : i === 2 ? 'bg-[#10102a]' : 'bg-[#0f0f14]'}`}
          >
            {i === 0 && (
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {txt}
              </span>
            )}
          </div>
        ))}

        {/* Batch render each feature row value set */}
        {[
          ['Team members', 'Up to 1', 'Up to 3', 'Up to 10', 'Unlimited'],
          ['Bookmarks per user', '1,000', '10,000', 'Unlimited', 'Unlimited'],
          ['Projects / Collections', '5', 'Unlimited', 'Unlimited', 'Unlimited'],
          ['Storage for Snapshots', '500&nbsp;MB', '2&nbsp;GB', '20&nbsp;GB', 'Unlimited'],
          ['History & Activity Log', '7 days', '30 days', '1 year', 'Unlimited'],
        ].map((row) =>
          row.map((cell, idx) => (
            <div
              key={row[0] + idx}
              className={`p-5 pl-6 border-b border-gray-800 flex items-center text-left text-gray-300 text-base ${
                idx === 3 ? 'bg-[#10102a]' : ''
              } ${idx === 0 ? 'justify-start font-medium whitespace-nowrap' : 'justify-center'}`}
              dangerouslySetInnerHTML={{ __html: cell }}
            />
          )),
        )}

        {/* Advanced Features heading row */}
        {['Advanced Features', '', '', '', ''].map((txt, i) => (
          <div
            key={`adv-${i}`}
            className={`p-6 pl-6 border-b border-gray-800 text-left ${i === 0 ? 'bg-[#0f0f14]' : i === 2 ? 'bg-[#10102a]' : 'bg-[#0f0f14]'}`}
          >
            {i === 0 && (
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {txt}
              </span>
            )}
          </div>
        ))}

        {/* Tick / minus svg helper inline */}
        {[
          ['AI Tag Suggestions', false, true, true, true],
          ['Full-Text Search', true, true, true, true],
          ['Usage Analytics Dashboard', false, false, true, true],
          ['Smart Collections', false, true, true, true],
          ['Team Collaboration Spaces', false, false, true, true],
          ['Priority Support', false, false, true, true],
          ['Admin Analytics', false, false, false, true],
          ['Dedicated Success Manager', false, false, false, true],
          ['API Access', false, true, true, true],
        ].flatMap((row, rowIdx) =>
          row.slice(0, 5).map((cell, idx) => (
            <div
              key={`advcell-${rowIdx}-${idx}`}
              className={`p-5 pl-6 border-b border-gray-800 flex items-center ${
                idx === 3 ? 'bg-[#10102a]' : ''
              } ${idx === 0 ? 'justify-start text-left' : 'justify-center'}`}
            >
              {idx === 0 ? (
                <span className="text-base font-medium whitespace-nowrap">{cell as string}</span>
              ) : typeof cell === 'boolean' ? (
                cell ? (
                  /* outline thumbs-up icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-indigo-400"
                  >
                    <path d="M14 9V5a3 3 0 00-3-3l-1 5-4 .5a2 2 0 00-2 2v5a2 2 0 002 2h8.28a2 2 0 001.98-1.735l.72-6A2 2 0 0016 8h-2z" />
                    <path d="M3 9h2v10H3z" />
                  </svg>
                ) : (
                  /* minus icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                )
              ) : (
                <span className="text-gray-300 text-base" dangerouslySetInnerHTML={{ __html: cell as string }} />
              )}
            </div>
          )),
        )}

        {/* Footer buttons */}
        <div className="p-6" />
        {['GET STARTED', 'FREE 7 DAY TRIAL', 'FREE 7 DAY TRIAL', 'FREE 7 DAY TRIAL'].map(
          (label, i) => (
            <div
              key={`btn-${label}-${i}`}
              className={`p-6 flex justify-center ${i === 2 ? 'bg-[#10102a]' : ''}`}
            >
              <button
                className={`w-full py-3 px-4 rounded-md text-sm md:text-base font-semibold transition-all duration-200 transform hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  i === 0
                    ? 'border border-gray-700 hover:ring-2 hover:ring-indigo-500/60 hover:shadow-[0_0_8px_rgba(99,102,241,0.6)] focus:ring-indigo-500'
                    : i === 1
                    ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_0_8px_rgba(99,102,241,0.8)] focus:ring-indigo-500'
                    : i === 2
                    ? 'border border-gray-700 hover:ring-2 hover:ring-purple-500/60 hover:shadow-[0_0_8px_rgba(147,51,234,0.6)] focus:ring-purple-500'
                    : 'border border-gray-700 hover:ring-2 hover:ring-pink-500/60 hover:shadow-[0_0_8px_rgba(236,72,153,0.6)] focus:ring-pink-500'
                }`}
              >
                {label}
              </button>
            </div>
          ),
        )}
      </div>

      <p className="mt-10 text-center text-gray-500 text-xs">
        All plans include our standard security features and 99.9% uptime SLA.
        <a
          href="#"
          className="text-indigo-400 hover:text-indigo-300 ml-1 transition-colors"
        >
          Learn more
        </a>
      </p>

      {/* Scoped extra tweaks */}
      <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(6px);
        }
      `}</style>
    </section>
  )
}

export default ComparisonPricingTableSection 