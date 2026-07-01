import type { Metadata } from "next";
import { QuizFlow } from "@/components/quiz/QuizFlow";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Skincare Quiz",
  description: "Take our personalized skincare quiz to find the perfect KindSkin products for your skin.",
};

export default function QuizPage() {
  return (
    <div>
      <div className="py-12 text-center">
        <FadeIn>
          <h1 className="font-serif text-4xl md:text-5xl text-forest">
            Find Your Perfect Match
          </h1>
          <p className="mt-4 text-muted max-w-md mx-auto">
            Answer a few questions and we&apos;ll recommend the KindSkin products best suited for your skin.
          </p>
        </FadeIn>
      </div>
      <QuizFlow />
    </div>
  );
}
