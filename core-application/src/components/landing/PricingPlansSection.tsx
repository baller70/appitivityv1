import React, { useState } from 'react'

/**
 * PricingPlansSection
 * -------------------
 * Bottom-of-landing-page pricing table with four subscription tiers.
 * The markup is adapted directly from the user-supplied HTML snippet
 * and uses Tailwind utility classes. Extra effects (gradient text,
 * card hover, etc.) are provided via scoped styled-jsx so styles don't
 * leak globally.
 */
const plans = [
  {
    id: 'free',
    name: 'FREE',
    monthly: 0,
    yearly: 0,
    description: 'Core bookmarking tools for individuals getting started.',
    features: [
      'Unlimited Bookmarks',
      'Basic Folder Organization',
      'Browser Extensions',
      'Community Support',
    ],
    disabled: [],
  },
  {
    id: 'navigator',
    name: 'NAVIGATOR',
    monthly: 4.99,
    yearly: 49,
    description: 'Enhanced productivity features for everyday power users.',
    features: [
      'Everything in Free',
      'AI Tag Suggestions',
      'Full-text Search',
      'Cross-Device Sync',
    ],
    disabled: ['Usage Analytics Dashboard'],
  },
  {
    id: 'accelerator',
    name: 'ACCELERATOR',
    monthly: 9.99,
    yearly: 99,
    description: 'Advanced automation and insights to super-charge workflows.',
    features: [
      'Everything in Navigator',
      'Usage Analytics Dashboard',
      'Smart Collections',
      'Priority Support',
    ],
    disabled: ['Team Collaboration Spaces'],
  },
  {
    id: 'apex',
    name: 'APEX',
    monthly: 19.99,
    yearly: 199,
    description: 'All-in-one platform with collaboration and enterprise controls.',
    features: [
      'Everything in Accelerator',
      'Team Collaboration Spaces',
      'Admin Analytics',
      'Dedicated Success Manager',
    ],
    disabled: [],
  },
] as const

const PricingPlansSection: React.FC = () => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const formatPrice = (price: number) => (price === 0 ? 'FREE' : `$${price.toFixed(2)}`)

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto" style={{fontFamily:'Saira, sans-serif'}}>
      {/* Header */}
      <div className="text-center mb-16">
        <span className="px-3 py-1 text-sm text-blue-300 bg-blue-900/50 rounded-full font-medium">
          Pricing Plans
        </span>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-white uppercase">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">BOOKMARK AI</span>{' '}PRICING FOR BETTER WORKFLOW
        </h2>
        {/* Billing cycle toggle */}
        <div className="mt-6 flex justify-center items-center gap-3 text-sm font-medium select-none">
          <button
            className={`px-4 py-1 rounded-full transition bg-gray-700/60 ${billing==='monthly'?'text-white':'text-gray-400'}`}
            onClick={()=>setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-1 rounded-full transition bg-gray-700/60 ${billing==='yearly'?'text-white':'text-gray-400'}`}
            onClick={()=>setBilling('yearly')}
          >
            Yearly <span className="text-indigo-400">(save ~15%)</span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-4 gap-8 mt-12">
        {plans.map((plan, idx) => {
          const price = billing==='monthly'?plan.monthly:plan.yearly
          const isHighlight = plan.id==='accelerator'
          return (
            <div
              key={plan.id}
              className={`relative card-hover bg-gray-800/70 ${isHighlight?'border-2 border-blue-500 scale-105 z-10 shadow-xl':'border border-gray-700'} rounded-2xl overflow-hidden`}
            >
              {isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="p-8 ${isHighlight?'mt-4':''}">
                <h3 className="text-xl font-semibold text-white mb-4">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-semibold text-white">{formatPrice(price)}</span>
                  {price!==0 && (
                    <span className="text-gray-400 ml-2">/{billing==='monthly'?'month':'year'}</span>
                  )}
                </div>
                <p className="text-gray-300 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 text-sm">
                  {plan.features.map((feat)=> (
                    <li key={feat} className="flex items-start">
                      <svg className="w-5 h-5 mr-2 mt-0.5 check-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                  {plan.disabled.map((feat)=>(
                    <li key={feat} className="flex items-start text-gray-400">
                      <svg className="w-5 h-5 mr-2 mt-0.5 minus-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                {plan.id==='free' ? (
                  <div className="h-10" />
                ) : (
                  <a href="#" className={`block w-full py-3 px-4 text-center text-white rounded-lg font-medium transition ${isHighlight?'gradient-bg hover:opacity-90':'bg-blue-600 hover:bg-blue-700'}`}>Start Free Trial</a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Note */}
      <div className="mt-16 text-center">
        <p className="text-gray-400">
          Need a custom solution? Our AI consultants can build a tailored plan for your specific needs.
        </p>
        <a
          href="#"
          className="mt-4 inline-flex items-center text-blue-400 hover:text-blue-300"
        >
          <span>Learn more about our custom solutions</span>
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        .gradient-bg {
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
        }
        .check-icon {
          color: #10b981;
        }
        .minus-icon {
          color: #6b7280;
        }
      `}</style>
    </section>
  );
};

export default PricingPlansSection; 