import React from 'react'

const Logo: React.FC = () => (
  <a
    href="#"
    className="flex items-center gap-2 text-white font-bold text-xl lg:text-2xl tracking-tight hover:text-brand-400 transition-colors duration-300"
  >
    {/* Gradient circular icon */}
    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-white"
      >
        <path d="M4 4h12a4 4 0 0 1 0 8H4z" />
        <path d="M4 12h12a4 4 0 0 1 0 8H4z" />
      </svg>
    </span>
    <span className="font-satoshi">BookmarkAI</span>
  </a>
)

export default Logo 