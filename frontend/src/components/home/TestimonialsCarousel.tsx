"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { FadeIn } from "@/components/ui/FadeIn";

export function TestimonialsCarousel({ compact = false }: { compact?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (paused || compact) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, compact]);

  const t = testimonials[current];

  const content = (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {!compact && (
        <FadeIn className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl text-forest">Customer Stories</h2>
        </FadeIn>
      )}

      {compact && (
        <p className="section-label mb-4">What Our Customers Say</p>
      )}

      <div className={compact ? "text-left" : "flex flex-col items-center text-center px-8"}>
        {!compact && (
          <div className="relative h-16 w-16 rounded-full overflow-hidden mb-6 bg-sage/20">
            <Image src={t.image} alt={t.name} fill className="object-cover" sizes="64px" />
          </div>
        )}

        <div className={`flex gap-0.5 ${compact ? "mb-3" : "mb-4 justify-center"}`}>
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} fill-terracotta text-terracotta`} />
          ))}
        </div>

        <blockquote className={`text-forest leading-relaxed ${compact ? "text-sm font-normal" : "font-serif text-xl md:text-2xl max-w-2xl"}`}>
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        <div className={`flex items-center gap-2 ${compact ? "mt-3" : "mt-6 justify-center"}`}>
          <p className={`font-medium text-forest ${compact ? "text-xs" : "text-sm"}`}>{t.name}</p>
          {!compact && (
            <>
              <span className="text-muted">·</span>
              <p className="text-sm text-muted">{t.location}</p>
            </>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-3 ${compact ? "mt-4 justify-between" : "justify-center mt-8"}`}>
        <button
          onClick={prev}
          className="p-1.5 rounded-full border border-forest/10 hover:bg-cream-dark transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4 text-forest" />
        </button>
        <div className="flex items-center gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-5 bg-forest" : "w-1.5 bg-forest/20"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="p-1.5 rounded-full border border-forest/10 hover:bg-cream-dark transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4 text-forest" />
        </button>
      </div>
    </div>
  );

  if (compact) return content;

  return (
    <section className="py-24 md:py-32 bg-cream-dark">
      <div className="mx-auto max-w-4xl px-6">{content}</div>
    </section>
  );
}
