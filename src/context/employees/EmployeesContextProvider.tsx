import { useEffect, useState, type ReactNode } from "react";
import { EmployeesContext } from "./EmployeesContext";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

interface Props {
    children: ReactNode;
}

export const EmployeesContextProvider = ({ children }: Props) => {
    const { token } = useAuth();

    const [employees, setEmployees] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const data: string[] = await fetchWithAuth(
                `${API_BASE_URL}/employees`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

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
