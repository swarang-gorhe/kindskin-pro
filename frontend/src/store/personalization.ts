import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizRecommendation } from "@/lib/types";

type PersonalizationStore = {
  lastQuizResult: QuizRecommendation | null;
  tipOfTheDay: string | null;
  ambientSound: boolean;
  setLastQuizResult: (result: QuizRecommendation) => void;
  setTipOfTheDay: (tip: string) => void;
  toggleAmbientSound: () => void;
};

export const usePersonalizationStore = create<PersonalizationStore>()(
  persist(
    (set) => ({
      lastQuizResult: null,
      tipOfTheDay: null,
      ambientSound: false,
      setLastQuizResult: (result) => set({ lastQuizResult: result }),
      setTipOfTheDay: (tip) => set({ tipOfTheDay: tip }),
      toggleAmbientSound: () =>
        set((state) => ({ ambientSound: !state.ambientSound })),
    }),
    { name: "kindskin-personalization" }
  )
);
