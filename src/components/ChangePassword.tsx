// src/components/ChangePassword.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

const ChangePassword = () => {
    const { token } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 👁️ visibility toggles
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }

        if (!token) {
            setError("Vous devez être connecté pour changer votre mot de passe.");
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
                throw new Error(data.error || "Échec du changement de mot de passe.");
            }

            setSuccess("Le mot de passe a été changé avec succès.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => navigate("/"), 200);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const renderPasswordField = (
        label: string,
        value: string,
        setValue: (v: string) => void,
        show: boolean,
        toggleShow: () => void
    ) => (
        <label className="block mb-3">
            {label}
            <div className="relative mt-1">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full border p-2 rounded pr-10"
                />
                <button
                    type="button"
                    onClick={toggleShow}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                    {show ? "🙈" : "👁️"}
                </button>
            </div>
        </label>
    );

    return (
        <div className="max-w-md mx-auto p-4 border rounded mt-8">
            <h2 className="text-xl font-bold mb-4">Changer le mot de passe</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {success && <p className="text-green-500 mb-2">{success}</p>}

            <form onSubmit={handleSubmit}>
                {renderPasswordField(
                    "Mot de passe actuel:",
                    currentPassword,
                    setCurrentPassword,
                    showCurrent,
                    () => setShowCurrent(!showCurrent)
                )}
                {renderPasswordField(
                    "Nouveau mot de passe:",
                    newPassword,
                    setNewPassword,
                    showNew,
                    () => setShowNew(!showNew)
                )}
                {renderPasswordField(
                    "Confirmer le nouveau mot de passe:",
                    confirmPassword,
                    setConfirmPassword,
                    showConfirm,
                    () => setShowConfirm(!showConfirm)
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="button-generic w-full mt-4"
                >
                    {loading ? "En cours..." : "Changer le mot de passe"}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;