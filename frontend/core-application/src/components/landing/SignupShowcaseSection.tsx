import React, { useEffect } from 'react'

const html = `\
<section class=\"relative w-full overflow-hidden bg-gray-950 py-20 px-4 min-h-[700px]\">\
  <canvas id=\"visualizer\" class=\"absolute inset-0 w-full h-full\"></canvas>\
  <div class=\"relative z-10 flex items-center justify-center\">\
    <div class=\"w-full relative max-w-4xl\">\
      <div class=\"relative card-border overflow-hidden rounded-2xl flex flex-col md:flex-row animate-float\">\
        <!-- Left Side - Visual/Branding -->\
        <div class=\"md:w-1/2 w-full flex flex-col justify-center items-center relative p-8\">\
          <!-- Animated Visual Wrapper -->\
          <div class=\"w-full h-64 rounded-xl gradient-border inner-glow overflow-hidden relative mb-6\">\
            <!-- Animated grid background -->\
            <div class=\"absolute inset-0 opacity-10\">\
              <div class=\"w-full h-full animate-pulse\" style=\"background-image:linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px);background-size:20px 20px;\"></div>\
            </div>\
            <!-- Connection lines -->\
            <svg class=\"absolute inset-0 w-full h-full pointer-events-none\" viewBox=\"0 0 400 250\">\
              <defs>\
                <linearGradient id=\"connectionGradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\
                  <stop offset=\"0%\" style=\"stop-color:#4f46e5;stop-opacity:0.8\"></stop>\
                  <stop offset=\"50%\" style=\"stop-color:#3b82f6;stop-opacity:1\"></stop>\
                  <stop offset=\"100%\" style=\"stop-color:#8b5cf6;stop-opacity:0.8\"></stop>\
                </linearGradient>\
              </defs>\
              <g stroke=\"url(#connectionGradient)\" stroke-width=\"2\" fill=\"none\">\
                <path class=\"connector\" d=\"M200,125 L120,80 M200,125 L280,80 M200,125 L120,170 M200,125 L280,170\"></path>\
                <circle cx=\"200\" cy=\"125\" r=\"4\" fill=\"#3b82f6\"></circle>\
                <circle cx=\"120\" cy=\"80\" r=\"3\" fill=\"#4f46e5\"></circle>\
                <circle cx=\"280\" cy=\"80\" r=\"3\" fill=\"#8b5cf6\"></circle>\
                <circle cx=\"120\" cy=\"170\" r=\"3\" fill=\"#f59e0b\"></circle>\
                <circle cx=\"280\" cy=\"170\" r=\"3\" fill=\"#ef4444\"></circle>\
              </g>\
            </svg>\
            <!-- Floating feature icons (empty icons for now) -->\
            <div class=\"absolute top-8 left-8 icon-float\">\
              <div class=\"w-12 h-12 glass rounded-xl flex items-center justify-center border border-indigo-400/30 inner-glow\"></div>\
            </div>\
            <div class=\"absolute top-8 right-8 icon-float\">\
              <div class=\"w-12 h-12 glass rounded-xl flex items-center justify-center border border-purple-400/30 inner-glow\"></div>\
            </div>\
            <div class=\"absolute bottom-8 left-8 icon-float\">\
              <div class=\"w-12 h-12 glass rounded-xl flex items-center justify-center border border-orange-400/30 inner-glow\"></div>\
            </div>\
            <div class=\"absolute bottom-8 right-8 icon-float\">\
              <div class=\"w-12 h-12 glass rounded-xl flex items-center justify-center border border-blue-400/30 inner-glow\"></div>\
            </div>\
            <!-- Central logo -->\
            <div class=\"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-schema-pulse\">\
              <div class=\"w-16 h-16 glass flex items-center justify-center inner-glow border-blue-400/50 border rounded-2xl relative\">\
                <div class=\"text-2xl font-bold text-white\">S</div>\
              </div>\
            </div>\
          </div>\
          <!-- Brand text -->\
          <div class=\"text-center\">\
            <h2 class=\"text-3xl font-semibold text-white tracking-tight mb-2\" style=\"font-family:'Saira',sans-serif\">JOIN OUR PLATFORM</h2>\
            <p class=\"text-white/70 text-sm\" style=\"font-family:'Saira',sans-serif\">Connect with powerful tools and features designed for modern workflows.</p>\
          </div>\
        </div>\
        <!-- Vertical divider -->\
        <div class=\"w-px bg-gradient-to-b from-transparent via-white/30 to-transparent hidden md:block\"></div>\
        <!-- Right Side - Form -->\
        <div class=\"md:w-1/2 w-full p-8 flex flex-col justify-center\">\
          <div class=\"max-w-sm mx-auto w-full\">\
            <span class=\"inline-block px-3 py-1 glass text-indigo-300 rounded-full text-xs font-medium mb-6 border border-indigo-400/30\">Get Started</span>\
            <h3 class=\"text-xl font-medium text-white mb-6\" style=\"font-family:'Saira',sans-serif\">CREATE AN ACCOUNT</h3>\
            <form class=\"space-y-4\">\
              <div>\
                <label class=\"block text-sm font-medium text-white/80 mb-2\" style=\"font-family:'Saira',sans-serif\">Full Name</label>\
                <input type=\"text\" class=\"w-full px-4 py-3 glass rounded-lg border border-white/20 text-white placeholder-white/50 focus:border-indigo-400 focus:outline-none transition\" placeholder=\"Enter your name\">\
              </div>\
              <div>\
                <label class=\"block text-sm font-medium text-white/80 mb-2\" style=\"font-family:'Saira',sans-serif\">Email</label>\
                <input type=\"email\" class=\"w-full px-4 py-3 glass rounded-lg border border-white/20 text-white placeholder-white/50 focus:border-indigo-400 focus:outline-none transition\" placeholder=\"you@example.com\">\
              </div>\
              <div>\
                <label class=\"block text-sm font-medium text-white/80 mb-2\" style=\"font-family:'Saira',sans-serif\">Password</label>\
                <input type=\"password\" class=\"w-full px-4 py-3 glass rounded-lg border border-white/20 text-white placeholder-white/50 focus:border-indigo-400 focus:outline-none transition\" placeholder=\"Create password\">\
              </div>\
              <button type=\"submit\" class=\"w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition duration-200 transform hover:scale-[1.02] shadow-lg\" style=\"font-family:'Saira',sans-serif\">GET STARTED</button>\
            </form>\
            <div class=\"mt-6 text-center\">\
              <p class=\"text-white/60 text-sm\">Already have an account? <a href=\"#\" class=\"text-indigo-400 hover:text-indigo-300 transition\">Sign in</a></p>\
            </div>\
          </div>\
        </div>\
      </div>\
    </div>\
  </div>\
</section>`

