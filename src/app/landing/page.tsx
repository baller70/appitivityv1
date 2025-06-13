'use client'

import React, { useEffect, useRef } from 'react'
import {
  Layers,
  Building2,
  CreditCard,
  FileText,
  LogIn,
  PlayCircle,
  TrendingUp,
  ShieldCheck,
  Globe,
  Clock,
  Mail,
  ArrowRight,
  Check,
  Calendar,
  Users,
  Hash,
  CheckCircle2,
  Bell,
  MessageCircle,
  Zap,
  GitBranch,
  CheckCircle,
  Figma,
} from 'lucide-react'

const LucideIcon = ({ name, className }: { name: string; className: string }) => {
  const Icon = {
    layers: Layers,
    'building-2': Building2,
    'credit-card': CreditCard,
    'file-text': FileText,
    'log-in': LogIn,
    'play-circle': PlayCircle,
    'trending-up': TrendingUp,
    'shield-check': ShieldCheck,
    globe: Globe,
    clock: Clock,
    mail: Mail,
    'arrow-right': ArrowRight,
    check: Check,
    calendar: Calendar,
    users: Users,
    hash: Hash,
    'check-circle-2': CheckCircle2,
    bell: Bell,
    'message-circle': MessageCircle,
    zap: Zap,
    'git-branch': GitBranch,
    'check-circle': CheckCircle,
    figma: Figma,
  }[name]

  return Icon ? <Icon className={className} /> : null
}

