import { useEffect, useState, type ReactNode } from "react";
import { SupervisorsContext, type SupervisorType } from "./SupervisorContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";




export const SupervisorsProvider = ({ children }: { children: ReactNode }) => {


    const [supervisors, setSupervisors] = useState<SupervisorType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSupervisors = async () => {


        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth<SupervisorType[]>(
                `/supervisors/get`,

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
    }, []);

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
