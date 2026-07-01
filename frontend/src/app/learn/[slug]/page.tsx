import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, articles } from "@/data/articles";
import { FadeIn } from "@/components/ui/FadeIn";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: [{ url: article.coverImage }],
    },
  };
}

function renderContent(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="font-serif text-2xl text-forest mt-10 mb-4">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").map((line) => line.replace("- ", ""));
      return (
        <ul key={i} className="list-disc pl-6 space-y-2 mb-4">
          {items.map((item, j) => (
            <li key={j} className="text-muted leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="text-muted leading-relaxed mb-4">
        {block}
      </p>
    );
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = articles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    author: { "@type": "Organization", name: article.author },
    datePublished: article.publishedAt,
    publisher: { "@type": "Organization", name: "KindSkin Co." },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn>
            <span className="text-xs uppercase tracking-widest text-sage">
              {article.category}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-forest mt-3 leading-tight">
              {article.title}
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted">
              <span>{article.author}</span>
              <span>·</span>
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>·</span>
              <span>{article.readingTime} min read</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-8">
            <div className="rounded-2xl overflow-hidden bg-cream-dark max-w-lg mx-auto">
              <Image
                src={article.coverImage}
                alt={article.title}
                width={322}
                height={274}
                quality={95}
                className="w-full h-auto"
                priority
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-10 prose-content">
            {renderContent(article.content)}
          </FadeIn>
        </div>

        {related.length > 0 && (
          <section className="mt-16 py-16 bg-cream-dark">
            <div className="mx-auto max-w-3xl px-6">
              <h2 className="font-serif text-2xl text-forest mb-8">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {related.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/learn/${a.slug}`}
                    className="group p-6 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <span className="text-xs text-sage uppercase tracking-widest">
                      {a.category}
                    </span>
                    <h3 className="font-serif text-lg text-forest mt-1 group-hover:text-terracotta transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-sm text-muted mt-2 line-clamp-2">{a.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
