export const metadata = {
  title: 'Privacy Policy - MediConnect AI',
  description: 'Privacy Policy for MediConnect AI healthcare platform.',
};

export default function PrivacyPolicyPage() {
  const sections = [
    { title: '1. Information We Collect', content: 'We collect information you provide when creating an account (name, email, password), booking appointments (health conditions, symptoms, preferences), and using AI features. We also collect usage data such as IP addresses, browser type, and pages visited to improve our services.' },
    { title: '2. How We Use Your Information', content: 'Your information is used to: facilitate doctor-patient connections and appointment bookings, provide AI-powered health recommendations, send appointment confirmations and reminders via email, improve our platform and services, and comply with legal obligations.' },
    { title: '3. Data Sharing', content: 'We share your information only with: the doctor you book appointments with (necessary for care), payment processors (Stripe, JazzCash, EasyPaisa) for secure transactions, and cloud services that help run our platform. We NEVER sell your personal or health data to third parties.' },
    { title: '4. Data Security', content: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We implement regular security audits, access controls, and follow industry best practices to protect your information.' },
    { title: '5. Your Rights', content: 'You have the right to: access your personal data, correct inaccurate information, request deletion of your account and data, download your medical records, and opt out of non-essential communications. Contact privacy@mediconnect.pk to exercise these rights.' },
    { title: '6. Cookies', content: 'We use essential cookies for authentication and security, and optional analytics cookies to understand usage patterns. You can control cookie preferences in your browser settings.' },
    { title: '7. Data Retention', content: 'We retain your data while your account is active. Medical records are kept for 7 years as required by Pakistani healthcare regulations. You can request account deletion at any time.' },
    { title: '8. Contact Us', content: 'For privacy concerns, contact our Data Protection Officer at privacy@mediconnect.pk or by post at MediConnect AI, Gulberg III, Lahore, Punjab 54000, Pakistan.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black font-heading text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: January 2025</p>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            MediConnect AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and safeguarding your personal health information. This Privacy Policy explains how we collect, use, and protect your data when you use our platform.
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
