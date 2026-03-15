import { useEffect, useState, type ReactNode } from "react";
import { TaskCategoriesContext } from "./TaskCategoriesContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import type { TaskCategory, TaskSubcategory } from "./TaskCategoriesContext";
import { useAuth } from "../AuthContext";



interface Props {
    children: ReactNode;
}

export const TaskCategoriesContextProvider = ({ children }: Props) => {


    const [categories, setCategories] = useState<TaskCategory[]>([]);
    const [subcategories, setSubcategories] = useState<TaskSubcategory[]>([]);

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user, loading: authLoading, authChecked } = useAuth();

    const fetchCategories = async () => {


        setLoadingCategories(true);
        setError(null);

        try {
            const data = await fetchWithAuth<TaskCategory[]>(
                `/task-categories`,

            );

            setCategories(data);
        } catch (err) {
            console.error("Error fetching task categories:", err);
            setError("Failed to fetch task categories");
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSubcategories = async (categoryId: number) => {


        setLoadingSubcategories(true);
        setError(null);

        try {
            const data = await fetchWithAuth<TaskSubcategory[]>(
                `/task-categories/${categoryId}/subcategories`,

            );

            setSubcategories(data);
        } catch (err) {
            console.error("Error fetching task subcategories:", err);
            setError("Failed to fetch task subcategories");
        } finally {
            setLoadingSubcategories(false);
        }
    };

    useEffect(() => {

        if (!authChecked || authLoading || !user) {
            return;
        }

        fetchCategories();

    }, [authChecked, authLoading, user]);

    return (
        <TaskCategoriesContext.Provider
            value={{
                categories,
                subcategories,
                loadingCategories,
                loadingSubcategories,
                error,
                fetchSubcategories,
                fetchCategories,
            }}
        >
            {children}
        </TaskCategoriesContext.Provider>
    );
};
