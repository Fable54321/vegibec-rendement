import { createContext, useContext } from "react";

export type SupervisorType = { supervisor: string };

export interface SupervisorsContextType {
  supervisors: SupervisorType[];
  loading: boolean;
  error: string | null;
  refreshSupervisors: () => void;
}

export const SupervisorsContext = createContext<SupervisorsContextType>({
  supervisors: [],
  loading: false,
  error: null,
  refreshSupervisors: () => {},
});
export const useSupervisors = () => {
  const context = useContext(SupervisorsContext);
  if (!context) {
    throw new Error("useSupervisors must be used within a SupervisorsProvider");
  }
  return context;
};
