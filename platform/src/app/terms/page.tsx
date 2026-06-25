import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | DevFort',
  description: 'Terms and Conditions for DevFort Platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-24 text-slate-300">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12">
          <Link href="/" className="text-primary hover:underline text-sm font-semibold flex items-center gap-2 mb-6">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 prose prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using DevFort ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="leading-relaxed">
              DevFort provides advanced data analytics, AI workflows, and project management tools. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts & Security</h2>
            <p className="leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials, including passwords and 2FA tokens. You must immediately notify us of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Payment & Billing</h2>
            <p className="leading-relaxed">
              Premium features require a paid subscription. Payments are processed securely via Razorpay. Subscriptions automatically renew unless cancelled prior to the renewal date. All fees are non-refundable unless required by law.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
            <p className="leading-relaxed">
              DevFort shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