// Global CSS required by the design
const styles = `
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .connector {
    stroke-dasharray: 8;
    animation: dataStream 2s linear infinite;
  }
  .icon-float {
    animation: float 4s ease-in-out infinite;
  }
  .icon-float:nth-child(2) { animation-delay: -1s; }
  .icon-float:nth-child(3) { animation-delay: -2s; }
  .icon-float:nth-child(4) { animation-delay: -3s; }
  .gradient-border {
    position: relative;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  }
  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    background: linear-gradient(135deg, #4f46e5, #3b82f6, #8b5cf6, #f59e0b);
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
  }
  .inner-glow {
    box-shadow: inset 0 0 20px rgba(79, 70, 229, 0.3), inset 0 0 40px rgba(59, 130, 246, 0.2), 0 0 30px rgba(139, 92, 246, 0.4);
  }
  .card-border {
    background: rgba(79, 70, 229, 0.08);
    border: 1px solid rgba(79, 70, 229, 0.3);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.3), inset 0 0 30px rgba(79, 70, 229, 0.1), inset 0 0 60px rgba(59, 130, 246, 0.05), 0 0 50px rgba(139, 92, 246, 0.2);
  }
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes dataStream {
    0% { stroke-dashoffset: 20; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes schemaPulse {
    0%,100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.02); opacity: 1; }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-schema-pulse { animation: schemaPulse 4s ease-in-out infinite; }
`;

const SignupShowcaseSection: React.FC = () => {
  useEffect(() => {
    const canvas = document.getElementById('visualizer') as HTMLCanvasElement | null
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let time = 0
    const waveData = Array(8)
      .fill(0)
      .map(() => ({ value: Math.random() * 0.5 + 0.1, targetValue: Math.random() * 0.5 + 0.1, speed: Math.random() * 0.02 + 0.01 }))

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    const update = () => {
      waveData.forEach((d) => {
        if (Math.random() < 0.01) d.targetValue = Math.random() * 0.7 + 0.1
        d.value += (d.targetValue - d.value) * d.speed
      })
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      waveData.forEach((d, i) => {
        const freq = d.value * 7.0
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x++) {
          const nx = (x / canvas.width) * 2 - 1
          const px = nx + i * 0.04 + freq * 0.03
          const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / 8)
          const y = (py + 1) * canvas.height * 0.5
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        const intensity = Math.min(1, freq * 0.3)
        const r = 79 + intensity * 100
        const g = 70 + intensity * 130
        const b = 229
        ctx.lineWidth = 2 + i * 0.5
        ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`
        ctx.shadowBlur = 5
        ctx.stroke()
        ctx.shadowBlur = 0
      })
    }
    const animate = () => {
      time += 0.02
      update()
      draw()
      requestAnimationFrame(animate)
    }
    window.addEventListener('resize', resize)
    resize()
    animate()
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <>
      <style jsx global>{styles}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}

export default SignupShowcaseSection 