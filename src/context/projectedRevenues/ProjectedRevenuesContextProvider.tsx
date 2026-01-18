import { useEffect, useState, type ReactNode } from "react";
import { ProjectedRevenuesContext, type ProjectedRevenue } from "./ProjectedRevenuesContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export const ProjectedRevenuesProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const { token } = useAuth();

    const [projectedRevenues, setProjectedRevenues] = useState<ProjectedRevenue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjectedRevenues = async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth<ProjectedRevenue[]>(
                `${API_BASE_URL}/projected-revenues`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProjectedRevenues(res);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectedRevenues();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <ProjectedRevenuesContext.Provider
            value={{
                projectedRevenues,
                loading,
                error,
                refreshProjectedRevenues: fetchProjectedRevenues,
            }}
        >
            {children}
        </ProjectedRevenuesContext.Provider>
    );
};
