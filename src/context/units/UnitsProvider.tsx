// UnitsProvider.tsx
import React, { useState, useEffect } from "react";
import { UnitsContext } from "./UnitsContext";
import type { UnitsItem } from "./units.context.types";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useDate } from "../date/DateContext";
import { useAuth } from "../AuthContext";

interface UnitsProviderProps {
    children: React.ReactNode;
    defaultStart?: string;
    defaultEnd?: string;
}

export const UnitsProvider: React.FC<UnitsProviderProps> = ({
    children,
}) => {

    const [totals, setTotals] = useState<UnitsItem[]>([]);
    const [unitsLoading, setUnitsLoading] = useState(false);
    const [unitsError, setUnitsError] = useState<string | null>(null);

    const { startDate, endDate } = useDate();

    const { user, loading: authLoading, authChecked } = useAuth();

    const fetchTotals = async () => {

        if (!startDate || !endDate) {
            setUnitsError("Missing date range");
            return;
        }

        setUnitsLoading(true);
        setUnitsError(null);

        try {
            const data = (await fetchWithAuth(
                `/units/totals?start=${startDate}&end=${endDate}`,

            )) as { success: boolean; totals: UnitsItem[] };

            if (!data.success) throw new Error("Failed to fetch totals");

            setTotals(data.totals);
        } catch (err: unknown) {
            console.error("Error fetching units totals:", err);
            const message = err instanceof Error ? err.message : "Unknown error";
            alert(`Erreur serveur ❌: ${message}`);
            setUnitsError(message);
        } finally {
            setUnitsLoading(false);
        }
    };

    useEffect(() => {

        if (authLoading || !authChecked || !user) {
            return;
        }

        if (startDate && endDate) {
            fetchTotals();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, user, authLoading, authChecked]);

    return (
        <UnitsContext.Provider
            value={{ totals, unitsLoading, unitsError, refreshTotals: fetchTotals }}
        >
            {children}
        </UnitsContext.Provider>
    );
};
