import { useEffect, useState, type ReactNode } from "react";
import { ProjectedRevenuesContext, type ProjectedRevenue } from "./ProjectedRevenuesContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";




export const ProjectedRevenuesProvider = ({
    children,
}: {
    children: ReactNode;
}) => {


    const [projectedRevenues, setProjectedRevenues] = useState<ProjectedRevenue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjectedRevenues = async () => {


        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth<ProjectedRevenue[]>(
                `/projected-revenues`,
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

    }, []);

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
