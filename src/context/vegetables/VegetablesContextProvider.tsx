import { useEffect, useState, type ReactNode } from "react";
import { VegetablesContext, type Vegetable } from "./VegetablesContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";




export const VegetablesProvider = ({ children }: { children: ReactNode }) => {


    const [vegetables, setVegetables] = useState<Vegetable[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVegetables = async () => {

        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth<Vegetable[]>(
                `/vegetables`,

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

    }, []);

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
