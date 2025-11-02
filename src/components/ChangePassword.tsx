// src/components/ChangePassword.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

const ChangePassword = () => {
    const { token } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (!token) {
            setError("You must be logged in to change your password.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to change password");
            }

            setSuccess("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 border rounded mt-8">
            <h2 className="text-xl font-bold mb-4">Changer le mot de passe</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {success && <p className="text-green-500 mb-2">{success}</p>}

            <form onSubmit={handleSubmit}>
                <label className="block mb-2">
                    Mot de passe actuel:
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border p-1 rounded mt-1"
                    />
                </label>

                <label className="block mb-2">
                    Nouveau mot de passe:
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border p-1 rounded mt-1"
                    />
                </label>

                <label className="block mb-4">
                    Confirmer le nouveau mot de passe:
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border p-1 rounded mt-1"
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="button-generic"
                >
                    {loading ? "En cours..." : "Changer le mot de passe"}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
