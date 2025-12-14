import { createContext } from "react";
import type { UnitsContextType } from "./units.context.types";

export const UnitsContext = createContext<UnitsContextType>({
  totals: [],
  unitsLoading: false,
  unitsError: null,
  refreshTotals: async () => {},
});
