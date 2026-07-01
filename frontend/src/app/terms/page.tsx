import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 prose-content">
        <FadeIn>
          <h1 className="font-serif text-4xl text-forest mb-8">Terms of Service</h1>
          <p className="text-muted leading-relaxed mb-4">
            By using the KindSkin Co. website, you agree to these terms.
          </p>
          <h2 className="font-serif text-2xl text-forest mt-8 mb-4">Products & Orders</h2>
          <p className="text-muted leading-relaxed mb-4">
            All products are subject to availability. Prices are in INR and include applicable taxes. We reserve the right to modify prices without notice.
          </p>
          <h2 className="font-serif text-2xl text-forest mt-8 mb-4">AI Recommendations</h2>
          <p className="text-muted leading-relaxed mb-4">
            Skincare quiz results and chat assistant responses are AI-assisted suggestions, not medical advice. Consult a dermatologist for specific skin conditions.
          </p>
          <h2 className="font-serif text-2xl text-forest mt-8 mb-4">Returns</h2>
          <p className="text-muted leading-relaxed">
            Unopened products may be returned within 14 days of delivery. Contact hello@kindskin.co to initiate a return.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
