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


        const initAuth = async () => {
            const storedToken = localStorage.getItem("token");

            try {
                // First try current token
                if (storedToken) {
                    const res = await fetch(`${API_BASE_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${storedToken}` },
                        credentials: "include",
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setUser(data.user);
                        setToken(storedToken);
                        return;
                    }
                }

                // 🔁 Fallback to refresh
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: "POST",
                    credentials: "include",
                });

                if (!refreshRes.ok) throw new Error("Refresh failed");

                const data = await refreshRes.json();
                login(data.token); // sets token + user
            } catch (err) {
                console.warn("Auth init failed:", err);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();

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

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // ignore
        }

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
