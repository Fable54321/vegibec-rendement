import { useEffect, useState, type ReactNode } from "react";
import { FieldsContext } from "./FieldsContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export const FieldsProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();

    const [fields, setFields] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFields = async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth<string[]>(
                `${API_BASE_URL}/getFields`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFields(res);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <FieldsContext.Provider
            value={{
                fields,
                loading,
                error,
                refreshFields: fetchFields,
            }}
        >
            {children}
        </FieldsContext.Provider>
    );
};
