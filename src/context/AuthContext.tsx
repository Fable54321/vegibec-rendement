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

    useEffect(() => {
        const initAuth = () => {
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    setUser(payload);
                } catch (err) {
                    console.error("Invalid token:", err);
                    setToken(null);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false); // ✅ mark loading as finished
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
