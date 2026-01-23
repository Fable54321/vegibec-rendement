// src/context/AuthContext.tsx
import { createContext, useState, useContext, type ReactNode, useEffect } from "react";

interface AuthContextType {
    token: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any; // replace with your proper user type if you have one
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    login: () => { },
    logout: () => { },
    loading: true,
});

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Run once on mount: check if token in localStorage is valid
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${storedToken}` },
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Unauthorized");

                const data = await res.json();
                if (isMounted) setUser(data.user);
            } catch (err) {
                console.warn("Auth check failed", err);
                localStorage.removeItem("token");
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initAuth();
        return () => { isMounted = false; };
    }, []);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);

        try {
            const payload = JSON.parse(atob(newToken.split(".")[1]));
            setUser(payload); // set user immediately from JWT
        } catch {
            setUser(null);
        } finally {
            setLoading(false); // ✅ mark loading complete
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