const LandingPage = () => {
  useEffect(() => {
    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll('[class*="animate-"]')
    animatedElements.forEach((el) => {
        // We are giving the elements their opacity back, so the observer can work
        const elStyle = (el as HTMLElement).style;
        elStyle.opacity = '1';
        observer.observe(el)
    })

    // Enhanced card interactions
    const cards = document.querySelectorAll('.hover-lift')
    cards.forEach((card) => {
      card.addEventListener('mouseenter', function () {
        const elStyle = (card as HTMLElement).style;
        elStyle.zIndex = '50'
      })
      card.addEventListener('mouseleave', function () {
        const elStyle = (card as HTMLElement).style;
        elStyle.zIndex = 'auto'
      })
    })

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col font-inter bg-gray-950 text-white antialiased overflow-x-hidden">
      {/* Header */}
      <header className="animate-fade-in-down animate-delay-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 py-4 lg:py-6 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="lg:text-2xl text-xl font-bold text-white tracking-tight font-satoshi hover:text-brand-400 transition-colors duration-300"
          >
            FlowSync
          </a>
        </div>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
          <a
            href="#features"
            className="hover:text-brand-400 text-gray-400 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:bg-gray-800/30 px-3 py-2 rounded-lg"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden lg:inline">Integrations</span>
          </a>
          <a
            href="#enterprise"
            className="hover:text-brand-400 text-gray-400 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:bg-gray-800/30 px-3 py-2 rounded-lg"
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden lg:inline">Enterprise</span>
          </a>
          <a
            href="#pricing"
            className="hover:text-brand-400 text-gray-400 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:bg-gray-800/30 px-3 py-2 rounded-lg"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden lg:inline">Pricing</span>
          </a>
          <a
            href="#docs"
            className="hover:text-brand-400 text-gray-400 transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:bg-gray-800/30 px-3 py-2 rounded-lg"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">API Docs</span>
          </a>
        </nav>

        <div className="flex items-center gap-2 lg:gap-4">
          <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all duration-300 px-3 py-2 rounded-lg hover:bg-gray-800/50 hover:scale-105">
            <LogIn className="w-4 h-4" />
            Sign in
          </button>
          <button className="flex items-center gap-2 text-xs lg:text-sm font-semibold px-3 lg:px-5 py-2 lg:py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-brand-500/50 hover:scale-105 hover:-translate-y-1">
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Start Free Trial</span>
            <span className="sm:hidden">Try Free</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:py-24">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/20 via-transparent to-transparent"></div>
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse"
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-in-up animate-delay-200 inline-flex items-center gap-2 px-4 py-2 bg-brand-900/50 border border-brand-800/50 text-brand-300 rounded-full text-sm font-medium mb-8 backdrop-blur-sm hover:bg-brand-900/70 hover:border-brand-700/70 transition-all duration-300 hover:scale-105">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">
              Trusted by 125,000+ teams at
            </span>
            <span className="sm:hidden">Used by 125k+ teams</span>
            <span className="font-semibold">Microsoft, Spotify, Stripe</span>
          </div>

          {/* Headline */}
          <h1 className="animate-blur-in animate-delay-300 max-w-5xl mx-auto text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight font-satoshi text-white leading-tight lg:leading-[1.1]">
            Connect everything.
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all duration-500">
              Automate anything.
            </span>
            <br className="hidden sm:block" />
            <span className="text-gray-300">Ship faster.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up animate-delay-400 mx-auto mt-6 lg:mt-8 max-w-3xl text-base leading-relaxed text-gray-300">
            FlowSync Pro unifies Slack, Notion, GitHub, Figma, Linear, and 300+
            tools with intelligent automation.{' '}
            <span className="text-white font-medium hover:text-brand-400 transition-colors duration-300 cursor-default">
              Reduce context switching by 78%
            </span>{' '}
            and ship products 3x faster.
          </p>

          {/* Stats */}
          <div className="animate-fade-in-up animate-delay-500 flex flex-wrap items-center justify-center gap-4 lg:gap-8 mt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2 hover:text-green-400 transition-all duration-300 hover:scale-110">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2 hover:text-blue-400 transition-all duration-300 hover:scale-110">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>99.9% uptime SLA</span>
            </div>
            <div className="flex items-center gap-2 hover:text-purple-400 transition-all duration-300 hover:scale-110">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>5-min setup</span>
            </div>
          </div>

          {/* CTA Form */}
          <div className="animate-slide-up animate-delay-600 mx-auto mt-10 lg:mt-12 max-w-md lg:max-w-2xl">
            <form className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <div className="flex-1 relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10 pointer-events-none group-focus-within:text-brand-400 transition-colors duration-300" />
                <input
                  type="email"
                  required
                  placeholder="emma.chen@techcorp.com"
                  className="w-full lg:py-4 lg:text-base focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none placeholder-gray-500 transition-all duration-300 text-sm text-white bg-gray-800/50 border-gray-700/50 border rounded-xl pt-3 pr-4 pb-3 pl-12 backdrop-blur-sm relative z-0 hover:bg-gray-800/70 hover:border-gray-600/50 focus:scale-105"
                />
              </div>
              <button
                type="submit"
                className="flex gap-2 lg:px-8 lg:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/25 lg:text-base group text-sm font-semibold text-white rounded-xl pt-3 pr-6 pb-3 pl-6 items-center justify-center hover:scale-105 hover:-translate-y-1"
              >
                <span>Get Free Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>
            <p className="mt-4 text-xs lg:text-sm text-gray-500 flex flex-wrap items-center justify-center gap-4">
              <span className="flex items-center gap-1 hover:text-green-400 transition-colors duration-300">
                <Check className="w-3 h-3 text-green-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1 hover:text-blue-400 transition-colors duration-300">
                <Calendar className="w-3 h-3 text-blue-400" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1 hover:text-purple-400 transition-colors duration-300">
                <Users className="w-3 h-3 text-purple-400" />
                Free for teams under 10
              </span>
            </p>
          </div>

          {/* Interactive Demo Cards */}
          <div className="mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
            {/* Slack Integration Card */}
            <div className="animate-fade-in-left animate-delay-700 group hover-lift hover:border-green-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 text-left border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm bg-gray-900/30 hover:bg-gray-900/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors duration-300">
                      Slack
                    </h3>
                    <p className="text-xs text-gray-400">#product-updates</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">
                    Live
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 bg-gray-700/20 border border-gray-800 rounded-lg p-3 hover:bg-gray-700/30 hover:border-gray-700 transition-all duration-300">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">M</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">
                      Marcus Rivera
                    </p>
                    <p className="text-sm text-gray-300">
                      🚀 Product v2.1 deployed successfully!
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>2 min ago</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        <span>CI/CD Pipeline</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <span className="flex items-center gap-1 hover:text-green-400 transition-colors duration-300">
                    <Users className="w-3 h-3" />
                    <span>47 online</span>
                  </span>
                  <span className="flex items-center gap-1 hover:text-green-400 transition-colors duration-300">
                    <Bell className="w-3 h-3" />
                    <span>3 mentions</span>
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2.5 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 hover:border-green-500/60 text-green-400 text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                <MessageCircle className="w-4 h-4" />
                Reply in Thread
              </button>
            </div>

            {/* Analytics/ROI Card */}
            <div className="animate-slide-up animate-delay-800 border-brand-500/30 hover:border-brand-500/60 hover-lift hover:shadow-2xl hover:shadow-brand-500/30 transition-all duration-500 text-center bg-gradient-to-t from-indigo-500/20 to-purple-600/10 hover:from-indigo-500/30 hover:to-purple-600/20 border rounded-2xl p-6 backdrop-blur-sm group">
              <div className="flex gap-2 mb-6 items-center justify-start">
                <div className="w-10 h-10 flex bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors duration-300">
                    Productivity Impact
                  </h3>
                  <p className="text-xs text-gray-400">Last 30 days</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-4xl lg:text-5xl font-bold font-satoshi text-white mb-1 group-hover:text-brand-400 transition-colors duration-500">
                    92%
                  </div>
                  <p className="text-sm text-gray-300">
                    Time saved on manual tasks
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all duration-300 hover:scale-105">
                    <div className="text-xl font-bold text-green-400">
                      +31h
                    </div>
                    <p className="text-xs text-gray-400">Weekly savings</p>
                  </div>
                  <div className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all duration-300 hover:scale-105">
                    <div className="text-xl font-bold text-blue-400">
                      -67%
                    </div>
                    <p className="text-xs text-gray-400">Context switches</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1 hover:text-yellow-400 transition-colors duration-300">
                    <Clock className="w-3 h-3 text-yellow-400" />
                    Real-time tracking
                  </span>
                  <span className="flex items-center gap-1 hover:text-red-400 transition-colors duration-300">
                    <Zap className="w-3 h-3 text-red-400" />
                    Goal: 95%
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-Tool Integration (now with green color scheme) */}
            <div className="animate-fade-in-right animate-delay-700 relative overflow-hidden hover-lift hover:border-green-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm bg-gray-900/30 hover:bg-gray-900/50 group">
              <div className="flex items-center justify-between mb-6 relative z-40">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors duration-300">
                    Unified Workspace
                  </h3>
                  <p className="text-xs text-gray-400">6 tools connected</p>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-green-400 group-hover:animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">
                    Auto-sync
                  </span>
                </div>
              </div>

              {/* Notion Card */}
              <div className="absolute top-16 left-4 w-5/6 z-10 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg p-4 shadow-lg rotate-[-4deg] transition-all duration-300 hover:rotate-[-2deg] hover:scale-105">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Notion</span>
                </div>
                <p className="text-sm font-medium text-white mb-1">
                  Sprint Planning Template
                </p>
                <p className="text-xs text-gray-400">
                  Updated from Linear issues
                </p>
              </div>

              {/* GitHub Card */}
              <div className="absolute top-20 right-4 w-4/5 z-20 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg p-4 shadow-lg rotate-[3deg] transition-all duration-300 hover:rotate-[1deg] hover:scale-105">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300 mb-2">
                  <GitBranch className="w-4 h-4 text-orange-400" />
                  <span>GitHub</span>
                </div>
                <p className="text-sm font-medium text-white text-left mb-1">
                  feat/user-dashboard
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span>All checks passed</span>
                </div>
              </div>

              {/* Figma Card (now with green accent) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rotate-[1deg] w-5/6 bg-green-900/30 hover:bg-green-900/50 border border-green-700 hover:border-green-600 rounded-lg p-4 shadow-lg z-30 transition-all duration-300 hover:rotate-0 hover:scale-105">
                <div className="flex items-center gap-2 text-xs font-medium text-green-300 mb-2">
                  <Figma className="w-4 h-4" />
                  <span>Figma</span>
                </div>
                <p className="text-sm font-medium text-white mb-1">
                  Mobile App Mockups v3
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400">Ready for dev handoff</span>
                  <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage

