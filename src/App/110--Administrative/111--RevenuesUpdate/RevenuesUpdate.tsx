import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '@/App/000--App/App';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { Pencil } from 'lucide-react';

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

type RevenueInput = {
    vegetable: string;
    revenue: number | "";
};

const formatRevenue = (value: number | ""): string => {
    if (value === "") return "";
    return new Intl.NumberFormat("fr-CA").format(value);
};

const RevenuesUpdate = () => {
    const { token } = useAuth();
    const { revenues, revenuesSelectedYear } = useOutletContext<AppOutletContext>();

    const [year, setYear] = useState<number | "">("");
    const [revenueInputs, setRevenueInputs] = useState<RevenueInput[]>(() =>
        revenues.map(r => ({ vegetable: r.vegetable, revenue: r.revenue }))
    );
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isNumberFocused, setIsNumberFocused] = useState(false);
    const [isVegetableFocused, setIsVegetableFocused] = useState(false);


    useEffect(() => {
        setRevenueInputs(revenues.map(r => ({ vegetable: r.vegetable, revenue: r.revenue })));
    }, [revenues]);

    // Update revenue value for a vegetable
    const handleChange = (index: number, value: number | "") => {
        const newInputs = [...revenueInputs];
        newInputs[index].revenue = value;
        setRevenueInputs(newInputs);
    };

    // Add a new blank vegetable
    const handleAdd = () => {
        setRevenueInputs([...revenueInputs, { vegetable: "", revenue: "" }]);
    };

    // Remove a vegetable
    const handleRemove = (index: number) => {
        const newInputs = revenueInputs.filter((_, i) => i !== index);
        setRevenueInputs(newInputs);
    };

    const handleRevenueChange = (index: number, rawValue: string) => {
        // Remove spaces, non-numbers
        const cleaned = rawValue.replace(/[^\d]/g, "");

        const numericValue = cleaned === "" ? "" : Number(cleaned);

        handleChange(index, numericValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!year || revenueInputs.length === 0) return;

        // Validate: all vegetables must have a name and revenue
        for (const r of revenueInputs) {
            if (!r.vegetable.trim() || r.revenue === "") {
                setMessage({ type: "error", text: "Veuillez remplir tous les champs de légume et de revenu." });
                return;
            }
        }

        try {
            setLoading(true);
            const payload = {
                year_from: year,
                revenues: revenueInputs.map(r => ({
                    vegetable: r.vegetable.trim().toUpperCase(),
                    total_revenue: Number(r.revenue),
                })),
            };

            await fetchWithAuth(`${API_BASE_URL}/revenues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            setMessage({ type: "success", text: `Revenus pour l'année ${year} ajoutés avec succès !` });
        } catch (error) {
            let errorText = `Échec de l'ajout des revenus.`;
            if (error instanceof Error) {
                try {
                    const parsed = JSON.parse(error.message);
                    if (parsed?.error) errorText = parsed.error;
                } catch (parsedError) {
                    console.warn("Could not parse error message as JSON:", parsedError);
                }
            }
            setMessage({ type: "error", text: errorText });
        } finally {
            setYear("");
            setRevenueInputs(revenues.map(r => ({ vegetable: r.vegetable, revenue: r.revenue })));
            setLoading(false);
        }
    };

    return (
        <article className='flex flex-col items-center w-full'>
            <h2 className="text-2xl font-semibold mb-4">Ajouter les revenus d'une année complétée</h2>
            <p>Pour une culture à ajouter pour l'année en cours, consultez plutôt <Link to='gestion-administrative/cultures' className='underline font-bold text-[1.1em] text-green-700'>ce lien-ci</Link></p>

            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-[min(95%,_600px)] mt-[1rem]">
                {/* Select year */}
                <label className="flex flex-col items-center">
                    <span>Année des revenus à ajouter :</span>
                    <input
                        type="number"
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                        placeholder="Ex: 2025"
                        className="border rounded px-3 py-2 w-32"
                        disabled={loading}
                    />
                </label>

                <p>***Revenus de la dernière année complétée ({revenuesSelectedYear}) présentés à titre de base***</p>

                {/* List of vegetables */}
                <div className="flex flex-col w-full gap-[0.2rem]">
                    {revenueInputs.map((r, index) => (
                        <div key={index} className="flex gap-2 items-center w-full ">
                            <div className='w-full relative'>
                                <input
                                    type="text"
                                    placeholder="Nom du légume"
                                    value={r.vegetable}
                                    onChange={e =>
                                        setRevenueInputs(inputs => {
                                            const copy = [...inputs];
                                            copy[index].vegetable = e.target.value;
                                            return copy;
                                        })
                                    }
                                    onFocus={() => setIsVegetableFocused(true)}
                                    onBlur={() => setIsVegetableFocused(false)}
                                    className="border-2 border-green-700 rounded px-2 py-1 flex-1 hover:border-green-400 w-full"
                                    disabled={loading}
                                />
                                {!isVegetableFocused && (
                                    <Pencil size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2" />
                                )}
                            </div>
                            <div className='w-60 relative'>
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
                                {!isNumberFocused && (
                                    <Pencil size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="text-red-600 font-bold px-2 py-1 hover:cursor-pointer hover:underline"
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add new vegetable */}
                <button
                    type="button"
                    onClick={handleAdd}
                    className="text-green-700 font-bold hover:cursor-pointer hover:underline"
                    disabled={loading}
                >
                    + Ajouter un légume
                </button>

                {/* Submit */}
                <button
                    type="submit"
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-400 disabled:opacity-50 hover:cursor-pointer"
                    disabled={loading}
                >
                    {loading ? "Envoi en cours..." : "Ajouter les revenus"}
                </button>

                {/* Messages */}
                {message && (
                    <p className={`mt-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                        {message.text}
                    </p>
                )}
            </form>
        </article>
    );
};

export default RevenuesUpdate;
