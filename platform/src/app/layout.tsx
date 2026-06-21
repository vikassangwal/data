import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vkfort.vercel.app'),
  manifest: "/manifest.json",
  title: {
    default: "DevForge | AI-Powered Development & Analytics",
    template: "%s | DevForge",
  },
  description:
    "Premium AI-powered development, data analytics, and automation services. Transform your business with cutting-edge technology solutions.",
  keywords: [
    "AI",
    "data analytics",
    "enterprise business intelligence",
    "web development",
    "automation",
    "machine learning",
    "Python BI Dashboard",
    "generative AI analytics",
    "automated reporting system",
    "Next.js data visualization"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "DevForge | AI-Powered Development & Analytics",
    description:
      "Premium AI-powered development, data analytics, and automation services.",
    siteName: "DevForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevForge",
    description:
      "Premium AI-powered development, data analytics, and automation services.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "Xz3qMtC7IM85GL8oKEgOJ_ZE05AgUfTieSjpCzmMRxA",
  },
};

import { AnimationProvider } from '@/components/providers/AnimationProvider';
import FloatingAiAssistant from '@/components/ui/FloatingAiAssistant';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import NextAuthProvider from '@/components/providers/NextAuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "DevForge AI Business Intelligence Platform",
              "operatingSystem": "Web",
              "applicationCategory": "BusinessApplication",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1254"
               },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "Enterprise-grade automated data analytics, machine learning forecasting, and AI-powered business intelligence dashboards.",
              "softwareVersion": "2.0"
            })
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-[var(--bg-primary)]">
        <NextAuthProvider>
          <AnalyticsTracker />
          <AnimationProvider>
            {/* Header */}
            <Header />
            
            {/* Main Content */}
            <main className="min-h-screen relative z-10">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />

            {/* Global AI Assistant */}
            <FloatingAiAssistant />

            {/* Hidden Google Translate Element */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>
          </AnimationProvider>

          <Script
            id="google-translate-script"
            src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />
          <Script
            id="google-translate-init"
            strategy="afterInteractive"
          >
            {`
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
              }
            `}
          </Script>
        </NextAuthProvider>
      </body>
    </html>
  );
}
