import { useState } from "react";
import { useEmployees } from "@/context/employees/EmployeesContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type DeleteEmployeeResponse = {
    deleted?: string;
    message?: string;
};

export const useDeleteEmployee = () => {
    const { refetchEmployees } = useEmployees();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteEmployee = async (name: string) => {
        if (!name.trim()) {
            setError("Employee name is required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetchWithAuth<DeleteEmployeeResponse>(
                `/employees/${encodeURIComponent(name.trim())}`,
                {
                    method: "DELETE",
                }
            );

            console.log("Deleted employee:", result.deleted);

            await refetchEmployees();
        } catch (err: unknown) {
            console.error("Error deleting employee:", err);
            setError(err instanceof Error ? err.message : "Failed to delete employee");
        } finally {
            setLoading(false);
        }
    };

    return {
        handleDeleteEmployee,
        loading,
        error,
    };
};