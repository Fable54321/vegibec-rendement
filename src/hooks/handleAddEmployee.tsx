import { useState } from "react";
import { useEmployees } from "@/context/employees/EmployeesContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type AddedEmployeeResponse = {
    id?: number;
    name?: string;
    message?: string;
};

export const useAddEmployee = () => {
    const { refetchEmployees } = useEmployees();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddEmployee = async (name: string) => {
        if (!name.trim()) {
            setError("Employee name cannot be empty");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const addedEmployee = await fetchWithAuth<AddedEmployeeResponse>("/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                }),
            });

            console.log("Added employee:", addedEmployee);

            await refetchEmployees();
        } catch (err: unknown) {
            console.error("Error adding employee:", err);
            setError(err instanceof Error ? err.message : "Failed to add employee");
        } finally {
            setLoading(false);
        }
    };

    return { handleAddEmployee, loading, error };
};