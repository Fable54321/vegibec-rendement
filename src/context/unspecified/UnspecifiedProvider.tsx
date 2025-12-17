import React, { useState, useEffect } from "react";
import { UnspecifiedContext } from "./UnspecifiedContext";
import type { UnspecifiedCost } from "./unspecified.context.types";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useDate } from "../date/DateContext";

interface UnspecifiedProviderProps {
    children: React.ReactNode;
}

export const UnspecifiedProvider: React.FC<UnspecifiedProviderProps> = ({ children }) => {
    const { token } = useAuth();
    const { startDate, endDate } = useDate();

    const [data, setData] = useState<UnspecifiedCost[]>([]);
    const [unspecifiedLoading, setUnspecifiedLoading] = useState(false);
    const [unspecifiedError, setUnspecifiedError] = useState<string | null>(null);

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    const fetchData = async () => {
        if (!token) return;

        if (!startDate || !endDate) {
            setUnspecifiedError("Missing date range");
            return;
        }

        setUnspecifiedLoading(true);
        setUnspecifiedError(null);

        try {
            const result = (await fetchWithAuth(
                `${API_BASE_URL}/unspecified/data/costs/unspecified?start=${startDate}&end=${endDate}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )) as UnspecifiedCost[];

            setData(result);
        } catch (err: unknown) {
            console.error("Error fetching unspecified costs:", err);
            const message = err instanceof Error ? err.message : "Unknown error";
            alert(`Erreur serveur ❌: ${message}`);
            setUnspecifiedError(message);
        } finally {
            setUnspecifiedLoading(false);
        }
    };

    useEffect(() => {
        if (token && startDate && endDate) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, startDate, endDate]);

    return (
        <UnspecifiedContext.Provider
            value={{ data, unspecifiedLoading, unspecifiedError, refreshData: fetchData }}
        >
            {children}
        </UnspecifiedContext.Provider>
    );
};
