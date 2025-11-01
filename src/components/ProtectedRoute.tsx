import { useAuth } from "@/context/AuthContext";
import Login from "./login";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Login />; // or <Navigate to="/login" />
    return children;
};


export default ProtectedRoute;