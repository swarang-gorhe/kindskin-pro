"use client";

import { useState } from "react";
import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";

const steps = [
  {
    label: "The Leaf",
    title: "Harvested at dawn",
    description: "Fresh Aloe Barbadensis leaves, hand-picked from organic farms in Rajasthan.",
    image: "/images/ingredient/aloe-leaf.jpg",
  },
  {
    label: "The Extract",
    title: "Cold-pressed purity",
    description: "Extracted at low temperature within 24 hours — preserving every active compound.",
    image: "/images/ingredient/aloe-extract.jpg",
  },
  {
    label: "The Gel",
    title: "Farm to your skin",
    description: "Pure, non-diluted gel — no fillers, no artificial fragrance. Just nature's pharmacy.",
    image: "/images/ingredient/aloe-gel.jpg",
  },
];

export function IngredientStory() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-10 md:py-14">
      <FadeIn className="mb-8">
        <h2 className="section-label">From Leaf to Jar</h2>
        <p className="font-serif text-2xl md:text-3xl text-forest mt-1">The Aloe Vera Journey</p>
      </FadeIn>

      <div className="card-soft overflow-hidden">
        <div className="grid md:grid-cols-2">
          <FadeIn>
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px]">
              <Image
                src={steps[active].image}
                alt={steps[active].title}
                fill
                className="object-cover transition-opacity duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </FadeIn>

          <div className="p-6 md:p-8 space-y-3">
            {steps.map((step, i) => (
              <button
                key={step.label}
                onClick={() => setActive(i)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                  active === i
                    ? "bg-forest/5 border border-forest/10"
                    : "hover:bg-cream-dark"
                }`}
              >
                <span className="text-xs uppercase tracking-widest text-sage">{step.label}</span>
                <h3 className="font-serif text-lg text-forest mt-1">{step.title}</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">{step.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
