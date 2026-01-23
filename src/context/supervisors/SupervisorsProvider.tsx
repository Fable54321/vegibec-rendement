import { useEffect, useState, type ReactNode } from "react";
import { SupervisorsContext, type SupervisorType } from "./SupervisorContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export const SupervisorsProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();

    const [supervisors, setSupervisors] = useState<SupervisorType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSupervisors = async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth<SupervisorType[]>(
                `${API_BASE_URL}/supervisors/get`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSupervisors(res);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupervisors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <SupervisorsContext.Provider
            value={{
                supervisors,
                loading,
                error,
                refetchSupervisors: fetchSupervisors,
            }}
        >
            {children}
        </SupervisorsContext.Provider>
    );
};
