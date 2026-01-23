import { createContext, useContext } from "react";

export interface EmployeesContextType {
  employees: string[];
  loading: boolean;
  error: string | null;
  refetchEmployees: () => Promise<void>;
}

export const EmployeesContext = createContext<EmployeesContextType | undefined>(
  undefined,
);

export const useEmployees = (): EmployeesContextType => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error(
      "useEmployees must be used within an EmployeesContextProvider",
    );
  }
  return context;
};
