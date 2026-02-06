/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { useVegetables } from "@/context/vegetables/VegetablesContext";


const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

type SeedLossRow = {
    year: number;
    vegetable: string;
    cultivar: string | null;
    units: number | null;
};

type PackagingRow = {
    year: number;
    vegetable: string;
    cultivar: string | null;
    units: number | null;
};



const LossesTracking = () => {

    const { token } = useAuth();



    const [activeTab, setActiveTab] = useState<"tracking" | "addPackaging" | "addSeeds">("tracking");
    const [seeds, setSeeds] = useState<SeedLossRow[]>([]);
    const [packVeg, setPackVeg] = useState("");
    const [packYear, setPackYear] = useState(new Date().getFullYear());
    const [packUnits, setPackUnits] = useState("");
    const [packCultivar, setPackCultivar] = useState("");

    const [selectedVeg, setSelectedVeg] = useState<string | null>(null);


    const [seedsLoading, setSeedsLoading] = useState(false);
    const [seedsError, setSeedsError] = useState<string | null>(null);
    const [packLoading, setPackLoading] = useState(false);
    const [packError, setPackError] = useState<string | null>(null);
    const [packaging, setPackaging] = useState<PackagingRow[]>([]);
    const [packagingLoading, setPackagingLoading] = useState(false);
    const [packagingError, setPackagingError] = useState<string | null>(null);

    const { vegetables } = useVegetables();

    const vegetableOptions = vegetables
        .filter(
            (veg) =>
                !veg.is_generic &&               // exclude generics
                veg.vegetable !== "AUCUNE"       // exclude special item
        )
        .map((veg) => veg.vegetable.toUpperCase());

    const fetchSeeds = async (vegetable?: string | null) => {
        if (!token) return;

        setSeedsLoading(true);
        setSeedsError(null);

        try {
            const url = new URL(`${API_BASE_URL}/losses-tracking/seeds`);

            if (vegetable) {
                url.searchParams.append("vegetable", vegetable);
            }

            const res = await fetchWithAuth<{ success: boolean; data: SeedLossRow[] }>(
                url.toString(),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSeeds(res.data);

        } catch (err) {
            setSeedsError((err as Error).message);

        } finally {
            setSeedsLoading(false);
        }
    };


    const fetchPackaging = async (vegetable?: string | null) => {
        if (!token) return;

        setPackagingLoading(true);
        setPackagingError(null);

        try {
            const url = new URL(`${API_BASE_URL}/losses-tracking/packaging`);

            if (vegetable) {
                url.searchParams.append("vegetable", vegetable);
            }

            const res = await fetchWithAuth<{ success: boolean; data: PackagingRow[] }>(
                url.toString(),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPackaging(res.data);

        } catch (err) {
            setPackagingError((err as Error).message);
        } finally {
            setPackagingLoading(false);
        }
    };


    const handleAddPackaging = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!packVeg.trim()) {
            alert("Veuillez entrer une culture");
            return;
        }

        const unitsNum = Number(packUnits);

        if (!packUnits || isNaN(unitsNum) || unitsNum <= 0) {
            alert("Veuillez entrer un nombre d'unités valide");
            return;
        }

        try {
            setPackLoading(true);
            setPackError(null);

            const res = await fetchWithAuth<{ success: boolean }>(
                `${API_BASE_URL}/losses-tracking/packaging`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        vegetable: packVeg.trim().toUpperCase(),
                        cultivar: packCultivar.trim().toUpperCase() || null,   // 👈 NEW
                        year: packYear,
                        units: unitsNum,
                    }),
                }
            );

            if (res.success === false) {
                throw new Error("Échec côté serveur");
            }

            // Reset form
            setPackVeg("");
            setPackCultivar("");   // 👈 NEW
            setPackUnits("");

            alert("Emballage ajouté avec succès ✅");

            // Refresh view
            fetchSeeds();

        } catch (err) {
            setPackError((err as Error).message);

        } finally {
            setPackLoading(false);
        }
    };



    useEffect(() => {
        fetchSeeds();
        fetchPackaging();
    }, [token, activeTab]);

    useEffect(() => {
        if (!packVeg && vegetableOptions.length > 0) {
            setPackVeg(vegetableOptions[1].toUpperCase());
        }
    }, [vegetableOptions]);

    const handleSelectVegetable = (veg: string) => {
        setSelectedVeg(veg);
        fetchSeeds(veg);
        fetchPackaging(veg);
    };

    const handleBackToGlobal = () => {
        setSelectedVeg(null);
        fetchSeeds();
        fetchPackaging();
    };


    const getDiff = (veg: string, cultivar: string | null, year: number) => {
        const seedRow = seeds.find(
            s =>
                s.vegetable === veg &&
                s.year === year &&
                (s.cultivar ?? null) === (cultivar ?? null)
        );

        const seedUnits = seedRow?.units ?? 0;

        const packRow = packaging.find(
            p =>
                p.vegetable === veg &&
                p.year === year &&
                (p.cultivar ?? null) === (cultivar ?? null)
        );

        const packUnits = packRow?.units ?? 0;

        return packUnits - seedUnits;
    };
    return (
        <article className="flex flex-col items-center">
            <h2 className="text-[1.5em] font-extrabold text-green-700 mt-[1rem]">Suivi des pertes</h2>
            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <button onClick={() => setActiveTab("tracking")} className={`px-3 py-1 rounded ${activeTab === "tracking" ? "bg-green-700 text-white" : "bg-gray-200"} hover:cursor-pointer`}>Suivi</button>
                <button onClick={() => setActiveTab("addPackaging")} className={`px-3 py-1 rounded ${activeTab === "addPackaging" ? "bg-green-700 text-white" : "bg-gray-200"} hover:cursor-pointer`}>Ajouter Emballage</button>
                <a target="_blank" href="/entrer-autres-couts" className={`px-3 py-1 rounded ${activeTab === "addSeeds" ? "bg-green-700 text-white" : "bg-gray-200"} hover:cursor-pointer`}>Ajouter des semences</a>
            </div>

            <p>Pour le suivi d'une culture selon ses variétés, cliquez sur le nom de la culture désirée</p>

            {activeTab === "tracking" && (
                <section className="w-full max-w-6xl mt-4">

                    {seedsLoading && packagingLoading && <p>Chargement...</p>}
                    {seedsError && <p className="text-red-600">{seedsError}</p>}
                    {packagingError && <p className="text-red-600">{packagingError}</p>}

                    {!seedsLoading && !seedsError && (
                        <>
                            {/* ==== VEGETABLE HEADER ==== */}
                            {selectedVeg && (
                                <div className="mb-2 flex items-center gap-2">
                                    <button
                                        onClick={handleBackToGlobal}
                                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 hover:cursor-pointer"
                                    >
                                        ← Retour au suivi global
                                    </button>

                                    <span className="font-semibold">
                                        {selectedVeg}
                                    </span>
                                </div>
                            )}

                            {/* ===== TWO TABLE LAYOUT ===== */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* ───────────────── SEEDS TABLE ───────────────── */}
                                <div>
                                    <h3 className="font-bold mb-2">🌱 Unités de semence</h3>

                                    <table className="w-full border">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2 text-left">Année</th>
                                                <th className="p-2 text-left">Culture</th>

                                                {selectedVeg && (
                                                    <th className="p-2 text-left">Cultivar</th>
                                                )}

                                                <th className="p-2 text-left">Unités de semence</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {seeds.map((row, i) => (
                                                <tr
                                                    key={i}
                                                    className={`border-t ${!selectedVeg ? "hover:bg-gray-50 cursor-pointer" : ""}`}
                                                    onClick={() => {
                                                        if (!selectedVeg) {
                                                            handleSelectVegetable(row.vegetable);
                                                        }
                                                    }}
                                                >
                                                    <td className="p-2">{row.year}</td>
                                                    <td className={`p-2 ${!selectedVeg ? "underline" : ""}`} >{row.vegetable}</td>

                                                    {selectedVeg && (
                                                        <td className="p-2">
                                                            {row.cultivar ?? "—"}
                                                        </td>
                                                    )}

                                                    <td className="p-2 font-medium">
                                                        {row.units ?? 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>


                                {/* ───────────────── PACKAGING TABLE ───────────────── */}
                                <div>
                                    <h3 className="font-bold mb-2">📦 Unités à l'emballge</h3>

                                    <table className="w-full border">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2 text-left">Année</th>
                                                <th className="p-2 text-left">Culture</th>

                                                {selectedVeg && (
                                                    <th className="p-2 text-left">Cultivar</th>
                                                )}

                                                <th className="p-2 text-left">Unités emballées</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {packaging.map((row, i) => {

                                                const diff = getDiff(row.vegetable, row.cultivar, row.year);

                                                const diffColor =
                                                    diff > 0
                                                        ? "text-green-700"
                                                        : diff < 0
                                                            ? "text-red-700"
                                                            : "text-gray-600";

                                                return (
                                                    <tr key={i} className="border-t">
                                                        <td className="p-2">{row.year}</td>

                                                        <td className="p-2">{row.vegetable}</td>

                                                        {selectedVeg && (
                                                            <td className="p-2">
                                                                {row.cultivar ?? "—"}
                                                            </td>
                                                        )}

                                                        <td className="p-2 font-medium">
                                                            {row.units ?? 0}

                                                            <span className={`ml-2 text-sm ${diffColor}`}>
                                                                ({diff >= 0 ? "+" : ""}{diff})
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </>
                    )}
                </section>
            )}


            {activeTab === "addPackaging" && (
                <section className="w-full max-w-xl mt-4">

                    <form
                        onSubmit={handleAddPackaging}
                        className="flex flex-col gap-3 border p-4 rounded bg-gray-50"
                    >

                        <h3 className="font-bold text-lg">Ajouter des quantités emballées</h3>

                        <label className="flex flex-col gap-1">
                            Culture :
                            <select
                                value={packVeg}
                                onChange={(e) => setPackVeg(e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="">-- Sélectionner une culture --</option>

                                {vegetableOptions.map((veg: string) => (
                                    <option key={veg} value={veg.toUpperCase()}>
                                        {veg}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            Cultivar (optionnel) :
                            <input
                                value={packCultivar}
                                onChange={(e) => setPackCultivar(e.target.value)}
                                className="border p-2 rounded"
                                placeholder="..."
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            Année :
                            <input
                                type="number"
                                value={packYear}
                                onChange={(e) => setPackYear(Number(e.target.value))}
                                className="border p-2 rounded"
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            Unités emballées :
                            <input
                                type="number"
                                value={packUnits}
                                onChange={(e) => setPackUnits(e.target.value)}
                                className="border p-2 rounded"
                            />
                        </label>

                        {packError && (
                            <p className="text-red-600">{packError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={packLoading}
                            className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-800"
                        >
                            {packLoading ? "Envoi..." : "Ajouter"}
                        </button>

                    </form>

                </section>
            )}



        </article>
    )
}

export default LossesTracking
