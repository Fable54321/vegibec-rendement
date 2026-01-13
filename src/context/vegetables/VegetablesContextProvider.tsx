import { useEffect, useState, type ReactNode } from "react";
import { VegetablesContext } from "./VegetablesContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export const VegetablesProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();

    const [vegetables, setVegetables] = useState<{ vegetable: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVegetables = async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth<{ vegetable: string }[]>(
                `${API_BASE_URL}/vegetables`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setVegetables(res);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVegetables();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <VegetablesContext.Provider
            value={{
                vegetables,
                loading,
                error,
                refreshVegetables: fetchVegetables,
            }}
        >
            {children}
        </VegetablesContext.Provider>
    );
};
