import React from 'react'

const testimonialsHtml = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Saira:wght@700&display=swap');
html,body{height:100%;margin:0}
.scroll-container::-webkit-scrollbar{display:none}
.scroll-container{-ms-overflow-style:none;scrollbar-width:none}
@keyframes scroll-x{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes scroll-x-reverse{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
.auto-scroll{animation:scroll-x 32s linear infinite}
.auto-scroll-reverse{animation:scroll-x-reverse 36s linear infinite}
.mask-gradient{mask-image:linear-gradient(to right,transparent 0%,black 10%,black 90%,transparent 100%);-webkit-mask-image:linear-gradient(to right,transparent 0%,black 10%,black 90%,transparent 100%)}
.perspective{perspective:1200px}
.sari-title{font-family:'Saira',sans-serif;font-weight:700;text-transform:uppercase;}
/* outline text */
.outline-title{color:transparent;-webkit-text-stroke:2px #ffffff;}
/* blue outline text */
.blue-outline{color:transparent;-webkit-text-stroke:2px #3b82f6;}
/* subtle patterned background for testimonial cards */
.testimonial-card{background-image:linear-gradient(135deg,rgba(255,255,255,.03) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.03) 50%,rgba(255,255,255,.03) 75%,transparent 75%,transparent);background-size:8px 8px;}
/* blue-to-purple gradient text */
/* .gradient-text{...} */
</style>
<div class="bg-transparent py-20 px-4">
  <h2 class="text-center text-4xl md:text-5xl tracking-tight mb-16 sari-title outline-title" style="opacity:0.22;">BETA TESTER <span class="blue-outline">TESTIMONIAL</span></h2>

  <!-- Carousel Row 1 -->
  <div class="relative mb-12">
    <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-sky-950 to-transparent pointer-events-none"></div>
    <div class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-sky-950 to-transparent pointer-events-none"></div>
    <div class="overflow-hidden">
      <div class="scroll-container mask-gradient perspective">
        <div class="flex space-x-8 auto-scroll w-max">
          <!-- Card templates (5 unique cards duplicated) -->
          ${generateCards('sky-400')}
        </div>
      </div>
    </div>
  </div>

  <!-- Carousel Row 2 -->
  <div class="relative">
    <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-sky-950 to-transparent pointer-events-none"></div>
    <div class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-sky-950 to-transparent pointer-events-none"></div>
    <div class="overflow-hidden">
      <div class="scroll-container mask-gradient perspective">
        <div class="flex space-x-8 auto-scroll-reverse w-max">
          <!-- Another 5 cards duplicated -->
          ${generateCards('sky-300')}
        </div>
      </div>
    </div>
  </div>
</div>
`;

// helper to build 10 cards (5 unique duplicated)
function generateCards(border: string) {
  const people=[
    ['Olivia Park','@olivia_codes',`BookmarkAI's smart tagging halves my research time—no other tool groups sources so intuitively.`],
    ['Ethan Wright','@ethanw','The analytics dashboard showed exactly what links I actually read—Pocket never gave me that insight.'],
    ['Priya Singh','@priyas','Auto-folders filed 600 legacy links in minutes. BookmarkAI feels like having an organizing assistant on call.'],
    ['Lucas Moreno','@lucasdesigns','The lightning-fast visual search lets me jump between design assets instantly, and the Figma integration is icing on the cake.'],
    ['Zoey Lee','@zoexplores',`Tasks and bookmarks in one workspace mean zero Notion context-switches. I'm finally staying focused.`]
  ];
  const set=[...people,...people];
  return set.map((p,i)=>`<div class=\"flex-shrink-0 w-80 h-64 border-2 border-${border} rounded-2xl p-6 bg-sky-900/40 backdrop-blur testimonial-card\" style=\"transform:rotateY(${(i%5-2)*5}deg)\"><div class=\"flex items-center mb-4\"><div class=\"w-12 h-12 rounded-full mr-4 border-2 border-${border} flex items-center justify-center bg-${border}/20 text-${border} font-bold text-lg\">${p[0].charAt(0)}</div><div><h4 class=\"font-semibold\">${p[0]}</h4><p class=\"text-${border} text-sm\">${p[1]}</p></div></div><p class=\"text-sky-200 leading-relaxed\">&quot;${p[2]}&quot;</p></div>`).join('');
}

const TestimonialsSection: React.FC = () => (
  <div className="w-full" dangerouslySetInnerHTML={{ __html: testimonialsHtml }} />
);

export default TestimonialsSection 