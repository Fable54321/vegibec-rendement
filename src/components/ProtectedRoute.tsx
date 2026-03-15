// src/components/ProtectedRoute.tsx
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            window.location.replace("https://vegibec-portail.com/");
        }
    }, [user, loading]);

    if (loading) return <div>Loading...</div>;

    if (!user) return null; // redirect in progress

    return children;
};

export default ProtectedRoute;