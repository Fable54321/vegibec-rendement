import { useState, useEffect } from "react";
import SecondStep from "./015--SecondStep/SecondStep";
import FirstStep from "./011--firstStep/FirstStep";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";


const TaskCostsInput = () => {
    const [task, setTask] = useState({
        Entretien: false,
        Entrepôt: false,
        Agronomie: false,
        Pompage: false,
        Autre: false,
    });

    const vegetables = [
        "Céleri",
        "Chou",
        "Chou de Bruxelles",
        "Chou-fleur",
        "Coeur de romaine",
        "Endives",
        "Laitue",
        "Laitue frisée",
        "Laitue pommée",
        "Laitue romaine",
        "Poivron",
        "Zucchini",
    ];

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    const { token } = useAuth();

    const [subCategories, setSubcategories] = useState<string[]>([]);
    const [subCategory, setSubCategory] = useState("");
    const [cultureDefined, setCultureDefined] = useState(false);
    const [selectedVeggie, setSelectedVeggie] = useState(vegetables[0]);
    const [supervisor, setSupervisor] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [numberOfWages, setNumberOfWages] = useState(1);
    const [wages, setWages] = useState(new Array(numberOfWages).fill(0));
    const [multiplier, setMultiplier] = useState(new Array(numberOfWages).fill(1));
    const [hoursInput, setHoursInput] = useState<string>("");
    const [isFirstStepCompleted, setIsFirstStepCompleted] = useState(false);


    // --- New states for overlay ---
    const [showOverlay, setShowOverlay] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [latestEntries, setLatestEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || !showOverlay) return;

        const fetchLatestEntries = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = (await fetchWithAuth(
                    `${API_BASE_URL}/data/costs/latest`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )) as {
                    vegetable: string;
                    category: string;
                    sub_category: string;
                    total_hours: number;
                    supervisor: string;
                    total_cost: number;
                    created_at: string;
                }[];

                setLatestEntries(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestEntries();

    }, [showOverlay, token]);

    const openOverlay = () => {
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

            <div className="flex flex-col items-center w-full">
                <Link className="button-generic mt-[1.2rem]" to="/">
                    Accueil
                </Link>
                <Link
                    to="/couts-des-taches"
                    className="lg:text-[1.2rem] lg:mt-[0.9rem] text-green-700 underline block text-center mt-[0.5rem] mb-[-1rem] w-[50%] font-bold text-[1.1rem]"
                >
                    Voir les rapports de coûts des tâches
                </Link>

                {/* --- New Button for Overlay --- */}
                <button
                    onClick={openOverlay}
                    className="button-generic mt-[1rem]"
                >
                    Voir les dix dernières entrées
                </button>
            </div>

            {/* --- Overlay --- */}
            {showOverlay && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white w-[90%] max-w-4xl rounded-2xl p-6 relative shadow-xl overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={closeOverlay}
                            className="absolute top-3 right-4 text-2xl font-bold text-gray-600 hover:text-gray-900"
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestEntries.map((entry, index) => (
                                        <tr
                                            key={index}
                                            className="odd:bg-gray-100 even:bg-white text-center"
                                        >
                                            <td className="p-2 border">{entry.vegetable}</td>
                                            <td className="p-2 border">{entry.category}</td>
                                            <td className="p-2 border">{entry.sub_category}</td>
                                            <td className="p-2 border">{entry.total_hours}</td>
                                            <td className="p-2 border">{entry.supervisor}</td>
                                            <td className="p-2 border">
                                                {Number(entry.total_cost).toFixed(2)} $
                                            </td>
                                            <td className="p-2 border">
                                                {new Date(entry.created_at).toLocaleDateString("fr-CA")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                    />
                )}
            </article>
        </>
    );
};

export default TaskCostsInput;
