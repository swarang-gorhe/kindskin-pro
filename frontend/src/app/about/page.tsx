import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "About KindSkin Co. — simple, honest, nature-inspired skincare. The Kind Way To Glow.",
};

const values = [
  { emoji: "🌿", title: "Natural Ingredients" },
  { emoji: "🌱", title: "Handmade with Care" },
  { emoji: "🐇", title: "Cruelty-Free" },
  { emoji: "♻️", title: "Eco-Friendly" },
  { emoji: "✨", title: "Honest Formulations" },
  { emoji: "❤️", title: "Customer First" },
];

const whyChoose = [
  "Carefully selected natural ingredients",
  "Small-batch handcrafted products",
  "Gentle on all skin types",
  "Affordable everyday skincare",
  "Clean, minimal formulations",
  "Inspired by traditional wellness",
  "Made with love and care",
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sage/5 to-cream" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <FadeIn>
            <p className="section-label mb-4">The Kind Way To Glow.</p>
            <h1 className="font-serif text-4xl md:text-6xl text-forest">Our Story</h1>
            <p className="mt-3 text-lg text-muted">About KindSkin Co.</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 items-start">
          <FadeIn>
            <div className="card-soft p-3">
              <Image
                src="/images/about-story.jpg"
                alt="KindSkin Co. natural skincare products"
                width={348}
                height={231}
                quality={95}
                className="w-full h-auto rounded-xl"
                sizes="(max-width: 768px) 100vw, 540px"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                At KindSkin Co., we believe skincare should be simple, honest, and inspired by
                nature.
              </p>
              <p>
                Our journey began with a simple idea—to create everyday skincare products made with
                thoughtfully selected ingredients that are gentle on your skin and kind to the
                environment. We focus on handcrafted formulations that combine the goodness of
                nature with modern simplicity, making quality skincare accessible to everyone.
              </p>
              <p>
                Every product is carefully prepared in small batches to maintain freshness and
                consistency. From soothing Aloe Vera Gel to nourishing Lip Balms and traditional
                Abhyang Massage Oil, each product is designed to become a part of your daily
                self-care ritual.
              </p>
              <p>
                We don&apos;t believe in complicated routines or unnecessary ingredients. We believe
                in products that work, ingredients you can trust, and skincare that feels good
                every single day.
              </p>
              <p className="font-serif text-lg text-forest italic">
                Because healthy skin starts with kindness.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-12 bg-cream-dark/60">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-10">
          <FadeIn>
            <div className="card-soft p-8">
              <p className="section-label mb-2">Purpose</p>
              <h2 className="font-serif text-2xl text-forest mb-4">Our Mission</h2>
              <p className="text-muted leading-relaxed">
                To create affordable, nature-inspired skincare products that promote healthy skin
                while embracing simplicity, quality, and sustainability.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="card-soft p-8">
              <p className="section-label mb-2">Future</p>
              <h2 className="font-serif text-2xl text-forest mb-4">Our Vision</h2>
              <p className="text-muted leading-relaxed">
                To become a trusted Indian skincare brand known for natural formulations, ethical
                practices, and products that make self-care accessible to everyone.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center mb-10">
            <h2 className="font-serif text-3xl text-forest">Our Values</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {values.map((v) => (
              <FadeIn key={v.title}>
                <div className="card-soft p-6 text-center hover:shadow-md transition-shadow">
                  <span className="text-2xl">{v.emoji}</span>
                  <h3 className="mt-3 text-sm font-semibold text-forest">{v.title}</h3>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-forest/5">
        <div className="mx-auto max-w-4xl px-6">
          <FadeIn className="text-center mb-10">
            <h2 className="font-serif text-3xl text-forest">Why Choose KindSkin Co.?</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-3">
            {whyChoose.map((item) => (
              <FadeIn key={item}>
                <div className="flex items-center gap-3 rounded-xl bg-white border border-forest/5 px-4 py-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage shrink-0" />
                  <span className="text-sm text-forest/85">{item}</span>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center mt-10">
            <Link href="/products">
              <Button size="lg">Shop Collection</Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
