"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { articles, articleCategories } from "@/data/articles";
import { FadeIn } from "@/components/ui/FadeIn";
import type { ArticleCategory } from "@/lib/types";

export default function LearnPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ArticleCategory | "All">("All");

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || a.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl text-forest">
            Skincare Knowledge Hub
          </h1>
          <p className="mt-4 text-lg text-muted max-w-lg">
            Expert guides on ingredients, routines, and Ayurvedic wisdom.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-full border border-forest/10 bg-white pl-11 pr-5 py-3 text-sm text-forest placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest/20"
              aria-label="Search articles"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("All")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                category === "All"
                  ? "bg-forest text-cream"
                  : "bg-cream-dark text-muted hover:text-forest"
              }`}
            >
              All
            </button>
            {articleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  category === cat
                    ? "bg-forest text-cream"
                    : "bg-cream-dark text-muted hover:text-forest"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {filtered.map((article) => (
            <FadeIn key={article.slug}>
              <Link
                href={`/learn/${article.slug}`}
                className="group flex flex-col rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="overflow-hidden bg-cream-dark">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    width={322}
                    height={274}
                    quality={95}
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs uppercase tracking-widest text-sage">
                    {article.category}
                  </span>
                  <h2 className="font-serif text-xl text-forest mt-2 group-hover:text-terracotta transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted line-clamp-2 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                    <span>{article.author}</span>
                    <span>·</span>
                    <span>{article.readingTime} min read</span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted py-12">No articles found. Try a different search.</p>
        )}
      </div>
    </div>
  );
}
