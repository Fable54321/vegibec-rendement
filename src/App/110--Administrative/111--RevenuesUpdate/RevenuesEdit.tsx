import { useAuth } from "@/context/AuthContext";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "@/App/000--App/App";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { Pencil } from "lucide-react";

type RevenueInput = {
    vegetable: string;
    revenue: number | "";
    isNew?: boolean; // flag for new vegetable
};

const RevenuesEdit = () => {
    const { token } = useAuth();
    const { revenues, revenuesSelectedYear, setRevenuesSelectedYear, availableYears } = useOutletContext<AppOutletContext>();

    const [revenueInputs, setRevenueInputs] = useState<RevenueInput[]>(() =>
        revenues.map(r => ({ vegetable: r.vegetable, revenue: r.revenue }))
    );
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isNumberFocused, setIsNumberFocused] = useState(false);

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    useEffect(() => {
        setRevenueInputs(revenues.map(r => ({ vegetable: r.vegetable, revenue: r.revenue })));
    }, [revenues, revenuesSelectedYear]);

    const formatRevenue = (value: number | ""): string => value === "" ? "" : new Intl.NumberFormat("fr-CA").format(value);

    const handleRevenueChange = (index: number, rawValue: string) => {
        const cleaned = rawValue.replace(/[^\d]/g, "");
        const numericValue = cleaned === "" ? "" : Number(cleaned);
        setRevenueInputs(inputs => {
            const copy = [...inputs];
            copy[index].revenue = numericValue;
            return copy;
        });
    };

    // Update all existing revenues (PATCH)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setLoading(true);

            const payload = revenueInputs
                .filter(r => !r.isNew) // only existing vegetables
                .map(r => ({
                    vegetable: r.vegetable.trim().toUpperCase(),
                    total_revenue: Number(r.revenue),
                }));

            if (payload.length === 0) return;

            await fetchWithAuth(`${API_BASE_URL}/revenues`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ year_from: revenuesSelectedYear, revenues: payload }),
            });

            setMessage({ type: "success", text: `Revenus ${revenuesSelectedYear} mis à jour avec succès.` });
        } catch (error) {
            let errorText = "Échec de la modification des revenus.";
            if (error instanceof Error) {
                try {
                    const parsed = JSON.parse(error.message);
                    if (parsed?.error) errorText = parsed.error;
                } catch (parsedError) {
                    console.warn(parsedError);
                }
            }
            setMessage({ type: "error", text: errorText });
        } finally {
            setLoading(false);
        }
    };

    // Delete a single vegetable revenue
    const handleDelete = async (veg: string) => {
        if (!token || !window.confirm(`Voulez-vous vraiment supprimer "${veg}" pour l'année ${revenuesSelectedYear} ?`)) return;

        try {
            setLoading(true);

            await fetchWithAuth(`${API_BASE_URL}/revenues/single`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ year_from: revenuesSelectedYear, vegetable: veg }),
            });

            setRevenueInputs(inputs => inputs.filter(r => r.vegetable !== veg));
            setMessage({ type: "success", text: `Le revenu de "${veg}" a été supprimé.` });
        } catch (error) {
            console.warn(error);
            setMessage({ type: "error", text: "Échec de la suppression du revenu." });
        } finally {
            setLoading(false);
        }
    };

    // Add a new blank vegetable input
    const handleAddNewInput = () => {
        setRevenueInputs(inputs => [...inputs, { vegetable: "", revenue: "", isNew: true }]);
    };

    // Send single vegetable revenue (POST)
    const handleAddSingle = async (index: number) => {
        if (!token) return;

        const r = revenueInputs[index];
        if (!r.vegetable.trim() || r.revenue === "") {
            setMessage({ type: "error", text: "Veuillez remplir le légume et le revenu avant d'ajouter." });
            return;
        }

        if (!window.confirm(`Voulez-vous vraiment ajouter "${r.vegetable}" pour l'année ${revenuesSelectedYear} ?`)) return;

        try {
            setLoading(true);

            const payload = {
                year_from: revenuesSelectedYear,
                vegetable: r.vegetable.trim().toUpperCase(),
                total_revenue: Number(r.revenue),
            };

            await fetchWithAuth(`${API_BASE_URL}/revenues/single`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            setRevenueInputs(inputs => {
                const copy = [...inputs];
                copy[index].isNew = false; // mark as existing
                return copy;
            });

            setMessage({ type: "success", text: `Le revenu de "${r.vegetable}" a été ajouté.` });
        } catch (error) {
            console.warn(error);
            setMessage({ type: "error", text: "Échec de l'ajout du revenu." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-semibold mb-4">Modifier les revenus d'une année complétée</h2>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-[min(95%,_600px)]">
                {/* Select year */}
                <label className="flex flex-col items-center">
                    <span>Année à modifier :</span>
                    <select
                        value={revenuesSelectedYear}
                        onChange={e => setRevenuesSelectedYear(e.target.value)}
                        className="border rounded px-3 py-2"
                        disabled={loading}
                    >
                        <option value="">— Sélectionner —</option>
                        {availableYears.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </label>

                {/* Vegetable revenue inputs */}
                <div className="flex flex-col w-full gap-[0.2rem]">
                    {revenueInputs.map((r, index) => (
                        <div key={index} className="flex gap-2 items-center w-full">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Nom du légume"
                                    value={r.vegetable.toUpperCase()}
                                    onChange={e => setRevenueInputs(inputs => {
                                        const copy = [...inputs];
                                        copy[index].vegetable = e.target.value;
                                        return copy;
                                    })}
                                    className="border-2 w-full border-green-700 rounded px-2 py-1 flex-1 hover:border-green-400"
                                    disabled={loading || !r.isNew} // prevent editing existing names
                                />

                            </div>
                            <div className="relative w-60">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="Revenu"
                                    value={formatRevenue(r.revenue)}
                                    onChange={e => handleRevenueChange(index, e.target.value)}
                                    className="border-2 border-green-700 rounded px-2 py-1 w-full hover:border-green-400"
                                    disabled={loading}
                                    onFocus={() => setIsNumberFocused(true)}
                                    onBlur={() => setIsNumberFocused(false)}
                                />
                                {!isNumberFocused &&
                                    <Pencil size={14} className="absolute right-2 top-2" />
                                }
                            </div>

                            {/* Delete button for existing */}
                            {!r.isNew && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(r.vegetable)}
                                    className="text-red-600 font-bold px-2 py-1 hover:cursor-pointer hover:underline"
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            )}

                            {/* Add button for new */}
                            {r.isNew && (
                                <button
                                    type="button"
                                    onClick={() => handleAddSingle(index)}
                                    className="text-green-700 font-bold px-2 py-1 hover:cursor-pointer hover:underline"
                                    disabled={loading}
                                >
                                    +
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add new input button */}
                <button
                    type="button"
                    onClick={handleAddNewInput}
                    className="text-green-700 font-bold hover:cursor-pointer hover:underline mt-2"
                    disabled={loading}
                >
                    + Ajouter un légume
                </button>

                {/* Update all existing revenues */}
                <button
                    type="submit"
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-400 "
                    disabled={loading || !revenuesSelectedYear}
                >
                    {loading ? "Mise à jour..." : "Modifier les revenus"}
                </button>

                {/* Message */}
                {message && (
                    <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                        {message.text}
                    </p>
                )}
            </form>
        </>
    );
};

export default RevenuesEdit;
