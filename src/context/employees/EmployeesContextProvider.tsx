import { useEffect, useState, type ReactNode } from "react";
import { EmployeesContext } from "./EmployeesContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";



interface Props {
    children: ReactNode;
}

export const EmployeesContextProvider = ({ children }: Props) => {


    const [employees, setEmployees] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = async () => {


        setLoading(true);
        setError(null);

        try {
            const data: string[] = await fetchWithAuth(
                `/employees`,

            );

            setEmployees(data);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError("Failed to fetch employees");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();

    }, []);

    return (
        <EmployeesContext.Provider
            value={{
                employees,
                loading,
                error,
                refetchEmployees: fetchEmployees,
            }}
        >
            {children}
        </EmployeesContext.Provider>
    );
};
