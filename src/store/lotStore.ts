import { create } from "zustand";
import type { Lot, ScoringResult } from "@/lib/mockData";

interface LotFormData {
  producerName: string;
  location: string;
  latitude: string;
  longitude: string;
  areaSembrada: string;
  cacaoType: "CCN-51" | "Fino de Aroma" | "Trinitario" | "";
  treeAge: string;
  estimatedHarvestDate: string;
}

interface LotStore {
  currentLot: LotFormData;
  registeredLots: Lot[];
  currentScoring: ScoringResult | null;
  step: "form" | "scoring" | "vpc_issued";
  setCurrentLot: (data: Partial<LotFormData>) => void;
  setStep: (step: "form" | "scoring" | "vpc_issued") => void;
  setCurrentScoring: (scoring: ScoringResult | null) => void;
  resetForm: () => void;
}

const initialForm: LotFormData = {
  producerName: "",
  location: "",
  latitude: "",
  longitude: "",
  areaSembrada: "",
  cacaoType: "",
  treeAge: "",
  estimatedHarvestDate: "",
};

export const useLotStore = create<LotStore>((set) => ({
  currentLot: initialForm,
  registeredLots: [],
  currentScoring: null,
  step: "form",
  setCurrentLot: (data) =>
    set((state) => ({ currentLot: { ...state.currentLot, ...data } })),
  setStep: (step) => set({ step }),
  setCurrentScoring: (scoring) => set({ currentScoring: scoring }),
  resetForm: () => set({ currentLot: initialForm, step: "form", currentScoring: null }),
}));
