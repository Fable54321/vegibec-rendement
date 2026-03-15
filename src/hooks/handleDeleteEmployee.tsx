import { useState } from "react";

import { useEmployees } from "@/context/employees/EmployeesContext";



export const useDeleteEmployee = () => {

    const { refetchEmployees } = useEmployees();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteEmployee = async (name: string) => {
        if (!name) {
            setError("Employee name is required");
            return;
        }



        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/employees/${encodeURIComponent(name)}`,
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete employee");
            }

            const result = await response.json();
            console.log("Deleted employee:", result.deleted);

            // Refresh employees list
            await refetchEmployees();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Error deleting employee:", err);
            setError(err.message || "Failed to delete employee");
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
