"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useQuizStore } from "@/store/quiz";
import { usePersonalizationStore } from "@/store/personalization";
import { apiFetch } from "@/lib/api";
import type { QuizAnswers, QuizRecommendation } from "@/lib/types";

const steps = [
  {
    key: "skinType" as const,
    question: "What's your skin type?",
    options: [
      { value: "dry", label: "Dry", desc: "Tight, flaky, needs moisture" },
      { value: "oily", label: "Oily", desc: "Shiny T-zone, enlarged pores" },
      { value: "combination", label: "Combination", desc: "Oily T-zone, dry cheeks" },
      { value: "sensitive", label: "Sensitive", desc: "Easily irritated, reactive" },
      { value: "normal", label: "Normal", desc: "Balanced, few concerns" },
    ],
  },
  {
    key: "mainConcern" as const,
    question: "What's your main concern?",
    options: [
      { value: "hydration", label: "Hydration", desc: "Dry, dehydrated skin" },
      { value: "lip-care", label: "Lip Care", desc: "Dry, cracked lips" },
      { value: "relaxation", label: "Relaxation", desc: "Stress, body tension" },
      { value: "aging", label: "Anti-Aging", desc: "Fine lines, loss of firmness" },
      { value: "irritation", label: "Irritation", desc: "Redness, sensitivity" },
    ],
  },
  {
    key: "desiredGoal" as const,
    question: "What's your skincare goal?",
    options: [
      { value: "daily-routine", label: "Daily Routine", desc: "Simple, consistent care" },
      { value: "intensive-care", label: "Intensive Care", desc: "Targeted treatment" },
      { value: "natural-glow", label: "Natural Glow", desc: "Healthy, radiant skin" },
      { value: "self-care-ritual", label: "Self-Care Ritual", desc: "Mindful wellness practice" },
    ],
  },
];

export function QuizFlow() {
  const router = useRouter();
  const { answers, setAnswer, setResult } = useQuizStore();
  const { setLastQuizResult } = usePersonalizationStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(answers.additionalNotes || "");

  const current = steps[step];
  const progress = ((step + 1) / (steps.length + 1)) * 100;

  async function handleFinish() {
    setLoading(true);
    const fullAnswers: QuizAnswers = {
      skinType: answers.skinType || "",
      mainConcern: answers.mainConcern || "",
      desiredGoal: answers.desiredGoal || "",
      additionalNotes: notes || undefined,
    };

    try {
      const result = await apiFetch<QuizRecommendation>("/api/quiz/recommend", {
        method: "POST",
        body: JSON.stringify(fullAnswers),
      });
      setResult(result);
      setLastQuizResult(result);
      router.push("/quiz/results");
    } catch {
      router.push("/quiz/results");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col">
      {/* Progress */}
      <div className="w-full bg-cream-dark h-1">
        <div
          className="h-full bg-forest transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {step < steps.length ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-sage uppercase tracking-widest mb-2">
                  Step {step + 1} of {steps.length}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-forest mb-8">
                  {current.question}
                </h2>

                <div className="space-y-3">
                  {current.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswer(current.key, opt.value)}
                      className={`w-full text-left p-5 rounded-xl border transition-all ${
                        answers[current.key] === opt.value
                          ? "border-forest bg-forest/5 shadow-sm"
                          : "border-forest/10 hover:border-forest/30 hover:bg-white"
                      }`}
                    >
                      <span className="font-medium text-forest">{opt.label}</span>
                      <span className="block text-sm text-muted mt-1">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="notes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-sm text-sage uppercase tracking-widest mb-2">
                  Optional
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-forest mb-4">
                  Tell us more about your skin
                </h2>
                <p className="text-muted mb-6">
                  Any specific concerns or preferences? This helps us personalize your recommendations.
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., I have rosacea and prefer fragrance-free products..."
                  rows={4}
                  className="w-full rounded-xl border border-forest/10 bg-white p-4 text-sm text-forest placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest/20 resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            <Button
              variant="ghost"
              onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            {step < steps.length ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!answers[current.key]}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading}>
                {loading ? "Analyzing..." : "Get Recommendations"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
