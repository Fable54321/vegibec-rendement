import { createContext } from "react";
import type { UnspecifiedContextType } from "./unspecified.context.types";

// Default values to satisfy TypeScript
export const UnspecifiedContext = createContext<UnspecifiedContextType>({
  data: [],
  unspecifiedLoading: false,
  unspecifiedError: null,
  refreshData: async () => {},
});
