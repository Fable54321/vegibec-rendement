

import { useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { Link, useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "@/App/000--App/App";
import { ChevronDown, X } from "lucide-react";
import { useProjectedRevenues } from "@/context/projectedRevenues/ProjectedRevenuesContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";


const formatCurrency = (value: number | string | undefined | null) => {
    if (value == null) return "—";
    const n = typeof value === "string" ? parseFloat(value) : value;
    if (!Number.isFinite(n)) return "—";
    // Only round for display, keep internal calculations untouched
    return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const CulturesUpdate = () => {
    const { token } = useAuth();

    const [culture, setCulture] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isRevenueExisting, setIsRevenueExisting] = useState(false);
    const [projectedRevenue, setProjectedRevenue] = useState<number | "">("");
    const [isChangingYear, setIsChangingYear] = useState(false);

    const { revenues, revenuesSelectedYear, setRevenuesSelectedYear, mainLoading } = useOutletContext<AppOutletContext>();

    const { projectedRevenues } = useProjectedRevenues();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const normalizedCulture = culture.trim().toUpperCase();
        if (!normalizedCulture) {
            setError("Veuillez entrer une culture valide.");
            return;
        }

        if (!isRevenueExisting && projectedRevenue === "") {
            setError("Veuillez entrer un revenu projeté.");
            return;
        }

        try {
            setLoading(true);

            // 1️⃣ Add vegetable (idempotent thanks to ON CONFLICT)
            await fetchWithAuth(`${API_BASE_URL}/vegetables`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    vegetable: normalizedCulture,
                }),
            });

            // 2️⃣ Add projected revenue if needed
            if (!isRevenueExisting) {
                const currentYear = new Date().getFullYear();

                await fetchWithAuth(`${API_BASE_URL}/projected-revenues`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        vegetable: normalizedCulture,
                        year: currentYear,
                        projectedRevenue,
                    }),
                });
            }

            // ✅ Reset form
            setCulture("");
            setProjectedRevenue("");
            setIsRevenueExisting(false);
            setSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <article className="flex flex-col items-center  mx-auto">
            <Link to="/" className="button-generic mt-[2rem] text-[1em]">
                Accueil
            </Link>
            <h1 className="text-2xl font-semibold mb-4 mt-4">Ajouter une culture</h1>

            <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-3 max-w-md max-sm:w-[95%]"
            >
                <label className="flex flex-col">
                    <span className="text-sm text-gray-600 mb-1">Nom de la culture</span>
                    <input
                        type="text"
                        value={culture}
                        onChange={(e) => setCulture(e.target.value)}
                        placeholder="Ex: Carotte"
                        className="border rounded px-3 py-2"
                        disabled={loading}
                    />
                </label>

                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isRevenueExisting}
                        onChange={(e) => setIsRevenueExisting(e.target.checked)}
                        className="mr-2"
                    />
                    <span className="text-sm">Revenus d'année complète existants</span>
                </label>

                {!isRevenueExisting &&
                    <label className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Revenus projetés</span>
                        <input
                            type="number"
                            className="border rounded px-3 py-2 w-full"
                            disabled={loading}
                            value={projectedRevenue}
                            onChange={(e) => setProjectedRevenue(e.target.value ? Number(e.target.value) : "")}
                        />
                    </label>
                }

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-700 text-white rounded py-2 hover:bg-green-800 disabled:opacity-50"
                >
                    {loading ? "Ajout en cours..." : "Ajouter"}
                </button>



                {error && (
                    <p className="text-red-600 text-sm text-center">{error}</p>
                )}

                {success && (
                    <p className="text-green-700 text-sm text-center">
                        Culture ajoutée avec succès
                    </p>
                )}
            </form>
            {/* WRAPPER WRAPPER WRAPPER WRAPPER IN CASE OF NO REVENUES VEGETABLES */}
            <div className="w-full flex flex-col md:flex-row">
                <section className="w-full flex flex-col items-center ">
                    <div className="flex items-center gap-[0.5rem]">
                        <h2 className="text-xl font-semibold mt-6 mb-4 text-center">Revenus pour l'année {isChangingYear ?
                            <label>
                                <select
                                    value={revenuesSelectedYear}
                                    onChange={(e) => {
                                        setRevenuesSelectedYear(e.target.value);
                                        setIsChangingYear(false);
                                    }}
                                    className="border rounded px-2 py-1"
                                >
                                    {Array.from({ length: 10 }, (_, index) => (
                                        <option key={index} value={new Date().getFullYear() - index}>
                                            {new Date().getFullYear() - index}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            : <span className="pl-1.5">{revenuesSelectedYear}</span>}
                        </h2>

                        <button
                            onClick={() => setIsChangingYear(!isChangingYear)}
                            className="translate-y-[15%] hover:cursor-pointer"
                        >
                            {isChangingYear ? <X size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                    {revenues.length === 0 && (
                        <p className="mt-4 text-center">Aucun revenu enregistré pour l'année sélectionnée.</p>
                    )}
                    {revenues.length > 0 && (
                        <ul className={`flex flex-col gap-[0.5rem] ${isChangingYear ? "mt-[0rem]" : "mt-[0.7rem]"} md:flex-row w-[min(90%,_870px)] border-2 md:border-green-700 py-[1rem] md:px-[1rem] md:rounded-[1rem] bg-blue-50`}>
                            <div className="w-full flex flex-col items-center gap-[0.5rem] md:gap-[0.8rem] ">
                                {revenues.slice(0, Math.floor(revenues.length / 2))
                                    .map((item, index) => (

                                        <li key={index} className="text-lg w-[80%] md:w-full text-left border-b-1 border-green-700 ">
                                            <span className="text-[1.2rem] font-bold">{item.vegetable} </span>: <p className="text-center md:inline">{formatCurrency(item.revenue)}</p>
                                        </li>

                                    ))
                                }
                            </div>
                            <div className="w-full flex flex-col items-center gap-[0.5rem] md:gap-[0.8rem]">
                                {revenues.slice(Math.floor(revenues.length / 2))
                                    .map((item, index) => (

                                        <li key={index + Math.floor(revenues.length / 2)} className="text-lg w-[80%] md:w-full text-left border-b-1 border-green-700 ">
                                            <span className="text-[1.2rem] font-bold"> {item.vegetable} </span> : <p className="text-center md:inline">{formatCurrency(item.revenue)}</p>
                                        </li>

                                    ))
                                }
                            </div>
                        </ul>
                    )}
                    {mainLoading && (<p className="mt-4 text-center">Chargement des revenus...</p>
                    )}

                </section>
                {projectedRevenues.length > 0 && (
                    <section className="w-full flex flex-col items-center mt-[2rem] md:mt-0 md:ml-[2rem]">
                        <h2 className="text-xl mt-6 font-semibold mb-4 text-center">Revenus projetés</h2>
                        <ul className="flex flex-col gap-[0.5rem] w-[min(90%,_400px)] border-2 border-green-700 py-[1rem] px-[1rem] rounded-[1rem] bg-blue-50">
                            {projectedRevenues.map((item, index) => (
                                <li key={index} className="text-lg w-full text-left border-b-1 border-green-700 ">
                                    <span className="text-[1.2rem] font-bold">{item.vegetable} </span>: <p className="text-center md:inline">{formatCurrency(item.projected_revenue)}</p>
                                    <span className="pl-2">({item.year})</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </article>
    );
};

export default CulturesUpdate;

