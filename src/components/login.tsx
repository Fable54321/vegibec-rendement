// src/components/Login.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
                credentials: "include",
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(
                    errorData?.message || "Nom d’utilisateur ou mot de passe invalide"
                );
            }

            const data = await res.json();
            login(data.token); // Save token in context/localStorage

            navigate("/");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4 mt-8"
        >
            <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded w-64"
            />

            <div className="relative w-64">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded w-full pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="button-generic">
                {loading ? "Connexion..." : "Se connecter"}
            </button>
        </form>
    );
};

export default Login;
