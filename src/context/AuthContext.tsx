// src/context/AuthContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, type ReactNode, useEffect } from "react";

interface AuthContextType {
    token: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    login: () => { },
    logout: () => { },
    loading: true
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    useEffect(() => {
        const initAuth = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Unauthorized");

                const data = await res.json();
                setUser(data.user);
            } catch (err) {
                console.warn("Auth check failed, logging out", err);
                setToken(null);
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [token]);


    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    };
    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
