export const metadata = {
  title: 'Terms of Service - MediConnect AI',
  description: 'Terms of Service for MediConnect AI.',
};

export default function TermsPage() {
  const sections = [
    { title: '1. Acceptance of Terms', content: 'By accessing or using MediConnect AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.' },
    { title: '2. Platform Description', content: 'MediConnect AI is an online platform that connects patients with licensed medical professionals for appointment booking and consultations. We are not a medical provider and do not practice medicine.' },
    { title: '3. User Accounts', content: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your credentials. Accounts are for individual use only and may not be shared.' },
    { title: '4. Medical Disclaimer', content: 'MediConnect AI provides a platform to connect patients with doctors. We do not provide medical advice, diagnosis, or treatment. AI features are informational only. Always consult a qualified healthcare professional for medical decisions. In emergencies, call 115 immediately.' },
    { title: '5. Doctor Listings', content: 'Doctors listed on MediConnect AI are independent professionals who have been verified by our team. We do not guarantee the quality of medical services provided. Reviews and ratings are from actual patients.' },
    { title: '6. Payments and Refunds', content: 'Consultation fees are set by individual doctors. Payment is processed securely through our payment partners. Refunds for cancelled appointments are processed within 5-7 business days to the original payment method.' },
    { title: '7. Prohibited Activities', content: 'You may not: impersonate a doctor or medical professional, provide false medical information, use the platform for any illegal purpose, attempt to scrape or hack our systems, or post inappropriate or offensive content.' },
    { title: '8. Termination', content: 'We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your profile settings.' },
    { title: '9. Governing Law', content: 'These terms are governed by the laws of Pakistan. Any disputes shall be subject to the jurisdiction of the courts of Lahore, Punjab, Pakistan.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black font-heading text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: January 2025</p>
        <div className="space-y-8">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Please read these Terms of Service carefully before using MediConnect AI. By using our platform, you agree to these terms.
          </p>
          {sections.map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
