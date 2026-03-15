import { useEffect, useState, type ReactNode } from "react";
import { FieldsContext } from "./FieldsContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "../AuthContext";




export const FieldsProvider = ({ children }: { children: ReactNode }) => {


    const [fields, setFields] = useState<({ field: string })[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user, loading: authLoading, authChecked } = useAuth();

    const fetchFields = async () => {


        setLoading(true);
        setError(null);

        try {
            const res = await fetchWithAuth<({ field: string })[]>(
                `/getFields`,
            );

            setFields(res);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (!authChecked || !user || authLoading) {
            return;
        }

        fetchFields();
    }, [authChecked, authLoading, user]);

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
