'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, createCheckoutSession } from '@/lib/api';
import { FREE_FEATURES, PRO_FEATURES, PRO_PRICE } from '@/lib/plans';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out SupportKit',
    features: FREE_FEATURES,
    missing: [
      'Unlimited conversations',
      'Unlimited organizations',
      'Unlimited knowledge articles',
      'Priority support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: PRO_PRICE,
    period: '/month',
    description: 'For growing apps that need more',
    features: PRO_FEATURES,
    missing: [],
    cta: 'Start Free Trial',
    highlighted: true,
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handleUpgrade = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            SupportKit
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Login</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">Start free, upgrade when you need more.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                plan.highlighted
                  ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-lg ring-1 ring-blue-600'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block self-start text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full mb-4">
                  Most Popular
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{plan.description}</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-slate-400">{plan.period}</span>
              </div>

              {plan.highlighted ? (
                <button
                  onClick={handleUpgrade}
                  className="w-full h-11 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 mb-6"
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full h-11 flex items-center justify-center border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 mb-6"
                >
                  {plan.cta}
                </Link>
              )}

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
                {plan.missing.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-400 dark:text-slate-500">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              { q: 'What counts as a conversation?', a: 'Each message sent to the AI support agent counts as one conversation. Both messages from your app users via the SDK and test messages count.' },
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your Pro subscription at any time from the billing page. You\'ll keep Pro access until the end of your billing period.' },
              { q: 'What happens when I hit the free tier limit?', a: 'Your end users will receive a message indicating support is temporarily unavailable. You can upgrade to Pro at any time to restore service.' },
              { q: 'Do you offer a free trial?', a: 'Yes! Pro comes with a 7-day free trial. No charge until the trial ends.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{q}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
