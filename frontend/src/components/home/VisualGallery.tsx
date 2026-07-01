import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";

const graphics = [
  {
    image: "/images/featured/clean-ingredients.jpg",
    title: "Clean Ingredients",
    desc: "No harmful chemicals. No compromises.",
  },
  {
    image: "/images/featured/skincare-quiz.jpg",
    title: "Personalized Care",
    desc: "Find your perfect skincare match.",
  },
  {
    image: "/images/featured/routine.jpg",
    title: "Simple Rituals",
    desc: "Morning and night routines made easy.",
  },
  {
    image: "/images/featured/tech-nature.jpg",
    title: "Nature + Science",
    desc: "Traditional wellness, modern simplicity.",
  },
];

export function VisualGallery() {
  return (
    <section className="py-12 md:py-16 border-t border-forest/5">
      <FadeIn className="mb-8 text-center">
        <p className="section-label">Skincare, Reimagined</p>
        <h2 className="font-serif text-2xl md:text-3xl text-forest mt-2">
          Thoughtful Care at Every Step
        </h2>
      </FadeIn>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {graphics.map((item, i) => (
          <FadeIn key={item.title} delay={i * 0.08}>
            <div className="group card-soft overflow-hidden hover:shadow-lg transition-shadow">
              <div className="overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={349}
                  height={231}
                  quality={95}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-forest">{item.title}</h3>
                <p className="mt-1 text-xs text-muted">{item.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
