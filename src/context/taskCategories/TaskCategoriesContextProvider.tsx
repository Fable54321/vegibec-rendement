import { useEffect, useState, type ReactNode } from "react";
import { TaskCategoriesContext } from "./TaskCategoriesContext";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import type { TaskCategory, TaskSubcategory } from "./TaskCategoriesContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

interface Props {
    children: ReactNode;
}

export const TaskCategoriesContextProvider = ({ children }: Props) => {
    const { token } = useAuth();

    const [categories, setCategories] = useState<TaskCategory[]>([]);
    const [subcategories, setSubcategories] = useState<TaskSubcategory[]>([]);

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        if (!token) return;

        setLoadingCategories(true);
        setError(null);

        try {
            const data = await fetchWithAuth<TaskCategory[]>(
                `${API_BASE_URL}/task-categories`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
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
        if (!token) return;

        setLoadingSubcategories(true);
        setError(null);

        try {
            const data = await fetchWithAuth<TaskSubcategory[]>(
                `${API_BASE_URL}/task-categories/${categoryId}/subcategories`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
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
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

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
