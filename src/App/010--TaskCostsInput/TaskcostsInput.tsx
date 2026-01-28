import { useState, useEffect } from "react";
import SecondStep from "./015--SecondStep/SecondStep";
import FirstStep from "./011--firstStep/FirstStep";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { useFields } from "@/context/fields/FieldsContext";
import { useVegetables } from "@/context/vegetables/VegetablesContext";
import { useTaskCategories } from "../../context/taskCategories/TaskCategoriesContext";


const TaskCostsInput = () => {

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const {
        categories,
        subcategories,
        fetchSubcategories,
        loadingCategories,
        loadingSubcategories,
    } = useTaskCategories();

    interface TaskCostEntry {
        id: number;
        vegetable: string;
        category: string;
        sub_category: string;
        total_hours: number;
        supervisor: string;
        total_cost: number;
        created_at: string;
        field: string | null;
    }

    interface PaginatedTaskCostResponse {
        entries: TaskCostEntry[];
        pagination: {
            page: number;
            totalPages: number;
        };
    }

    const { vegetables: vegList } = useVegetables();

    const [vegetables, setVegetables] = useState<string[]>([]);

    useEffect(() => {
        const vegNames = vegList.map((veg) => veg.vegetable);
        setVegetables(vegNames);
        setSelectedVeggie(vegNames[1] || "");
    }, [vegList]);


    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    const { token } = useAuth();


    const [subCategory, setSubCategory] = useState("");


    const [cultureDefined, setCultureDefined] = useState(false);
    const [selectedVeggie, setSelectedVeggie] = useState(vegetables[0]);
    const [supervisor, setSupervisor] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [numberOfWages, setNumberOfWages] = useState<number | "">("");
    const [wages, setWages] = useState<(number | "")[]>(new Array(numberOfWages).fill(0));
    const [multiplier, setMultiplier] = useState<(number | "")[]>(new Array(numberOfWages).fill(1));
    const [hoursInput, setHoursInput] = useState<string>("");
    const [field, setField] = useState<string | null>(null);
    const [isFieldDefined, setIsFieldDefined] = useState(false);
    const [isFirstStepCompleted, setIsFirstStepCompleted] = useState(false);


    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");


    // --- New states for overlay ---
    const [showOverlay, setShowOverlay] = useState(false);


    const [latestEntries, setLatestEntries] = useState<TaskCostEntry[]>([]);
    const [overlayPage, setOverlayPage] = useState(1);
    const [pageInput, setPageInput] = useState<string>("1");
    const [overlayTotalPages, setOverlayTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { fields } = useFields();

    const handleCategoryChange = (categoryId: number) => {
        setSelectedCategoryId(categoryId);
        setSubCategory("");
        fetchSubcategories(categoryId);
    };


    useEffect(() => {

        setPageInput(overlayPage.toString());
    }, [overlayPage]);


    useEffect(() => {
        if (isFieldDefined) {
            setField(fields[0]?.field || null);
        }
        else {
            setField(null);
        }
    }, [fields, isFieldDefined]);

    useEffect(() => {
        if (!token || !showOverlay) return;

        const fetchLatestEntries = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    page: overlayPage.toString(),
                    limit: "10",
                });

                if (fromDate) params.append("from", fromDate);
                if (toDate) params.append("to", toDate);

                const res = await fetchWithAuth<PaginatedTaskCostResponse>(
                    `${API_BASE_URL}/data/costs?${params.toString()}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setLatestEntries(res.entries);
                setOverlayTotalPages(res.pagination.totalPages);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };


        fetchLatestEntries();

    }, [showOverlay, token, overlayPage, fromDate, toDate]);

    const openOverlay = () => {
        setOverlayPage(1);
        setShowOverlay(true);

    };

    const closeOverlay = () => {
        setShowOverlay(false);
    };

    useEffect(() => {
        if (showOverlay) {
            setOverlayPage(1);
            setPageInput("1");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate]);


    return (
        <>
            <h1 className="text-[2.2rem] text-center mt-[2rem] lg:mt-[4.5rem]">
                Enregistrement des tâches effectuées
            </h1>

            <div className="flex flex-col items-center w-full gap-[1rem]">
                <Link className="button-generic mt-[1.2rem]" to="/">
                    Accueil
                </Link>
                <Link
                    to="/couts-des-taches"
                    className="button-generic"
                >
                    Voir les rapports de coûts des tâches
                </Link>

                {/* --- New Button for Overlay --- */}
                <button
                    onClick={openOverlay}
                    className="button-generic"
                >
                    Voir les dernières entrées
                </button>
            </div>

            {/* --- Overlay --- */}
            {showOverlay && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white w-[90%] max-w-[80vw] rounded-2xl p-6 relative shadow-xl overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={closeOverlay}
                            className="absolute top-3 right-4 text-2xl font-bold text-gray-600 hover:text-gray-900 hover:cursor-pointer"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-semibold mb-4 text-center">
                            Dernières entrées
                        </h2>
                        <div className="flex flex-wrap justify-center gap-4 mb-4">
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600">Du</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="border rounded px-2 py-1"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600">Au</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="border rounded px-2 py-1"
                                />
                            </div>

                            <button
                                onClick={() => {
                                    setFromDate("");
                                    setToDate("");
                                }}
                                className="self-end px-3 py-1 border rounded hover:bg-gray-100"
                            >
                                Réinitialiser
                            </button>
                        </div>

                        {loading || loadingCategories || loadingSubcategories && <p className="text-center">Chargement...</p>}
                        {error && (
                            <p className="text-center text-red-600">
                                Erreur : {error}
                            </p>
                        )}

                        {!loading && !error && latestEntries.length > 0 && (
                            <>
                                <table className="w-full border-collapse text-sm lg:text-base">
                                    <thead>
                                        <tr className="bg-green-700 text-white">
                                            <th className="p-2 border">Culture</th>
                                            <th className="p-2 border">Catégorie</th>
                                            <th className="p-2 border">Sous Catégorie</th>
                                            <th className="p-2 border">Heures Totales</th>
                                            <th className="p-2 border">Superviseur</th>
                                            <th className="p-2 border">Coût Total</th>
                                            <th className="p-2 border">Date</th>
                                            <th className="p-2 border">Champ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestEntries.map((entry) => (
                                            <tr
                                                key={entry.id}
                                                className="odd:bg-gray-100 even:bg-white text-center"
                                            >
                                                <td className="p-2 border">{entry.vegetable}</td>
                                                <td className="p-2 border">{entry.category}</td>
                                                <td className="p-2 border">{entry.sub_category}</td>
                                                <td className="p-2 border">{Number(entry.total_hours).toFixed(2)}</td>
                                                <td className="p-2 border">{entry.supervisor}</td>
                                                <td className="p-2 border">
                                                    {Number(entry.total_cost).toFixed(2)} $
                                                </td>
                                                <td className="p-2 border">
                                                    {new Date(entry.created_at).toLocaleDateString("fr-CA")}
                                                </td>
                                                <td className="p-2 border flex items-center justify-center">
                                                    {entry.field ? (
                                                        entry.field
                                                    ) : (
                                                        <button
                                                            onClick={async () => {
                                                                // 1️⃣ Ask user to select a field
                                                                const selectedField = prompt("Entrez le champ pour cette entrée :");
                                                                if (!selectedField) return;

                                                                try {
                                                                    // 2️⃣ Call fix-field route
                                                                    const result = await fetchWithAuth(
                                                                        `${API_BASE_URL}/fix-field`,
                                                                        {
                                                                            method: "PATCH",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({ ids: [entry.id], field: selectedField.toUpperCase() }),
                                                                        }
                                                                    );


                                                                    console.log("Patch result:", result);

                                                                    // 3️⃣ Update local state
                                                                    setLatestEntries((prev) =>
                                                                        prev.map((e) =>
                                                                            e.id === entry.id ? { ...e, field: selectedField.toUpperCase() } : e
                                                                        )
                                                                    );

                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert("Erreur lors de la correction du champ.");
                                                                }
                                                            }}
                                                            className="bg-yellow-400 hover:bg-yellow-500 hover:cursor-pointer text-white px-2 py-1 rounded text-sm"
                                                        >
                                                            Ajouter
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="p-2 border">
                                                    <button
                                                        onClick={async () => {
                                                            const confirmDelete = window.confirm(
                                                                "Confirmez-vous que vous voulez supprimer l'entrée sélectionnée ?"
                                                            );
                                                            if (!confirmDelete) return;

                                                            try {
                                                                await fetchWithAuth(`${API_BASE_URL}/data/costs/${entry.id}`, {
                                                                    method: "DELETE",
                                                                    headers: { Authorization: `Bearer ${token}` },
                                                                });

                                                                // remove the entry locally after deletion
                                                                setLatestEntries((prev) =>
                                                                    prev.filter((e) => e.id !== entry.id)
                                                                );
                                                            } catch (err) {
                                                                alert("Erreur lors de la suppression : " + (err as Error).message);
                                                            }
                                                        }}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm hover:cursor-pointer"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="flex flex-col justify-center items-center mt-4">


                                    <span>
                                        Page{" "}
                                        <input
                                            type="number"
                                            min={1}
                                            max={overlayTotalPages}
                                            value={pageInput}
                                            onChange={(e) => setPageInput(e.target.value)} // just update local state
                                            onBlur={() => {
                                                const val = Number(pageInput);
                                                if (!Number.isNaN(val) && val >= 1 && val <= overlayTotalPages) {
                                                    setOverlayPage(val); // update actual page
                                                } else {
                                                    setPageInput(overlayPage.toString()); // revert if invalid
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.currentTarget.blur(); // trigger onBlur logic
                                                }
                                            }}
                                            className="w-12 text-center border rounded px-1"
                                        />{" "}
                                        / {overlayTotalPages}

                                    </span>
                                    <div className="flex gap-[2rem] items-center h-[3rem]">
                                        <button
                                            disabled={overlayPage <= 1}
                                            onClick={() => setOverlayPage((p) => p - 1)}
                                            className="flex items-center px-4 py-2 rounded border-2 h-[2.25rem] border-green-700 disabled:opacity-50 hover:cursor-pointer"
                                        >
                                            ← Précédent
                                        </button>



                                        <button className="block mx-auto rounded border-2 border-green-700 px-1   hover:cursor-pointer">
                                            go
                                        </button>

                                        <button
                                            disabled={overlayPage >= overlayTotalPages}
                                            onClick={() => setOverlayPage((p) => p + 1)}
                                            className="flex items-center px-4 py-2 h-[2.25rem] rounded border-2 border-green-700 disabled:opacity-50 hover:cursor-pointer"
                                        >
                                            Suivant →
                                        </button>

                                    </div>

                                </div>
                            </>
                        )}

                        {!loading && !error && latestEntries.length === 0 && (
                            <p className="text-center">Aucune entrée trouvée.</p>
                        )}
                    </div>
                </div>
            )}

            <article className="flex flex-col items-center w-full lg:mt-[1.5rem] lg:text-[1.2rem]">
                {!isFirstStepCompleted && (
                    <FirstStep
                        categories={categories}
                        subCategory={subCategory}
                        setSubCategory={setSubCategory}
                        cultureDefined={cultureDefined}
                        setCultureDefined={setCultureDefined}
                        selectedVeggie={selectedVeggie}
                        setSelectedVeggie={setSelectedVeggie}
                        vegetables={vegetables}
                        isFirstStepCompleted={isFirstStepCompleted}
                        setIsFirstStepCompleted={setIsFirstStepCompleted}
                        supervisor={supervisor}
                        setSupervisor={setSupervisor}
                        field={field}
                        setField={setField}
                        isFieldDefined={isFieldDefined}
                        setIsFieldDefined={setIsFieldDefined}
                        onCategoryChange={handleCategoryChange}
                        selectedCategoryId={selectedCategoryId}
                        subCategories={subcategories}
                    />
                )}

                {isFirstStepCompleted && (
                    <SecondStep
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        numberOfWages={numberOfWages}
                        setNumberOfWages={setNumberOfWages}
                        wages={wages}
                        setWages={setWages}
                        multiplier={multiplier}
                        setMultiplier={setMultiplier}
                        hoursInput={hoursInput}
                        setHoursInput={setHoursInput}
                        isFirstStepCompleted={isFirstStepCompleted}
                        setIsFirstStepCompleted={setIsFirstStepCompleted}
                        subCategory={subCategory}
                        selectedVeggie={selectedVeggie}
                        cultureDefined={cultureDefined}
                        supervisor={supervisor}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        field={field}
                    />
                )}
            </article>
        </>
    );
};

export default TaskCostsInput;
