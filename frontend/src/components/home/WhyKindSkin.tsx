import {
  Leaf,
  HandHeart,
  ShieldOff,
  Heart,
  IndianRupee,
  Recycle,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";

const features = [
  { icon: Leaf, label: "Natural Ingredients" },
  { icon: HandHeart, label: "Handcrafted" },
  { icon: ShieldOff, label: "No Harmful Chemicals" },
  { icon: Heart, label: "Cruelty Free" },
  { icon: IndianRupee, label: "Affordable" },
  { icon: Recycle, label: "Eco-Friendly Packaging" },
];

export function WhyKindSkin() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-forest">
            Why KindSkin
          </h2>
          <p className="mt-4 text-muted max-w-lg mx-auto">
            Skincare should be simple, honest, and kind — to you and the planet.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {features.map(({ icon: Icon, label }) => (
            <StaggerItem key={label}>
              <div className="flex flex-col items-center text-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-dark">
                  <Icon className="h-6 w-6 text-forest" />
                </div>
                <span className="text-sm font-medium text-forest">{label}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
