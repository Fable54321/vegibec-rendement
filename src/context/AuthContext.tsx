// src/context/AuthContext.tsx
import {
    createContext,
    useState,
    useContext,
    type ReactNode,
    useEffect,
} from "react";

type User = {
    id: number;
    username: string;
    role?: string;
};

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    authChecked: boolean;
    refreshSession: () => Promise<boolean>;
}

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => { },
    logout: async () => { },
    loading: true,
    authChecked: false,
    refreshSession: async () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);

    const refreshSession = async (): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });

            return res.ok;
        } catch {
            return false;
        }
    };

    const fetchMe = async (): Promise<User | null> => {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data.user ?? null;
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                let me = await fetchMe();

                if (!me) {
                    const refreshed = await refreshSession();

                    if (refreshed) {
                        me = await fetchMe();
                    }
                }

                setUser(me);
            } catch (err) {
                console.warn("Auth init failed:", err);
                setUser(null);
            } finally {
                setLoading(false);
                setAuthChecked(true);
            }
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string) => {
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            setUser(data.user);
        } finally {
            setLoading(false);
            setAuthChecked(true);
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
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
                authChecked,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);