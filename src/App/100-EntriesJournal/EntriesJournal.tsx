import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

const mainCategories = [
    "SEMENCE",
    "EMBALLAGE",
    "HORS CATÉGORIE",
    "PRODUITS DU SOL",
    "UNITÉS VENDUES",
];

const soilProducts = [
    "Chaux calcique",
    "Engrais chimiques",
    "Engrais verts",
    "Fumier",
    "Terre et Terreaux",
];

interface JournalResponse {
    entries: JournalEntry[];
    pagination: {
        totalPages: number;
        currentPage: number;
    };
}


interface JournalEntry {
    id: number;
    cost_domain: string;
    category: string | null;
    vegetable: string | null;
    amount: number;
    year: number;
    entry_type: "addition" | "correction" | "suppression";
    description: string | null;
    business_description: string | null;
    employee_name: string | null;
    created_at: string;
}

interface UnitsSoldEntry {
    id: number;
    vegetable: string;
    units_sold: number;
    date_of_sale: string; // or Date if you convert it when fetching
    is_kg: boolean;
}

const EntriesJournal = () => {
    const { token } = useAuth();

    const [domain, setDomain] = useState<string>("SEMENCE");
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [unitsSoldEntries, setUnitsSoldEntries] = useState<UnitsSoldEntry[]>([]);
    const [loadingUnitsSold, setLoadingUnitsSold] = useState(false);


    const [activeTab, setActiveTab] = useState<string>(mainCategories[0]);
    const [selectedSoilProduct, setSelectedSoilProduct] = useState<string>(soilProducts[0]);

    const fetchUnitsSold = async () => {
        setLoadingUnitsSold(true);
        try {
            // Tell TypeScript the type of the returned JSON
            const data = await fetchWithAuth<UnitsSoldEntry[]>(
                `${API_BASE_URL}/units-sold-entries`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setUnitsSoldEntries(data);
        } catch (err) {
            console.error("Failed to fetch units sold", err);
            setUnitsSoldEntries([]);
        } finally {
            setLoadingUnitsSold(false);
        }
    };




    useEffect(() => {
        if (activeTab === "PRODUITS DU SOL") {
            setDomain(selectedSoilProduct);
        } else {
            setDomain(activeTab);
        }
    }, [activeTab, selectedSoilProduct]);

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes vous certain de vouloir supprimer cette entrée?")) return;
        try {
            await fetchWithAuth(`${API_BASE_URL}/journal/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchJournal();
        } catch (err) {
            console.error("Échec de suppression", err);
            alert("Échec de la suppression ");
        }
    };

    const handleCorrection = async (id: number) => {
        const newAmount = prompt("Entrez le nouveau montant:"); // simple example
        if (!newAmount) return;

        try {
            await fetchWithAuth(`${API_BASE_URL}/journal/${id}/correct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: Number(newAmount) }),
            });

            fetchJournal(); // refresh after correction
        } catch (err) {
            console.error("Failed to correct entry", err);
            alert("Correction failed ❌");
        }
    };

    const handleDeleteUnit = async (id: number) => {
        if (!confirm("Êtes-vous certain de vouloir supprimer cette entrée ?")) return;

        try {
            await fetchWithAuth(`${API_BASE_URL}/units-sold-entries/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchUnitsSold(); // refresh table
        } catch (err) {
            console.error("Échec de suppression des unités vendues", err);
            alert("Échec de la suppression");
        }
    };


    const handleCorrectionUnit = async (id: number) => {
        const newAmountStr = prompt("Entrez le nouveau nombre d'unités vendues:");
        if (!newAmountStr) return;

        const newAmount = Number(newAmountStr);
        if (isNaN(newAmount)) {
            alert("Veuillez entrer un nombre valide");
            return;
        }

        try {
            await fetchWithAuth(`${API_BASE_URL}/units-sold-entries/${id}/correct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ units_sold: newAmount }),
            });
            fetchUnitsSold(); // refresh table
        } catch (err) {
            console.error("Échec de correction des unités vendues", err);
            alert("Échec de la correction");
        }
    };


    const fetchJournal = async () => {
        setLoading(true);
        try {
            const backendDomain = domain === "HORS CATÉGORIE" ? "UNSPECIFIED" : domain;

            const res = await fetchWithAuth(
                `${API_BASE_URL}/journal?domain=${backendDomain}&page=${page}&limit=20`,
                { headers: { Authorization: `Bearer ${token}` } }
            ) as JournalResponse;

            setEntries(res.entries || []);
            setTotalPages(res.pagination?.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch journal", err);
            setEntries([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "UNITÉS VENDUES") {
            fetchUnitsSold();
        }
        else {
            fetchJournal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domain, page]); // Use actual domain instead of mainCategories




    return (
        <div className="p-6 max-w-6xl mx-auto flex flex-col items-center">
            <Link to="/" className="button-generic mb-[1rem]">
                Accueil
            </Link>
            <h1 className="text-2xl font-bold mb-4">Journal des coûts</h1>

            {/* Domain selector */}
            <div className="flex gap-2 mb-4 items-center h-10 w-full">
                {mainCategories.map((cat) => (
                    activeTab !== "PRODUITS DU SOL" || cat !== "PRODUITS DU SOL") && (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-4 py-2 rounded hover:cursor-pointer ${activeTab === cat ? "bg-white border-green-400 border-2 text-black" : "bg-green-700 text-white"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                {activeTab === "PRODUITS DU SOL" && (
                    <label className="flex flex-col ">
                        <select
                            value={selectedSoilProduct}
                            onChange={(e) => setSelectedSoilProduct(e.target.value)}
                            className=" border-2 border-green-400 rounded px-2 py-1 "
                        >
                            {soilProducts.map((soil) => (
                                <option key={soil} value={soil}>
                                    {soil}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
                <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1"># ID</th>
                            <th className="border px-2 py-1">Date</th>
                            <th className="border px-2 py-1">Type</th>
                            <th className="border px-2 py-1">Catégorie</th>
                            <th className="border px-2 py-1">Culture</th>
                            <th className="border px-2 py-1">Montant</th>
                            <th className="border px-2 py-1">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === "UNITÉS VENDUES" ? (
                            loadingUnitsSold ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-6">Chargement...</td>
                                </tr>
                            ) : unitsSoldEntries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-6">Aucune entrée</td>
                                </tr>
                            ) : (
                                unitsSoldEntries.map((entry: UnitsSoldEntry) => (
                                    <tr key={entry.id}>
                                        <td className="border px-2 py-1">{entry.id}</td>
                                        <td className="border px-2 py-1">{entry.vegetable}</td>
                                        <td className="border px-2 py-1">{entry.units_sold}</td>
                                        <td className="border px-2 py-1">{entry.is_kg ? "kg" : "unités"}</td>
                                        <td className="border px-2 py-1">
                                            {new Date(entry.date_of_sale).toLocaleDateString("fr-CA")}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteUnit(entry.id)}
                                                className="bg-red-500 text-white px-2 py-1 rounded mr-2 hover:cursor-pointer"
                                            >
                                                Supprimer
                                            </button>
                                            <button
                                                onClick={() => handleCorrectionUnit(entry.id)}
                                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:cursor-pointer"
                                            >
                                                Corriger
                                            </button>
                                        </td>
                                    </tr>
                                ))

                            )
                        ) : loading ? (
                            <tr>
                                <td colSpan={8} className="text-center py-6">Chargement...</td>
                            </tr>
                        ) : entries.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-6">Aucune entrée</td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className={`${entry.entry_type !== "addition" ? "bg-gray-50 italic" : ""}`}
                                >
                                    <td className="border px-2 py-1">{entry.id}</td>
                                    <td className="border px-2 py-1">
                                        {new Date(entry.created_at).toLocaleDateString("fr-CA", { timeZone: "UTC" })}
                                    </td>
                                    <td className="border px-2 py-1">{entry.entry_type}</td>
                                    <td className="border px-2 py-1">
                                        {entry.category === "HORS CATÉGORIE"
                                            ? entry.business_description
                                            : entry.category ?? "—"}
                                    </td>
                                    <td className="border px-2 py-1">{entry.vegetable ?? "—"}</td>
                                    <td className={`border px-2 py-1 font-bold ${entry.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {entry.amount !== null && entry.amount !== undefined ? Number(entry.amount).toFixed(2) : "-"}$
                                    </td>
                                    <td className="border px-2 py-1">{entry.description ?? "—"}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded mr-2 hover:cursor-pointer"
                                        >
                                            Supprimer
                                        </button>
                                        <button
                                            onClick={() => handleCorrection(entry.id)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:cursor-pointer"
                                        >
                                            Corriger
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    ← Précédent
                </button>

                <span>
                    Page {page} / {totalPages}
                </span>

                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Suivant →
                </button>
            </div>
        </div>
    );
};

export default EntriesJournal;
