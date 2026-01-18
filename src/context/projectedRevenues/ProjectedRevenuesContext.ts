import { createContext, useContext } from "react";

export interface ProjectedRevenue {
  vegetable: string;
  year: number;
  projected_revenue: number;
}

export interface ProjectedRevenuesContextType {
  projectedRevenues: ProjectedRevenue[];
  loading: boolean;
  error: string | null;
  refreshProjectedRevenues: () => Promise<void>;
}

export const ProjectedRevenuesContext = createContext<
  ProjectedRevenuesContextType | undefined
>(undefined);

export const useProjectedRevenues = () => {
  const context = useContext(ProjectedRevenuesContext);
  if (!context) {
    throw new Error(
      "useProjectedRevenues must be used within a ProjectedRevenuesProvider"
    );
  }
  return context;
};
