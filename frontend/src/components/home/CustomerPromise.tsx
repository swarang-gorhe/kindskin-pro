import { FadeIn } from "@/components/ui/FadeIn";

export function CustomerPromise() {
  return (
    <section className="py-12 md:py-16">
      <FadeIn>
        <div className="relative rounded-2xl bg-forest text-cream overflow-hidden px-8 py-10 md:px-12 md:py-14">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sage/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative max-w-3xl">
            <p className="section-label text-sage mb-3">Our Promise</p>
            <h2 className="font-serif text-2xl md:text-3xl leading-snug">
              Skincare with Honesty, Care & Quality
            </h2>
            <p className="mt-4 text-cream/80 leading-relaxed">
              We promise to create skincare products with honesty, care, and attention to quality.
              Every product is made to support your daily routine with gentle, nature-inspired
              formulations you can trust.
            </p>
            <p className="mt-4 font-serif text-lg text-cream/90 italic">
              Because healthy skin starts with kindness.
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
