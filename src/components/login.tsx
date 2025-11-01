// src/components/Login.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) throw new Error("Invalid credentials");

            const data = await res.json();
            login(data.token);
        } catch {
            setError("Nom d’utilisateur ou mot de passe invalide");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mt-8">
            <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded"
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded"
            />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded shadow">
                Se connecter
            </button>
        </form>
    );
};

export default Login;
