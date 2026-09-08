import Link from 'next/link';
import { Shield, Lock, FileText, CheckCircle2, UserCheck, Database, Eye, Server, RefreshCw, Mail } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | MediConnect AI',
  description: 'Comprehensive Privacy Policy for MediConnect AI healthcare platform detailing data collection, Google user data handling, and privacy practices.',
  alternates: {
    canonical: 'https://mediconnect.muzamal.site/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | MediConnect AI',
    description: 'Privacy Policy for MediConnect AI healthcare platform detailing data collection, Google user data handling, and privacy practices.',
    url: 'https://mediconnect.muzamal.site/privacy',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 15, 2025';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Effective & Last Updated: <span className="font-semibold text-gray-900 dark:text-gray-200">{lastUpdated}</span>
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            MediConnect AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), accessible at{' '}
            <Link href="https://mediconnect.muzamal.site" className="text-primary-600 dark:text-primary-400 underline font-medium">
              https://mediconnect.muzamal.site
            </Link>
            , is committed to safeguarding your privacy and ensuring the security of your personal and health information. This Privacy Policy provides a transparent explanation of what information we collect, why and how we use it, our handling of Google user data, and your rights.
          </p>
        </div>

        {/* Highlight Callout: Google User Data & Limited Use */}
        <div className="mb-12 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-600 text-white shrink-0 mt-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Google API Services User Data Disclosure & Limited Use
              </h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                MediConnect AI uses Google OAuth 2.0 to provide single sign-on authentication. MediConnect AI&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 dark:text-blue-400 underline hover:text-blue-700"
                >
                  Google API Services User Data Policy
                </a>
                , including the <strong>Limited Use</strong> requirements. We do <strong>NOT</strong> sell Google user data, use it for advertising, or transfer it to third parties without explicit authorization.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-12 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {/* 1. What MediConnect AI Is */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">1</span>
              About MediConnect AI
            </h2>
            <p>
              MediConnect AI is an advanced healthcare appointment and telemedicine platform designed to connect patients with certified medical professionals. The platform offers features including doctor directory search, appointment scheduling, AI-assisted health triage and symptom checking, digital prescriptions, and encrypted video consultations.
            </p>
          </section>

          {/* 2. Personal Information We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">2</span>
              Information We Collect
            </h2>
            <p>We collect information that you directly provide to us, as well as information generated through your interaction with the platform:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account & Profile Information:</strong> Full name, email address, password hash (for credentials-based accounts), phone number, gender, date of birth, blood group, city/location, and optional profile photograph.
              </li>
              <li>
                <strong>Patient Health Information:</strong> Self-reported medical history, known allergies, chronic diseases, emergency contacts, symptoms submitted when requesting appointments, doctor consultation notes, and digital prescriptions.
              </li>
              <li>
                <strong>Doctor Professional Credentials:</strong> Medical license number, specialization, qualifications and degrees, hospital affiliations, years of experience, biography, consultation fees, and schedule availability.
              </li>
              <li>
                <strong>Appointment & Telehealth Data:</strong> Selected healthcare provider, appointment date and time, consultation format (in-person or video consultation), reason for visit, appointment status, and appointment QR codes.
              </li>
              <li>
                <strong>Payment & Transaction Information:</strong> Consultation fee amounts, payment status, transaction identifiers, and payment method (Stripe, JazzCash, EasyPaisa). We do <em>not</em> store raw credit or debit card numbers on our servers; payments are processed securely through certified gateways.
              </li>
              <li>
                <strong>AI Interaction Data:</strong> Symptoms, queries, age range, and pain level descriptions voluntarily provided to our AI Symptom Checker and AI Health Assistant to receive informational triage assistance.
              </li>
            </ul>
          </section>

          {/* 3. Google Sign-In & Google User Data */}
          <section className="space-y-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">3</span>
              Google Sign-In & Google User Data
            </h2>
            <p>
              When you choose to sign in to MediConnect AI using Google Sign-In (&quot;Log in with Google&quot;), we request access via standard Google OAuth 2.0 protocol using the basic identity scopes (<code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">openid</code>, <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">profile</code>, and <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">email</code>).
            </p>

            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">A. Specific Google Data Received:</h3>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Your Google primary email address.</li>
                <li>Your Google display name (First and Last Name).</li>
                <li>Your public Google profile image URL (avatar).</li>
                <li>Your unique Google account identifier (subject ID).</li>
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Note: We do <strong>NOT</strong> request or access sensitive Google scopes such as your Google Drive files, Gmail inbox, Google Contacts, Google Calendar, or location tracking.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">B. Why We Collect Google User Data:</h3>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>To authenticate your identity quickly and securely without requiring you to remember a separate password.</li>
                <li>To establish and verify your MediConnect AI user account.</li>
                <li>To personalize your profile by displaying your name and profile avatar across the patient interface.</li>
                <li>To deliver appointment confirmations, reminders, and vital consultation notifications to your verified email.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">C. How Google User Data Is Used & Protection Guarantees:</h3>
              <ul className="list-disc pl-6 space-y-1.5">
                <li><strong>No Sale of Data:</strong> MediConnect AI does <strong>NOT</strong> sell, license, rent, or trade Google user data to third parties, data brokers, or advertising networks.</li>
                <li><strong>No Advertising Usage:</strong> We do <strong>NOT</strong> use or disclose Google user data for serving advertisements, personalized ads, retargeting, or interest-based marketing.</li>
                <li><strong>No Generalized AI Model Training:</strong> Google user data is <strong>NOT</strong> used to train, retrain, or fine-tune generalized machine learning or artificial intelligence models.</li>
                <li><strong>Restricted Human Access:</strong> Our personnel do not inspect Google user data unless you have provided explicit consent for customer support, it is strictly required to resolve a technical error, or disclosure is required by law.</li>
                <li><strong>Strict Limited Use:</strong> MediConnect AI&apos;s use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</li>
              </ul>
            </div>
          </section>

          {/* 4. How We Use Information */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">4</span>
              How We Use Your Information
            </h2>
            <p>All data collected by MediConnect AI is processed for lawful, legitimate medical and platform operational purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitating appointment scheduling between patients and doctors.</li>
              <li>Enabling secure, encrypted real-time video consultations.</li>
              <li>Delivering automated appointment confirmations, reminders, and updates via email.</li>
              <li>Generating AI-driven preliminary symptom analysis and triage recommendations to assist patients in selecting suitable medical specialists.</li>
              <li>Allowing licensed doctors to create and issue verifiable digital prescriptions.</li>
              <li>Processing consultation payments securely and generating invoices.</li>
              <li>Maintaining audit logs for security, platform integrity, and fraud prevention.</li>
            </ul>
          </section>

          {/* 5. Third-Party Services Present in the Application */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">5</span>
              Third-Party Services in Use
            </h2>
            <p>
              We only engage third-party services that are strictly necessary to deliver the functionality of MediConnect AI. Below is an exhaustive list of external service providers utilized in the application:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  Google OAuth (Identity)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Provides secure single sign-on authentication and basic identity verification.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-500" />
                  OpenAI API (Health AI)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Processes user-entered symptoms to deliver educational health triage recommendations. Personal identifiers and Google secrets are not transmitted.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-500" />
                  Stripe, JazzCash, EasyPaisa
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Process consultation payments. Cardholder data is handled by PCI-DSS certified processors.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-red-500" />
                  Daily.co (Telehealth Video)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Powers encrypted peer-to-peer WebRTC video rooms for doctor-patient consultations.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-500" />
                  Cloudinary (Media Storage)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Stores encrypted profile photos and medical attachment files over HTTPS.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  Resend (Transactional Emails)
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Delivers appointment reminders, confirmations, and security notifications.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Cookies & Session Storage */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">6</span>
              Cookies & Local Storage
            </h2>
            <p>We use essential cookies and browser storage strictly to ensure platform security and functionality:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Session Authentication Cookies:</strong> Cryptographically signed HTTP-only cookies (<code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">authjs.session-token</code> or <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">__Secure-authjs.session-token</code>) to maintain your login session securely across pages.
              </li>
              <li>
                <strong>CSRF Protection Tokens:</strong> Prevent cross-site request forgery attacks during forms and authentication.
              </li>
              <li>
                <strong>Local Storage:</strong> Remembers your UI display preferences, such as Dark Mode or Light Mode theme selection.
              </li>
            </ul>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We do not use invasive third-party cross-site advertising trackers.
            </p>
          </section>

          {/* 7. Data Sharing & Non-Sale of Data */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">7</span>
              Data Sharing & Zero Sale Policy
            </h2>
            <p>
              <strong>We NEVER sell, rent, or monetize your personal information or health records.</strong> Information is shared solely in the following strict circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>With Healthcare Providers:</strong> Your appointment reason, medical notes, and relevant patient profile information are shared with the specific doctor you book with so they can provide appropriate medical care.
              </li>
              <li>
                <strong>With Infrastructure Sub-processors:</strong> Verified technical providers (listed in Section 5) operating under strict data protection and confidentiality agreements.
              </li>
              <li>
                <strong>For Legal & Regulatory Compliance:</strong> If required by a valid court order, subpoena, government regulation, or to protect the safety and rights of patients and healthcare providers.
              </li>
            </ul>
          </section>

          {/* 8. Data Storage & Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">8</span>
              Data Storage & Security
            </h2>
            <p>We implement rigorous organizational, technical, and physical security measures to protect your information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption in Transit:</strong> All web traffic is strictly served over TLS 1.3 HTTPS encryption with HSTS protection.</li>
              <li><strong>Encryption at Rest:</strong> Application databases and storage buckets utilize industry-standard AES-256 encryption.</li>
              <li><strong>Credential Security:</strong> User passwords are cryptographically hashed using salted bcrypt (cost factor 12).</li>
              <li><strong>Role-Based Access Control:</strong> Strict backend permission checks ensure patients, doctors, and administrators can access only their authorized data.</li>
            </ul>
          </section>

          {/* 9. Data Retention & Deletion Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">9</span>
              Data Retention & Your Rights
            </h2>
            <p>
              We retain personal data for as long as your account remains active or as needed to comply with applicable healthcare documentation and statutory retention requirements.
            </p>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Access & Inspect:</strong> View your profile, appointment records, and prescriptions at any time.</li>
              <li><strong>Rectification:</strong> Update inaccurate or incomplete medical or contact information in your dashboard.</li>
              <li><strong>Account & Data Deletion:</strong> Request the deletion of your account and associated personal data by submitting a request to our privacy team.</li>
              <li><strong>Revoke Google Access:</strong> You can revoke MediConnect AI&apos;s access to your Google Account at any time via your{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 underline font-medium"
                >
                  Google Account Permissions
                </a>{' '}
                dashboard.
              </li>
            </ul>
          </section>

          {/* 10. Children's Privacy */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">10</span>
              Children&apos;s Privacy
            </h2>
            <p>
              MediConnect AI is not directed at children under the age of 13. We do not knowingly collect personal information directly from children under 13. Individuals under the age of 18 may only use MediConnect AI with the express involvement, supervision, and consent of a parent or legal guardian.
            </p>
          </section>

          {/* 11. Policy Changes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">11</span>
              Changes to this Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically to reflect enhancements to our platform, changes in applicable laws, or adjustments to our service providers. When updates are published, the &quot;Effective & Last Updated&quot; date at the top of this policy will be revised. For significant changes, we will notify registered users via email or through prominent notifications in the application.
            </p>
          </section>

          {/* 12. Contact Information */}
          <section className="space-y-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">12</span>
              Contact Us
            </h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Protection Officer:</p>
            <div className="space-y-2 pt-2 text-sm">
              <p><strong>Application:</strong> MediConnect AI</p>
              <p><strong>Website:</strong> <a href="https://mediconnect.muzamal.site" className="text-primary-600 dark:text-primary-400 underline">https://mediconnect.muzamal.site</a></p>
              <p><strong>Email:</strong> <a href="mailto:muzamalfarooq111@gmail.com" className="text-primary-600 dark:text-primary-400 underline">muzamalfarooq111@gmail.com</a></p>
              <p><strong>Address:</strong> Blue Area, Islamabad, Pakistan</p>
              <p><strong>Phone:</strong> +92 306 7774327</p>
            </div>
          </section>
        </div>

        {/* Back navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <Link
            href="/"
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm flex items-center gap-1.5"
          >
            ← Return to Homepage
          </Link>
          <Link
            href="/terms"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm"
          >
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
