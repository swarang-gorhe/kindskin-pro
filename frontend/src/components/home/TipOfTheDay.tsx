"use client";

import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { usePersonalizationStore } from "@/store/personalization";
import { FadeIn } from "@/components/ui/FadeIn";

const defaultTips = [
  "Apply Aloe Vera gel on damp skin to lock in extra hydration.",
  "Your lips have no oil glands — apply balm before bed for overnight repair.",
  "Warm your Abhyang Tel slightly before self-massage for deeper absorption.",
  "Less is more: three consistent products beat a cabinet of half-used bottles.",
];

export function TipOfTheDay() {
  const { tipOfTheDay, setTipOfTheDay, lastQuizResult } = usePersonalizationStore();

  useEffect(() => {
    if (tipOfTheDay) return;
    const tip = lastQuizResult?.tips?.[0] ||
      defaultTips[Math.floor(Math.random() * defaultTips.length)];
    setTipOfTheDay(tip);
  }, [tipOfTheDay, lastQuizResult, setTipOfTheDay]);

  if (!tipOfTheDay) return null;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          <div className="flex items-start gap-4 rounded-2xl bg-cream-dark p-6 md:p-8">
            <Sparkles className="h-5 w-5 text-sage shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-widest text-sage mb-2">
                Tip of the Day
                {lastQuizResult && " · Personalized"}
              </p>
              <p className="text-forest leading-relaxed">{tipOfTheDay}</p>
              <p className="mt-2 text-xs text-muted">AI-assisted recommendation</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
