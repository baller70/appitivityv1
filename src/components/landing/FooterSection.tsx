import React from 'react'

const html = `\
<footer class=\"relative overflow-hidden pt-28 pb-14 md:pb-20 text-white\">\
  <style>\
    :root {\
      --gradient-background-start: rgb(20,30,48);\
      --gradient-background-end: rgb(36,59,85);\
    }\
    footer * {\
      font-family: 'Saira', sans-serif;\
    }\
    /* subtle dotted pattern overlay */\
    footer::before {\
      content: "";\
      position: absolute;\
      inset: 0;\
      background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);\
      background-size: 80px 80px;\
      pointer-events: none;\
      z-index: 0;\
    }\
    /* soft horizontal glow separator */\
    footer::after {\
      content: "";\
      position: absolute;\
      left: 0;\
      right: 0;\
      top: 0;\
      height: 1px;\
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);\
    }\
    /* radial blur accent */\
    .footer-blur {\
      position: absolute;\
      right: -200px;\
      top: -80px;\
      width: 600px;\
      height: 600px;\
      pointer-events: none;\
      background: radial-gradient(circle at center, rgba(99,102,241,0.25), rgba(139,92,246,0.05) 70%, transparent 80%);\
      filter: blur(90px);\
      z-index: 0;\
    }\
    /* nav link hover polish */\
    footer a:hover {\
      color: #ffffff;\
    }\
  </style>\
  <div class=\"absolute top-0 left-0 w-full h-full overflow-hidden z-0\">\
    <div class=\"absolute top-0 left-[10%] w-64 h-64 rounded-full bg-blue-500/5 blur-3xl\"></div>\
    <div class=\"absolute bottom-0 right-[15%] w-80 h-80 rounded-full bg-purple-500/5 blur-3xl\"></div>\
  </div>\
  <div class=\"footer-blur\"></div>\
  <div class=\"container mx-auto px-4 relative z-10\">\
    <div class=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-20 mb-20\">\
      <!-- Company Info -->\
      <div class=\"lg:col-span-2\">\
        <div class=\"mb-6\">\
          <a href=\"#\" class=\"flex items-center\">\
            <div class=\"h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl\">B</div>\
            <span class=\"ml-3 text-xl font-bold text-white\" style=\"font-family:'Saira',sans-serif\">BookmarkAI</span>\
          </a>\
        </div>\
        <p class=\"text-white/70 mb-6 max-w-md text-base\" style=\"font-family:'Saira',sans-serif\">\
          BookmarkAI saves, auto-categorizes, and resurfaces your web content with smart collections, full-text search, usage analytics, and team collaboration—so you can find the right link in seconds.\
        </p>\
        <div class=\"flex space-x-4\">\
          <a href=\"#\" class=\"h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/30 hover:scale-105 transition transform duration-200\">\
            <!-- Facebook icon -->\
            <svg class=\"h-5 w-5\" fill=\"currentColor\" viewBox=\"0 0 24 24\" aria-hidden=\"true\">\
              <path d=\"M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z\" clip-rule=\"evenodd\" fill-rule=\"evenodd\"/>\
            </svg>\
          </a>\
          <a href=\"#\" class=\"h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/30 hover:scale-105 transition transform duration-200\">\
            <!-- Twitter icon -->\
            <svg class=\"h-5 w-5\" fill=\"currentColor\" viewBox=\"0 0 24 24\" aria-hidden=\"true\">\
              <path d=\"M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477 4.072 4.072 0 01-1.873-.518v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85 8.233 8.233 0 01-5.096 1.757A8.368 8.368 0 012 18.407a11.616 11.616 0 006.29 1.84\"/>\
            </svg>\
          </a>\
          <a href=\"#\" class=\"h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/30 hover:scale-105 transition transform duration-200\">\
            <!-- LinkedIn icon -->\
            <svg class=\"h-5 w-5\" fill=\"currentColor\" viewBox=\"0 0 24 24\" aria-hidden=\"true\">\
              <path d=\"M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.3c-1 0-1.7-.8-1.7-1.8s.7-1.8 1.7-1.8 1.7.8 1.7 1.8-.7 1.8-1.7 1.8zm13.5 11.3h-3v-5.6c0-1.3-.5-2.2-1.6-2.2-.9 0-1.4.6-1.7 1.2-.1.3-.1.8-.1 1.3v5.3h-3v-10h3v1.4c.4-.6 1-1.4 2.6-1.4 1.9 0 3.3 1.3 3.3 4.1v5.9z\"/>\
            </svg>\
          </a>\
        </div>\
      </div>\

      <!-- Product Links -->\
      <div>\
        <h4 class=\"text-white font-semibold mb-6 uppercase text-xl tracking-wide\">PRODUCT</h4>\
        <ul class=\"space-y-2 text-white/70 text-base\">\
          <li><a href=\"#features\" class=\"hover:text-white transition-colors\">Features</a></li>\
          <li><a href=\"#integrations\" class=\"hover:text-white transition-colors\">Integrations</a></li>\
          <li><a href=\"#pricing\" class=\"hover:text-white transition-colors\">Pricing</a></li>\
          <li><a href=\"#changelog\" class=\"hover:text-white transition-colors\">Changelog</a></li>\
        </ul>\
      </div>\

      <!-- Company Links -->\
      <div>\
        <h4 class=\"text-white font-semibold mb-6 uppercase text-xl tracking-wide\">COMPANY</h4>\
        <ul class=\"space-y-2 text-white/70 text-base\">\
          <li><a href=\"#about\" class=\"hover:text-white transition-colors\">About Us</a></li>\
          <li><a href=\"#blog\" class=\"hover:text-white transition-colors\">Blog</a></li>\
          <li><a href=\"#careers\" class=\"hover:text-white transition-colors\">Careers</a></li>\
          <li><a href=\"#contact\" class=\"hover:text-white transition-colors\">Press</a></li>\
        </ul>\
      </div>\

      <!-- Resources Links -->\
      <div>\
        <h4 class=\"text-white font-semibold mb-6 uppercase text-xl tracking-wide\">RESOURCES</h4>\
        <ul class=\"space-y-2 text-white/70 text-base\">\
          <li><a href=\"#docs\" class=\"hover:text-white transition-colors\">Documentation</a></li>\
          <li><a href=\"#help\" class=\"hover:text-white transition-colors\">Help Center</a></li>\
          <li><a href=\"#community\" class=\"hover:text-white transition-colors\">Community</a></li>\
          <li><a href=\"#partners\" class=\"hover:text-white transition-colors\">Partners</a></li>\
        </ul>\
      </div>\
    </div>\

    <div class=\"mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/50 border-t border-white/10 border-opacity-5\">\
      <p style=\"font-family:'Saira',sans-serif\">&copy; <span id=\"fs-year\"></span> BookmarkAI. All rights reserved.</p>\
      <div class=\"flex gap-6 mt-6 md:mt-0\">\
        <a href=\"#\" class=\"hover:text-white transition-colors\">Terms</a>\
        <a href=\"#\" class=\"hover:text-white transition-colors\">Privacy</a>\
        <a href=\"#\" class=\"hover:text-white transition-colors\">Contact</a>\
      </div>\
    </div>\
  </div>\
</footer>`

const FooterSection: React.FC = () => <div dangerouslySetInnerHTML={{ __html: html }} />

export default FooterSection 