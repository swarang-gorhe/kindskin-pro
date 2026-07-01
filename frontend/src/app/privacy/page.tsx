import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 prose-content">
        <FadeIn>
          <h1 className="font-serif text-4xl text-forest mb-8">Privacy Policy</h1>
          <p className="text-muted leading-relaxed mb-4">
            KindSkin Co. respects your privacy. This policy explains how we collect, use, and protect your information.
          </p>
          <h2 className="font-serif text-2xl text-forest mt-8 mb-4">Information We Collect</h2>
          <p className="text-muted leading-relaxed mb-4">
            We collect information you provide directly: quiz responses, contact form submissions, newsletter sign-ups, and order details. Chat conversations with our AI assistant are logged for quality improvement.
          </p>
          <h2 className="font-serif text-2xl text-forest mt-8 mb-4">AI-Assisted Features</h2>
          <p className="text-muted leading-relaxed mb-4">
            Our quiz recommendations and chat assistant use AI to provide personalized guidance. These recommendations are advisory, not medical advice. AI inputs and outputs may be retained for up to 90 days for quality review.
          </p>
          <h2 className="font-serif text-2xl text-forest mt-8 mb-4">Data Retention</h2>
          <p className="text-muted leading-relaxed mb-4">
            Quiz and chat data is retained for 90 days unless you request deletion. Order data is retained as required for tax and legal purposes.
          </p>
          <h2 className="font-serif text-2xl text-forest mt-8 mb-4">Contact</h2>
          <p className="text-muted leading-relaxed">
            For privacy inquiries or data deletion requests, email hello@kindskin.co.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
