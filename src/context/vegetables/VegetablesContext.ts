import { createContext, useContext } from "react";

export interface VegetablesContextType {
  vegetables: {
    vegetable: string;
    is_generic: boolean;
    generic_group: string;
  }[];
  loading: boolean;
  error: string | null;
  refreshVegetables: () => Promise<void>;
}

export const VegetablesContext = createContext<
  VegetablesContextType | undefined
>(undefined);

export const useVegetables = () => {
  const context = useContext(VegetablesContext);
  if (!context) {
    throw new Error("useVegetables must be used within a VegetablesProvider");
  }
  return context;
};
