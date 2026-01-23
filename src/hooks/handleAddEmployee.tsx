import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useEmployees } from "@/context/employees/EmployeesContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export const useAddEmployee = () => {
    const { token } = useAuth();
    const { refetchEmployees } = useEmployees();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddEmployee = async (name: string) => {
        if (!name.trim()) {
            setError("Employee name cannot be empty");
            return;
        }

        if (!token) {
            setError("User not authenticated");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/employees`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to add employee");
            }

            // Optional: get returned name
            const addedEmployee = await response.json();
            console.log("Added employee:", addedEmployee);

            // Refetch employees list in context
            await refetchEmployees();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Error adding employee:", err);
            setError(err.message || "Failed to add employee");
        } finally {
            setLoading(false);
        }
    };

    return { handleAddEmployee, loading, error };
};
