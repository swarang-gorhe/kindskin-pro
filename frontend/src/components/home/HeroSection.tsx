import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { Leaf, Heart, HandHeart, Shield, Recycle } from "lucide-react";

const badges = [
  { icon: Leaf, label: "Natural Ingredients" },
  { icon: Heart, label: "Cruelty Free" },
  { icon: HandHeart, label: "Handmade with Care" },
  { icon: Shield, label: "Gentle on Skin" },
  { icon: Recycle, label: "Eco Friendly Packaging" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-cream-dark">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0.02),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeIn>
            <p className="section-label mb-4">The Kind Way To Glow.</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] text-forest leading-[1.08] tracking-tight">
              Kind to Nature.
              <br />
              Kind to Your Skin.
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted max-w-lg leading-relaxed">
              Discover handcrafted skincare inspired by nature. Thoughtfully made with carefully
              selected ingredients to bring simplicity, nourishment, and everyday self-care into
              your routine.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="uppercase tracking-widest text-sm px-8">
                  Shop Collection
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="uppercase tracking-widest text-sm px-8">
                  Explore Our Story
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-5 gap-y-3">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-forest/75">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm border border-forest/5">
                    <Icon className="h-3.5 w-3.5 text-sage" strokeWidth={1.5} />
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.12} className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(45,62,47,0.15)] ring-1 ring-forest/8 bg-white p-1">
              <Image
                src="/images/hero.jpg"
                alt="KindSkin Co. Aloe Vera Gel, Lip Balm, and Abhyang Tel"
                width={348}
                height={231}
                quality={95}
                priority
                className="w-full h-auto rounded-xl"
                sizes="(max-width: 1024px) 100vw, 540px"
              />
            </div>
            <div className="absolute -z-10 -bottom-6 -left-6 h-40 w-40 rounded-full bg-terracotta/10 blur-3xl" />
            <div className="absolute -z-10 -top-8 -right-8 h-48 w-48 rounded-full bg-sage/15 blur-3xl" />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
