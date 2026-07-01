"use client";

import { products } from "@/data/products";
import { useQuizStore } from "@/store/quiz";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { Sparkles } from "lucide-react";

export default function QuizResultsPage() {
  const { result } = useQuizStore();

  const displayResult = result || {
    products: [products[0]],
    rationale:
      "Based on your responses, we recommend starting with our Aloe Vera Gel for gentle, daily hydration.",
    tips: ["Apply on damp skin for best absorption."],
    aiAssisted: false,
  };

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <FadeIn className="text-center mb-12">
          <Sparkles className="h-8 w-8 text-sage mx-auto mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl text-forest">
            Your Personalized Recommendations
          </h1>
          {displayResult.aiAssisted && (
            <p className="mt-2 text-xs text-muted">AI-assisted analysis</p>
          )}
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl bg-cream-dark p-8 mb-12">
            <p className="text-forest leading-relaxed text-lg">
              {displayResult.rationale}
            </p>
            {displayResult.tips.length > 0 && (
              <ul className="mt-4 space-y-2">
                {displayResult.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage mt-2 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          {displayResult.products.map((product) => (
            <FadeIn key={product.id}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>

        <FadeIn className="text-center">
          <Link href="/products">
            <Button variant="outline" size="lg">
              Browse All Products
            </Button>
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}
