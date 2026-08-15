import Link from 'next/link';
import { Check, X, Zap, Shield, Crown } from 'lucide-react';

export const metadata = {
  title: 'Pricing - MediConnect AI',
  description: 'Choose the right plan for your healthcare needs.',
};

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    period: 'forever',
    description: 'Get started with essential health features',
    icon: Shield,
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Browse & view doctor profiles', included: true },
      { text: 'AI Symptom Checker (3/day)', included: true },
      { text: 'Book up to 2 appointments/month', included: true },
      { text: 'Access health articles', included: true },
      { text: 'Video consultations', included: false },
      { text: 'Priority booking', included: false },
      { text: 'Family accounts', included: false },
      { text: 'Dedicated care coordinator', included: false },
    ],
    cta: 'Get Started Free',
    href: '/register',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'PKR 999',
    period: 'per month',
    description: 'Everything you need for comprehensive healthcare',
    icon: Zap,
    color: 'from-primary-500 to-accent-500',
    popular: true,
    features: [
      { text: 'Unlimited doctor bookings', included: true },
      { text: 'AI Symptom Checker (unlimited)', included: true },
      { text: 'Video consultations', included: true },
      { text: 'Priority booking & support', included: true },
      { text: 'Digital prescriptions', included: true },
      { text: 'Payment history & invoices', included: true },
      { text: 'Family accounts', included: false },
      { text: 'Dedicated care coordinator', included: false },
    ],
    cta: 'Start Pro Plan',
    href: '/register?plan=pro',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'PKR 2,499',
    period: 'per month',
    description: 'Complete family healthcare management',
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Family plan (up to 5 members)', included: true },
      { text: 'Dedicated care coordinator', included: true },
      { text: 'Home visit booking', included: true },
      { text: 'Lab test booking', included: true },
      { text: 'Health monitoring dashboard', included: true },
      { text: 'Annual health checkup package', included: true },
      { text: 'Emergency hotline access', included: true },
    ],
    cta: 'Go Premium',
    href: '/register?plan=premium',
  },
];

const FAQ = [
  { q: 'Can I switch plans anytime?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.' },
  { q: 'Is there a free trial?', a: 'Our Basic plan is completely free forever. For Pro and Premium, we offer a 7-day free trial with no credit card required.' },
  { q: 'What payment methods are accepted?', a: 'We accept Stripe (international cards), JazzCash, EasyPaisa, and bank transfers for Pakistani users.' },
  { q: 'Can I use MediConnect without signing up?', a: 'You can browse doctors and read content. However, booking appointments and AI features require a free account.' },
  { q: 'Is my health data secure?', a: 'Absolutely. All data is encrypted, and we comply with HIPAA-equivalent standards. Your data is never sold to third parties.' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">Simple, Transparent Pricing</span>
        <h1 className="text-4xl md:text-5xl font-black font-heading text-gray-900 dark:text-white mb-4">
          Invest in Your <span className="gradient-text">Health</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Choose the plan that fits your healthcare needs. All plans include access to our network of 500+ verified doctors.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            return (
              <div key={plan.id} className={`relative bg-white dark:bg-gray-800 rounded-3xl border-2 ${
                plan.popular ? 'border-primary-500 shadow-glow' : 'border-gray-100 dark:border-gray-700'
              } overflow-hidden flex flex-col`}>
                {plan.popular && (
                  <div className="bg-gradient-to-r from-primary-600 to-accent-500 text-white text-xs font-bold text-center py-2 uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="p-6 flex-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm ml-2">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map(f => (
                      <li key={f.text} className={`flex items-center gap-3 text-sm ${f.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 line-through'}`}>
                        {f.included
                          ? <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-green-600 dark:text-green-400" /></div>
                          : <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"><X className="w-3 h-3 text-gray-400" /></div>
                        }
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 pt-0">
                  <Link href={plan.href}
                    className={`block w-full text-center py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-glow hover:opacity-90'
                        : 'border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-black font-heading text-gray-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{q}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
