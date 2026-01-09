import { useState, useEffect } from "react";
import SecondStep from "./015--SecondStep/SecondStep";
import FirstStep from "./011--firstStep/FirstStep";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { useFields } from "@/context/fields/FieldsContext";


const TaskCostsInput = () => {
    const [task, setTask] = useState({
        Entretien: false,
        Entrepôt: false,
        Agronomie: false,
        Pompage: false,
        Transport: false,
        Opérations: false,
        Autre: false,
    });


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



    const vegetables = [
        "Céleri",
        "Chou",
        "Chou plat",
        "Chou vert",
        "Chou rouge",
        "Chou de Savoie",
        "Chou de Bruxelles",
        "Chou-fleur",
        "Cœur de romaine",
        "Endives",
        "Laitue",
        "Laitue frisée",
        "Laitue frisée verte",
        "Laitue frisée rouge",
        "Laitue pommée",
        "Laitue romaine",
        "Poivron",
        "Poivron vert",
        "Poivron rouge",
        "Poivron jaune",
        "Poivron orange",
        "Poivron vert/rouge",
        "Zucchini",
        "Zucchini vert",
        "Zucchini jaune",
        "Zucchini libanais",
    ];

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    const { token } = useAuth();

    const [subCategories, setSubcategories] = useState<string[]>([]);
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




    // --- New states for overlay ---
    const [showOverlay, setShowOverlay] = useState(false);

    const [latestEntries, setLatestEntries] = useState<TaskCostEntry[]>([]);
    const [overlayPage, setOverlayPage] = useState(1);
    const [overlayTotalPages, setOverlayTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { fields } = useFields();


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
                const res = await fetchWithAuth<PaginatedTaskCostResponse>(
                    `${API_BASE_URL}/data/costs?page=${overlayPage}&limit=10`,
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

    }, [showOverlay, token, overlayPage]);

    const openOverlay = () => {
        setOverlayPage(1);
        setShowOverlay(true);

    };

    const closeOverlay = () => {
        setShowOverlay(false);
    };



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

                        {loading && <p className="text-center">Chargement...</p>}
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
                                                <td className="p-2 border">{entry.field}</td>
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
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        disabled={overlayPage <= 1}
                                        onClick={() => setOverlayPage((p) => p - 1)}
                                        className="px-4 py-2 rounded border disabled:opacity-50"
                                    >
                                        ← Précédent
                                    </button>

                                    <span>
                                        Page {overlayPage} / {overlayTotalPages}
                                    </span>

                                    <button
                                        disabled={overlayPage >= overlayTotalPages}
                                        onClick={() => setOverlayPage((p) => p + 1)}
                                        className="px-4 py-2 rounded border disabled:opacity-50"
                                    >
                                        Suivant →
                                    </button>
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
                        task={task}
                        setTask={setTask}
                        subCategories={subCategories}
                        setSubcategories={setSubcategories}
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

                    />
                )}

                {isFirstStepCompleted && (
                    <SecondStep
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
                        task={task}
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
