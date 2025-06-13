'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bookmark, 
  Brain, 
  Search, 
  Smartphone, 
  Shield, 
  Zap,
  Star,
  Check,
  X,
  AlertTriangle,
  Users,
  Award,
  ArrowRight,
  Play,
  Globe,
  Lock,
  Folder,
  Target
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Organization',
    description: 'Effortlessly categorize and organize bookmarks with intelligent AI that learns your habits'
  },
  {
    icon: Search,
    title: 'Lightning-Fast Search',
    description: 'Find any bookmark in seconds with context-aware search and smart suggestions'
  },
  {
    icon: Smartphone,
    title: 'Cross-Device Sync',
    description: 'Access your bookmarks anywhere, anytime - perfectly synced across all devices'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data belongs to YOU. End-to-end encryption and zero data selling'
  },
  {
    icon: Zap,
    title: 'Context Awareness',
    description: 'Remember why you saved something and get relevant suggestions at the right moment'
  },
  {
    icon: Folder,
    title: 'Smart Folders',
    description: 'Automatically organize bookmarks into intelligent folders based on content and usage'
  }
]

const testimonials = [
  {
    quote: "I went from losing links daily to never forgetting a thing. Bookmark AI changed how I work—forever.",
    author: "Olivia W.",
    role: "Startup Founder",
    rating: 5
  },
  {
    quote: "No bookmark app comes close. Magical, intuitive, life-saving.",
    author: "Brian T.",
    role: "Researcher",
    rating: 5
  },
  {
    quote: "Finally—an app that actually understands what I need. 10/10!",
    author: "Sarah M.",
    role: "Designer",
    rating: 5
  }
]

const comparisonData = [
  { feature: 'AI-Powered Organization', us: true, compA: false, compB: false },
  { feature: 'Context-Aware Suggestions', us: true, compA: false, compB: false },
  { feature: 'Privacy-First Design', us: true, compA: 'partial', compB: false },
  { feature: 'Cross-Device Auto-Sync', us: true, compA: true, compB: 'partial' },
  { feature: 'No Ads, No Distractions', us: true, compA: 'partial', compB: false },
  { feature: 'Friendly, Rapid Support', us: true, compA: 'partial', compB: 'partial' }
]

const pricingPlans = [
  {
    name: 'Free Forever',
    price: '$0',
    period: '',
    features: [
      'Unlimited bookmarks',
      '2 devices',
      'Basic AI organization',
      'Standard search',
      'Community support'
    ],
    cta: 'Sign Up Free',
    popular: false
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    features: [
      'Unlimited bookmarks',
      'Unlimited devices',
      'Advanced AI organization',
      'Context-aware search',
      'Priority support',
      'Advanced analytics'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Teams/Business',
    price: 'Custom',
    period: 'pricing',
    features: [
      'Everything in Pro',
      'Team folders',
      'Admin controls',
      'Premium support',
      'Custom integrations',
      'Enterprise security'
    ],
    cta: 'Contact Us',
    popular: false
  }
]

export default function LandingPage() {
  const [email, setEmail] = useState('')

  const handleSignup = () => {
    if (email) {
      console.log('Signup with email:', email)
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Bookmark AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
            <Link href={"/sign-in" as import('next').Route} passHref>
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">
                Sign In
              </Button>
            </Link>
            <Link href={"/sign-up" as import('next').Route} passHref>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The World's #1 
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> Bookmark App</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Are you tired of tab overload? Drowning in 20, 40, or even more open tabs?
            <br />
            <span className="text-blue-400 font-semibold">Say goodbye to digital clutter. Welcome to Bookmark AI.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg">
              Get Started Free!
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg">
              <Play className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>

          {/* Visual Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center">
                  <X className="mr-2 h-5 w-5" />
                  Chaos: Before Bookmark AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-100 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="bg-red-300 text-red-800 px-2 py-1 rounded text-xs">
                        Tab {i + 1}
                      </div>
                    ))}
                  </div>
                  <p className="text-red-700 text-sm">40+ tabs, unorganized bookmarks, constant confusion</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <Check className="mr-2 h-5 w-5" />
                  Clarity: With Bookmark AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 text-sm">Development (23)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 text-sm">Design (15)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Folder className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 text-sm">Research (8)</span>
                    </div>
                  </div>
                  <p className="text-green-700 text-sm mt-2">Clean, organized, instantly accessible</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Bookmark AI is the Ultimate Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Supercharged by Artificial Intelligence, designed for visionaries, creators, and productivity warriors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Bookmark AI?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: '#1 Rated by Professionals', desc: 'Trusted worldwide by entrepreneurs and power users' },
              { icon: Brain, title: 'AI That Truly Works', desc: 'Learns your habits and gets more powerful over time' },
              { icon: Zap, title: 'Unmatched Simplicity', desc: 'One-click saving, automated organization' },
              { icon: Users, title: 'Premium Support', desc: 'Real people, rapid answers—always here for you' }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <Icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Users Are Saying</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic text-gray-700 mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Bookmark AI vs. The Rest</h2>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold text-blue-600">Bookmark AI</th>
                      <th className="text-center p-4 font-semibold">Competitor A</th>
                      <th className="text-center p-4 font-semibold">Competitor B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4">{row.feature}</td>
                        <td className="text-center p-4">
                          {row.us && <Check className="h-5 w-5 text-green-500 mx-auto" />}
                        </td>
                        <td className="text-center p-4">
                          {row.compA === true && <Check className="h-5 w-5 text-green-500 mx-auto" />}
                          {row.compA === 'partial' && <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto" />}
                          {row.compA === false && <X className="h-5 w-5 text-red-500 mx-auto" />}
                        </td>
                        <td className="text-center p-4">
                          {row.compB === true && <Check className="h-5 w-5 text-green-500 mx-auto" />}
                          {row.compB === 'partial' && <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto" />}
                          {row.compB === false && <X className="h-5 w-5 text-red-500 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Pricing — Simple, Transparent, Fair</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Try Bookmark AI — Free!
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the future of bookmarking, risk-free. No credit card required. No ads. No clutter.
            Just the world's smartest, simplest bookmark app—waiting for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white"
            />
            <Button 
              onClick={handleSignup}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started Free!
            </Button>
          </div>
          
          <p className="text-blue-200 text-sm mt-4">
            Join thousands of professionals who've transformed their workflow
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Bookmark AI</span>
              </div>
              <p className="text-gray-400">
                The world's smartest bookmark manager for ambitious minds.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bookmark AI. All rights reserved. Own Your Web. Never Lose a Link Again.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 