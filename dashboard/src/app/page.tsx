import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 font-bold text-xl">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            SupportKit
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-blue-50 dark:from-blue-950/20 dark:via-transparent dark:to-blue-950/20" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4 tracking-wide uppercase">
              RevenueCat, but for App Support
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-blue-600">AI-Powered</span> Customer Support for Your App
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-slate-400 md:text-xl max-w-2xl mx-auto">
              Drop-in support chat that actually understands your product.
              Train it with your knowledge base, integrate in 3 lines of code.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="h-12 px-8 inline-flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors gap-2"
              >
                Start for Free
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <a
                href="#how-it-works"
                className="h-12 px-8 inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-slate-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">
              No credit card required. Free tier included.
            </p>
          </div>
        </div>
      </section>

      {/* Code Preview */}
      <section className="py-16 border-y border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Three Lines of Code
            </h2>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              Add intelligent customer support to your iOS app in under a minute.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-2 font-mono">ContentView.swift</span>
            </div>
            {/* Code */}
            <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-slate-900 dark:to-slate-900/80">
              <pre className="text-sm md:text-base font-mono leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-purple-600 dark:text-purple-400">import</span> <span className="text-blue-600 dark:text-blue-400">SupportKit</span>{'\n'}
                  {'\n'}
                  <span className="text-gray-400 dark:text-slate-500">// Configure with your API key</span>{'\n'}
                  <span className="text-blue-600 dark:text-blue-400">SupportKit</span>.<span className="text-yellow-600 dark:text-yellow-400">configure</span>(apiKey: <span className="text-green-600 dark:text-green-400">&quot;sk_live_...&quot;</span>){'\n'}
                  {'\n'}
                  <span className="text-gray-400 dark:text-slate-500">// Present the support chat</span>{'\n'}
                  <span className="text-blue-600 dark:text-blue-400">SupportKit</span>.<span className="text-yellow-600 dark:text-yellow-400">presentChat</span>(from: viewController)
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
              A complete support solution that&apos;s smart enough to handle your users&apos; questions.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'AI-Powered Responses',
                description: 'Powered by Claude, your support agent understands context and delivers accurate, helpful answers grounded in your knowledge base.',
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                ),
              },
              {
                title: 'Knowledge Base',
                description: 'Upload FAQs, docs, and help articles. The AI learns your product inside and out — no complex RAG pipelines needed.',
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                ),
              },
              {
                title: 'Native iOS SDK',
                description: 'Beautiful SwiftUI chat interface that matches your app. Supports dark mode, accessibility, and feels completely native.',
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                ),
              },
              {
                title: '3-Line Integration',
                description: 'Import, configure, present. That\'s it. No complicated setup, no backend configuration, no API wrangling.',
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                ),
              },
              {
                title: 'Developer Dashboard',
                description: 'Manage your knowledge base, view API keys, and configure your support agent from a clean, modern dashboard.',
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                ),
              },
              {
                title: 'Swift Package Manager',
                description: 'Distributed as a native SPM package. Add it to your Xcode project in seconds with a single URL.',
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 border-y border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
              Get up and running in minutes, not weeks.
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Add Your Knowledge',
                description: 'Upload FAQs, help articles, or product docs through the dashboard. The AI learns everything about your product.',
              },
              {
                step: '2',
                title: 'Integrate the SDK',
                description: 'Add SupportKit via Swift Package Manager, configure with your API key, and present the chat — 3 lines of code.',
              },
              {
                step: '3',
                title: 'Delight Your Users',
                description: 'Your users get instant, accurate support powered by AI. You get happy customers and fewer support tickets.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Developers
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">
              SupportKit is designed with the developer experience in mind.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote: 'I was spending hours answering the same support questions. SupportKit handles it all now — and the answers are actually good.',
                name: 'Sarah Chen',
                role: 'Indie iOS Developer',
              },
              {
                quote: 'The integration was ridiculously simple. I had AI support in my app within 10 minutes. No backend work needed.',
                name: 'Marcus Johnson',
                role: 'Mobile Engineer',
              },
              {
                quote: 'Finally a support tool that doesn\'t require a PhD in ML to set up. Upload your docs and it just works.',
                name: 'Elena Rodriguez',
                role: 'Startup Founder',
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
              >
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple Pricing</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-400">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8">
              <h3 className="text-xl font-bold">Free</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Perfect for trying out SupportKit</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500 dark:text-slate-400">/month</span>
              </div>
              <Link href="/login" className="block w-full h-11 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">Get Started</Link>
              <ul className="mt-6 space-y-3">
                {['100 AI conversations/month', '1 organization', '5 knowledge articles', 'Community support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Pro */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white dark:bg-slate-900 p-8 shadow-lg ring-1 ring-blue-600">
              <span className="inline-block text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full mb-3">Most Popular</span>
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">For growing apps that need more</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-gray-500 dark:text-slate-400">/month</span>
              </div>
              <Link href="/billing" className="block w-full h-11 flex items-center justify-center bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Start Free Trial</Link>
              <ul className="mt-6 space-y-3">
                {['Unlimited AI conversations', 'Unlimited organizations', 'Unlimited knowledge articles', 'Priority support', '7-day free trial'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Ready to Transform Your App Support?
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Join developers who are shipping better support experiences with less effort.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="h-12 px-8 inline-flex items-center justify-center rounded-lg bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors gap-2"
            >
              Get Started Free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-blue-100">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Free tier included
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Setup in minutes
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-lg mb-3">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                SupportKit
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs">
                AI-powered customer support SDK for iOS apps. Built for developers who care about their users.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-slate-400">
                <li><a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">How It Works</a></li>
                <li><Link href="/login" className="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-slate-400">
                <li><Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800 text-center text-xs text-gray-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} SupportKit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
