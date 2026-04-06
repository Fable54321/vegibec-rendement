// src/components/ProtectedRoute.tsx
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();

    const { setIsAuthorized } = useAuth();

    const hasAccess = user?.appAccess.some((app) => app.slug === "rendement");

    useEffect(() => {
        if ((!loading && !user) || !hasAccess) {
            alert("Vous n'avez pas les permissions nécessaires pour accéder à cette application.");
            window.location.replace("https://vegibec-portail.com/");
        }
    }, [user, loading, hasAccess]);

    if (loading) return <div>Loading...</div>;

    if (!user) return null; // redirect in progress

    else {
        setIsAuthorized(true);
        return children;
    }
};

export default ProtectedRoute;