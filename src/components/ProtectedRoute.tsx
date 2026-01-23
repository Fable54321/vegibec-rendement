// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // still checking auth

    if (!user) return <Navigate to="/login" replace />; // redirect if not logged in

    return children; // user is authenticated
};

export default ProtectedRoute;
