import { createContext, useContext } from "react";

export interface FieldsContextType {
  fields: { field: string }[];
  loading: boolean;
  error: string | null;
  refreshFields: () => Promise<void>;
}

export const FieldsContext = createContext<FieldsContextType | undefined>(
  undefined
);

export const useFields = () => {
  const context = useContext(FieldsContext);
  if (!context) {
    throw new Error("useFields must be used within a FieldsProvider");
  }
  return context;
};
