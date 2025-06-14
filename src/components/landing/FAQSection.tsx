import React from 'react'

/**
 * FAQSection
 * ----------
 * Simple list of frequently-asked questions rendered beneath the
 * comparison-pricing table.  Uses the same dark palette and fine
 * hair-line borders as the other landing-page blocks.
 */
const faqs: [string, string][] = [
  [
    'What is Bookmark AI and how does it work?',
    'Bookmark AI is an intelligent bookmark manager that uses machine-learning to categorize links, surface forgotten gems, and make everything instantly searchable.',
  ],
  [
    'How does the AI decide which tags or folders to use?',
    'Our natural-language model analyses page content, title, and metadata to assign the most relevant tags and collections. You can always adjust or override its suggestions.',
  ],
  [
    'Is my data private and secure?',
    'Yes. All data is encrypted in transit and at rest. We never sell your information and you can delete your account (and data) at any time.',
  ],
  [
    'Can I import existing bookmarks from my browser or another service?',
    'Absolutely—upload an HTML export, connect your browser, or import from services like Pocket and Raindrop. Your structure is preserved, then enhanced by AI tagging.',
  ],
  [
    'Does Bookmark AI sync across devices?',
    'Yes. Your library stays in sync on web, iOS, Android, and our browser extensions in real time.',
  ],
  [
    'Which integrations are supported?',
    'We currently integrate with Chrome, Firefox, Edge, Safari, Notion, Obsidian, Slack, and Zapier—with more on the roadmap.',
  ],
  [
    'Can I collaborate or share collections with my team?',
    'Team workspaces let you share folders, assign permissions, and see who saved what—perfect for research groups or product teams.',
  ],
  [
    'How much does it cost? Is there a free plan?',
    'Our Free tier covers up to 500 bookmarks. Paid plans start at $4.99/month and unlock unlimited saves, advanced AI features, and team collaboration.',
  ],
  [
    'Can I export my data or cancel any time?',
    'Yes. Export to HTML or CSV whenever you like. Subscriptions are month-to-month—you can cancel with one click and retain access until your billing period ends.',
  ],
  [
    'Where do I get help if I run into issues?',
    'Browse our Help Center, chat with us in-app, or email support@bookmarkai.app. Paid plans include priority response within 24 hours.',
  ],
]

const FAQSection: React.FC = () => (
  <section className="py-24 px-4 bg-transparent" style={{fontFamily:'Saira, sans-serif'}}>
    <div className="max-w-3xl mx-auto">
      <h3 className="text-3xl md:text-4xl font-semibold mb-12 text-center" style={{fontFamily:'Saira, sans-serif'}}>Bookmark AI Frequently Asked Questions</h3>

      <div className="space-y-6">
        {faqs.map(([question, answer]) => (
          <div key={question} className="border-b border-gray-800 pb-6">
            <h4 className="text-lg font-normal mb-2" style={{fontFamily:'Saira, sans-serif'}}>{question}</h4>
            <p className="text-gray-400 font-extralight" style={{fontFamily:'Saira, sans-serif'}}>{answer}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default FAQSection 