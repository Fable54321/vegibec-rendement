import { useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

interface Props {
    vegetables: { vegetable: string }[];
    refreshVegetables: () => Promise<void>;
    projectedRevenues: { vegetable: string; projected_revenue: number; year: number }[];
    refreshProjectedRevenues: () => Promise<void>;
}

const CultureDelete = ({ vegetables, refreshVegetables, projectedRevenues, refreshProjectedRevenues }: Props) => {
    const { token } = useAuth();
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleDelete = async () => {
        if (!selected) return;

        if (!confirm(`Supprimer définitivement "${selected}" ?`)) return;

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            // 1️⃣ Delete projected revenues for the selected vegetable
            const projectedForSelected = projectedRevenues.filter(
                (p) => p.vegetable === selected
            );

            for (const p of projectedForSelected) {
                await fetchWithAuth(
                    `${API_BASE_URL}/projected-revenues/${encodeURIComponent(
                        selected
                    )}/${p.year}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // Refresh projected revenues after deletion
            if (projectedForSelected.length > 0) {
                await refreshProjectedRevenues();
            }

            // 2️⃣ Delete the vegetable itself
            await fetchWithAuth(
                `${API_BASE_URL}/vegetables/${encodeURIComponent(selected)}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await refreshVegetables();

            setSuccess(true);
            setSelected("");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };


    const selectedProjectedRevenue = projectedRevenues.find(p => p.vegetable === selected);


    return (
        <section className="w-full max-w-md mx-auto mt-6">
            <h2 className="text-xl font-semibold mb-4 text-red-700">
                Supprimer une culture
            </h2>

            <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="border rounded px-3 py-2 w-full"
            >
                <option value="">— Sélectionner —</option>
                {vegetables.map((v) => (
                    <option key={v.vegetable} value={v.vegetable}>
                        {v.vegetable}
                    </option>
                ))}
            </select>

            {/* Show projected revenue if exists */}
            {selected && selectedProjectedRevenue && (
                <p className="mt-2 text-sm text-gray-700">
                    Projeté: {selectedProjectedRevenue.projected_revenue.toLocaleString("fr-CA", {
                        style: "currency",
                        currency: "CAD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}, année: {selectedProjectedRevenue.year}
                </p>
            )}

            <button
                onClick={handleDelete}
                disabled={!selected || loading}
                className="mt-4 bg-red-600 text-white rounded py-2 w-full disabled:opacity-50"
            >
                {loading ? "Suppression..." : "Supprimer"}
            </button>

            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
            {success && (
                <p className="text-green-700 mt-2 text-sm">
                    Culture supprimée avec succès
                </p>
            )}
        </section>
    );
};

export default CultureDelete;
