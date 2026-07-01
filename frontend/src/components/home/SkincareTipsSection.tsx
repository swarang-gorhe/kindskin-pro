import Link from "next/link";
import Image from "next/image";
import { articles } from "@/data/articles";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";

export function SkincareTipsSection() {
  const tips = articles.slice(0, 4);

  return (
    <section className="py-10 md:py-14 border-t border-forest/5">
      <FadeIn className="flex items-end justify-between mb-8">
        <div>
          <h2 className="section-label">From the Hub</h2>
          <p className="font-serif text-2xl md:text-3xl text-forest mt-1">Skincare Tips</p>
        </div>
        <Link
          href="/learn"
          className="text-xs font-semibold uppercase tracking-wider text-forest hover:text-sage transition-colors"
        >
          View All Tips →
        </Link>
      </FadeIn>

      <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tips.map((article) => (
          <StaggerItem key={article.slug}>
            <Link
              href={`/learn/${article.slug}`}
              className="group block card-soft overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="overflow-hidden bg-white p-2">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  width={322}
                  height={274}
                  quality={95}
                  className="w-full h-auto rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 50vw, 240px"
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-forest line-clamp-2 group-hover:text-sage transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs text-muted">
                  {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
