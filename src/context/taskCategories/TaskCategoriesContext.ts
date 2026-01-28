import { createContext, useContext } from "react";

export interface TaskCategory {
  id: number;
  name: string;
}

export interface TaskSubcategory {
  id: number;
  name: string;
  category_id: number;
}

export interface TaskCategoriesContextType {
  categories: TaskCategory[];
  subcategories: TaskSubcategory[];
  loadingCategories: boolean;
  loadingSubcategories: boolean;
  error: string | null;
  fetchSubcategories: (categoryId: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const TaskCategoriesContext = createContext<
  TaskCategoriesContextType | undefined
>(undefined);

export const useTaskCategories = (): TaskCategoriesContextType => {
  const context = useContext(TaskCategoriesContext);
  if (!context) {
    throw new Error(
      "useTaskCategories must be used within a TaskCategoriesContextProvider",
    );
  }
  return context;
};
