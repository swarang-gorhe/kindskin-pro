import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";

export function FeaturedSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="card-soft overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <FadeIn>
            <div className="relative p-2 md:p-3">
              <Image
                src="/images/featured/nature-science.jpg"
                alt="KindSkin products — nature meets science"
                width={348}
                height={231}
                quality={95}
                className="w-full h-auto rounded-xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="p-8 md:p-12">
            <p className="section-label mb-3">Featured</p>
            <h2 className="font-serif text-2xl md:text-3xl text-forest leading-snug">
              Nature&apos;s Goodness in Every Jar
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Every KindSkin Co. product is crafted with care using thoughtfully selected
              ingredients, helping you embrace healthy skincare through simple daily rituals.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Pure Aloe Vera", "Nourishing Oils", "Handmade Balms"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cream-dark px-3 py-1 text-xs font-medium text-forest/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
