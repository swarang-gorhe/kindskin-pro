import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizAnswers, QuizRecommendation } from "@/lib/types";

type QuizStore = {
  answers: Partial<QuizAnswers>;
  result: QuizRecommendation | null;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  setResult: (result: QuizRecommendation) => void;
  reset: () => void;
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      answers: {},
      result: null,
      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
        })),
      setResult: (result) => set({ result }),
      reset: () => set({ answers: {}, result: null }),
    }),
    { name: "kindskin-quiz" }
  )
);
