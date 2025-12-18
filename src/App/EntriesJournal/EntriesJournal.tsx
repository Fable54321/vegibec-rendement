import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

const mainCategories = [
    "SEMENCE",
    "EMBALLAGE",
    "HORS CATÉGORIE",
    "PRODUITS DU SOL",
];

const soilProducts = [
    "Chaux calcique",
    "Engrais chimiques",
    "Engrais verts",
    "Fumier",
    "Terre et Terreaux",
];

interface JournalEntry {
    id: number;
    cost_domain: string;
    category: string | null;
    vegetable: string | null;
    amount: number;
    year: number;
    entry_type: "addition" | "correction" | "deletion";
    description: string | null;
    employee_name: string | null;
    created_at: string;
}

const EntriesJournal = () => {
    const { token } = useAuth();

    const [domain, setDomain] = useState<string>("SEMENCE");
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);


    const [activeTab, setActiveTab] = useState<string>(mainCategories[0]);
    const [selectedSoilProduct, setSelectedSoilProduct] = useState<string>(soilProducts[0]);


    useEffect(() => {
        if (activeTab === "PRODUITS DU SOL") {
            setDomain(selectedSoilProduct);
        } else {
            setDomain(activeTab);
        }
    }, [activeTab, selectedSoilProduct]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            await fetchWithAuth(`${API_BASE_URL}/journal/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchJournal(); // refresh after delete
        } catch (err) {
            console.error("Failed to delete entry", err);
            alert("Delete failed ❌");
        }
    };

    const handleCorrection = async (id: number) => {
        const newAmount = prompt("Enter corrected amount:"); // simple example
        if (!newAmount) return;

        try {
            await fetchWithAuth(`${API_BASE_URL}/journal/correct/${id}`, {
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



    const fetchJournal = async () => {
        setLoading(true);
        try {
            const backendDomain = domain === "HORS CATÉGORIE" ? "UNSPECIFIED" : domain;

            const res = await fetchWithAuth(
                `${API_BASE_URL}/journal?domain=${backendDomain}&page=${page}&limit=20`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

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
        fetchJournal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domain, page]); // Use actual domain instead of mainCategories


    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Journal des coûts</h1>

            {/* Domain selector */}
            <div className="flex gap-2 mb-4">
                {mainCategories.map((cat) => (
                    activeTab !== "PRODUITS DU SOL" || cat !== "PRODUITS DU SOL") && (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-4 py-2 rounded hover:cursor-pointer ${activeTab === cat ? "bg-green-500 text-white" : "bg-gray-200 text-black"
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
                            className="border border-gray-400 rounded px-2 py-1"
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
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1">Date</th>
                            <th className="border px-2 py-1">Type</th>
                            <th className="border px-2 py-1">Catégorie</th>
                            <th className="border px-2 py-1">Culture</th>
                            <th className="border px-2 py-1">Montant</th>
                            <th className="border px-2 py-1">Employé</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-6">
                                    Chargement...
                                </td>
                            </tr>
                        ) : entries.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-6">
                                    Aucune entrée
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className={`$${entry.entry_type !== "addition"
                                        ? "bg-gray-50 italic"
                                        : ""
                                        }`}
                                >
                                    <td className="border px-2 py-1">
                                        {new Date(entry.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="border px-2 py-1">{entry.entry_type}</td>
                                    <td className="border px-2 py-1">
                                        {entry.category ?? "—"}
                                    </td>
                                    <td className="border px-2 py-1">
                                        {entry.vegetable ?? "—"}
                                    </td>
                                    <td
                                        className={`border px-2 py-1 font-bold $${entry.amount >= 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {entry.amount !== null && entry.amount !== undefined
                                            ? Number(entry.amount).toFixed(2)
                                            : "-"}
                                        $
                                    </td>
                                    <td className="border px-2 py-1">
                                        {entry.employee_name ?? "—"}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                                        >
                                            Supprimer
                                        </button>
                                        <button
                                            onClick={() => handleCorrection(entry.id)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded"
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
