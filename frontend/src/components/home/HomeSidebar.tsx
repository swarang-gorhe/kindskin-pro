import { Leaf, HandHeart, ShieldCheck, IndianRupee } from "lucide-react";
import { TestimonialsCarousel } from "./TestimonialsCarousel";
import { NewsletterSection } from "./NewsletterSection";
import { FadeIn } from "@/components/ui/FadeIn";

const pillars = [
  {
    icon: Leaf,
    title: "Inspired by Nature",
    desc: "Pure botanical ingredients sourced with care.",
  },
  {
    icon: HandHeart,
    title: "Made with Love",
    desc: "Handcrafted in small batches for freshness.",
  },
  {
    icon: ShieldCheck,
    title: "Clean & Safe",
    desc: "No parabens, sulfates, or harsh chemicals.",
  },
  {
    icon: IndianRupee,
    title: "Affordable Self Care",
    desc: "Premium quality at prices that feel kind.",
  },
];

export function HomeSidebar() {
  return (
    <aside className="space-y-8">
      <FadeIn>
        <div className="card-soft p-6 space-y-5">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-dark">
                <Icon className="h-4 w-4 text-sage" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-forest">{title}</h3>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="card-soft p-6">
          <TestimonialsCarousel compact />
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <NewsletterSection compact />
      </FadeIn>
    </aside>
  );
}
