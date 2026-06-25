import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | DevFort',
  description: 'Privacy Policy for DevFort Platform',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-24 text-slate-300">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline text-sm font-semibold flex items-center gap-2 mb-6">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-400">
              <li>Account information (name, email, password hashes)</li>
              <li>Billing information (processed securely by Razorpay)</li>
              <li>Data and files uploaded to the platform</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-400">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. Passwords are securely hashed, and 2FA options are provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Services</h2>
            <p className="leading-relaxed">
              We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (e.g., Payment processors, Email services).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
