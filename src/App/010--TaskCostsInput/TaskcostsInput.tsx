import { useState, useEffect } from "react";
import SecondStep from "./015--SecondStep/SecondStep";
import FirstStep from "./011--firstStep/FirstStep";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { useFields } from "@/context/fields/FieldsContext";
import { useVegetables } from "@/context/vegetables/VegetablesContext";
import { useTaskCategories } from "../../context/taskCategories/TaskCategoriesContext";
import "./TaskCostInput.css";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";



const TaskCostsInput = () => {

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const {
        categories,
        subcategories,
        fetchSubcategories,
        loadingCategories,
        loadingSubcategories,
    } = useTaskCategories();

    const { vegetables: vegList } = useVegetables();
    const { supervisors } = useSupervisors();
    const { fields } = useFields();

    useEffect(() => {
        console.log(
            "vegList",
            vegList,
            "supervisors",
            supervisors,
            "fields",
            fields,
            "categories",
            categories,
            "subcategories",
            subcategories,
        );
    }, [vegList, supervisors, fields, categories, subcategories]);

    interface TaskCostEntry {
        id: number;
        vegetable: string;
        category: string;
        sub_category: string;
        total_hours: number;
        supervisor: string;
        total_cost: number;
        total_cost_with_charges?: number;
        created_at: string;
        field: string | null;
        total_worker?: number;
    }

    interface PaginatedTaskCostResponse {
        entries: TaskCostEntry[];
        pagination: {
            page: number;
            totalPages: number;
        };
    }

    interface PatchTaskCostResponse {
        entry: TaskCostEntry;
    }



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

    const [editingId, setEditingId] = useState<number | null>(null);

    const [editingData, setEditingData] = useState({
        vegetable: "",
        category: "",
        sub_category: "",
        total_hours: "",
        total_worker: "",
        supervisor: "",
        total_cost: "",
        total_cost_with_charges: "",
        created_at: "",
        field: "",
    });

    const startEditing = (entry: TaskCostEntry) => {
        setEditingId(entry.id);

        setEditingData({
            vegetable: entry.vegetable,
            category: entry.category,
            sub_category: entry.sub_category,
            total_hours: entry.total_hours.toString(),
            total_worker: (entry.total_worker ?? 0).toString(),
            supervisor: entry.supervisor,
            total_cost: entry.total_cost.toString(),
            total_cost_with_charges: (entry.total_cost_with_charges ?? entry.total_cost).toString(),
            created_at: entry.created_at,
            field: entry.field || "",
        });
    };


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
                                            <th className="p-2 border">Nb de travailleurs</th> {/* <-- new */}
                                            <th className="p-2 border">Superviseur</th>
                                            <th className="p-2 border">Coût Total</th>
                                            <th className="p-2 border">Coût Total avec charges</th>
                                            <th className="p-2 border">Date</th>
                                            <th className="p-2 border">Champ</th>
                                            <th className="p-2 border">Modifier</th>
                                            <th className="p-2 border">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestEntries.map((entry) => (
                                            <tr
                                                key={entry.id}
                                                className="odd:bg-gray-100 even:bg-white text-center"
                                            >
                                                <td className="p-2 border">
                                                    {
                                                        editingId === entry.id ?
                                                            <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed">

                                                                {/* absolute select overlay */}
                                                                <select
                                                                    value={editingData.vegetable}
                                                                    onChange={(e) =>
                                                                        setEditingData((prev) => ({ ...prev, vegetable: e.target.value }))
                                                                    }
                                                                    onFocus={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.add("hidden");
                                                                        e.currentTarget.classList.remove("text-transparent");
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.remove("hidden");
                                                                        e.currentTarget.classList.add("text-transparent");
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent px-1 outline-none"
                                                                >
                                                                    {vegList.map((veg) => (
                                                                        <option key={veg.vegetable} value={veg.vegetable}>
                                                                            {veg.vegetable}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                {/* visible placeholder */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                    {entry.vegetable}
                                                                </div>

                                                                {/* height reference */}
                                                                <div className="text-transparent pointer-events-none">
                                                                    {entry.vegetable}
                                                                </div>

                                                            </div>

                                                            : entry.vegetable}
                                                </td>
                                                <td className="p-2 border">
                                                    {
                                                        editingId === entry.id ?
                                                            <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed">

                                                                {/* absolute select overlay */}
                                                                <select
                                                                    value={editingData.category}
                                                                    onChange={(e) => {
                                                                        const selectedCategory = categories.find((c) => c.name === e.target.value);
                                                                        setEditingData((prev) => ({
                                                                            ...prev,
                                                                            category: e.target.value,
                                                                            sub_category: "", // reset subcategory when category changes
                                                                        }));
                                                                        handleCategoryChange(selectedCategory?.id ?? 0); // fetch new subcategories
                                                                    }}
                                                                    id="catInput"
                                                                    name="catInput"
                                                                    onFocus={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.add("hidden");
                                                                        e.currentTarget.classList.remove("text-transparent");
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.remove("hidden");
                                                                        e.currentTarget.classList.add("text-transparent");
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent px-1 outline-none"
                                                                >
                                                                    {categories.map((cat) => (
                                                                        <option key={cat.id} value={cat.name}>
                                                                            {cat.name}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                {/* visible placeholder */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                    {entry.category}
                                                                </div>

                                                                {/* height reference */}
                                                                <div className="text-transparent pointer-events-none">
                                                                    {entry.category}
                                                                </div>

                                                            </div>

                                                            : entry.category}
                                                </td>
                                                <td className="p-2 border">
                                                    {
                                                        editingId === entry.id ?
                                                            <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed py-4">

                                                                {/* absolute select overlay */}
                                                                <select
                                                                    value={editingData.sub_category}
                                                                    onChange={(e) =>
                                                                        setEditingData((prev) => ({ ...prev, sub_category: e.target.value }))
                                                                    }
                                                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent  px-1 outline-none"
                                                                    onFocus={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.add("hidden");
                                                                        e.currentTarget.classList.remove("text-transparent");
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.remove("hidden");
                                                                        e.currentTarget.classList.add("text-transparent");
                                                                    }}
                                                                >
                                                                    {subcategories.map((sub) => (
                                                                        <option key={sub.id} value={sub.name}>
                                                                            {sub.name}
                                                                        </option>
                                                                    ))}

                                                                </select>
                                                                {/* visible placeholder */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                    {entry.sub_category}
                                                                </div>

                                                                {/* height reference */}
                                                                <div className="text-transparent pointer-events-none">
                                                                    {entry.sub_category}
                                                                </div>

                                                            </div>


                                                            : entry.sub_category}
                                                </td>
                                                <td className="p-2 border">
                                                    {
                                                        editingId === entry.id ?
                                                            <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed px-5">

                                                                {/* absolute input overlay */}
                                                                <input
                                                                    type="number"
                                                                    value={editingData.total_hours}
                                                                    onChange={(e) => {
                                                                        setEditingData((prev) => ({
                                                                            ...prev,
                                                                            total_hours: e.target.value,
                                                                        }));
                                                                    }}
                                                                    onFocus={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.add("hidden");
                                                                        e.currentTarget.classList.remove("text-transparent");
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.remove("hidden");
                                                                        e.currentTarget.classList.add("text-transparent");
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent px-1 outline-none"
                                                                />

                                                                {/* visible placeholder */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                    {Number(entry.total_hours).toFixed(2)}
                                                                </div>

                                                                {/* height reference */}
                                                                <div className="text-transparent pointer-events-none">
                                                                    {Number(entry.total_hours).toFixed(2)}
                                                                </div>

                                                            </div>
                                                            :
                                                            Number(entry.total_hours).toFixed(2)}
                                                </td>
                                                <td className="p-2 border">
                                                    {
                                                        editingId === entry.id ?
                                                            <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed">

                                                                {/* absolute input overlay */}
                                                                <input
                                                                    type="number"
                                                                    value={editingData.total_worker}
                                                                    onChange={(e) => {
                                                                        setEditingData((prev) => ({
                                                                            ...prev,
                                                                            total_worker: e.target.value,
                                                                        }));
                                                                    }}
                                                                    onFocus={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.add("hidden");
                                                                        e.currentTarget.classList.remove("text-transparent");
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.remove("hidden");
                                                                        e.currentTarget.classList.add("text-transparent");
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent px-1 outline-none"
                                                                />

                                                                {/* visible placeholder */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                    {Number(entry.total_worker ?? 0)}
                                                                </div>

                                                                {/* height reference */}
                                                                <div className="text-transparent pointer-events-none">
                                                                    {Number(entry.total_worker ?? 0)}
                                                                </div>

                                                            </div>
                                                            :
                                                            Number(entry.total_worker ?? 0)}
                                                </td> {/* <-- display total_worker */}
                                                <td className="p-2 border">
                                                    {editingId === entry.id ? (
                                                        <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed">

                                                            {/* absolute select overlay */}
                                                            <select
                                                                value={editingData.supervisor}
                                                                onChange={(e) =>
                                                                    setEditingData((prev) => ({ ...prev, supervisor: e.target.value }))
                                                                }
                                                                onFocus={(e) => {
                                                                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                    placeholder?.classList.add("hidden");
                                                                    e.currentTarget.classList.remove("text-transparent");
                                                                }}
                                                                onBlur={(e) => {
                                                                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                    placeholder?.classList.remove("hidden");
                                                                    e.currentTarget.classList.add("text-transparent");
                                                                }}
                                                                className="absolute inset-0 w-full h-full bg-transparent text-transparent px-1 outline-none"
                                                            >
                                                                {supervisors.map((sup) => (
                                                                    <option key={sup.supervisor} value={sup.supervisor}>
                                                                        {sup.supervisor}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {/* visible placeholder */}
                                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                {entry.supervisor}
                                                            </div>

                                                            {/* height reference */}
                                                            <div className="text-transparent pointer-events-none">
                                                                {entry.supervisor ? entry.supervisor : "-"}
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        entry.supervisor
                                                    )}
                                                </td>

                                                <td className="p-2 border">
                                                    {
                                                        editingId === entry.id ?
                                                            <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed px-5">

                                                                {/* absolute input overlay */}
                                                                <input
                                                                    type="number"
                                                                    value={editingData.total_cost}
                                                                    onChange={(e) => {
                                                                        setEditingData((prev) => ({
                                                                            ...prev,
                                                                            total_cost: e.target.value,
                                                                        }));
                                                                    }}
                                                                    onFocus={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.add("hidden");
                                                                        e.currentTarget.classList.remove("text-transparent");
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.remove("hidden");
                                                                        e.currentTarget.classList.add("text-transparent");
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent px-1 outline-none"
                                                                />

                                                                {/* visible placeholder */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                    {Number(entry.total_cost).toFixed(2) + "$"}
                                                                </div>

                                                                {/* height reference */}
                                                                <div className="text-transparent pointer-events-none">
                                                                    {Number(entry.total_cost).toFixed(2) + "$"}
                                                                </div>

                                                            </div>
                                                            :
                                                            Number(entry.total_cost).toFixed(2) + "$"
                                                    }
                                                </td>
                                                <td className="p-2 border">
                                                    {
                                                        editingId === entry.id ?
                                                            <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed">

                                                                {/* absolute input overlay */}
                                                                <input
                                                                    type="number"
                                                                    value={editingData.total_cost_with_charges}
                                                                    onChange={(e) => {
                                                                        setEditingData((prev) => ({
                                                                            ...prev,
                                                                            total_cost_with_charges: e.target.value,
                                                                        }));
                                                                    }}
                                                                    onFocus={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.add("hidden");
                                                                        e.currentTarget.classList.remove("text-transparent");
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.remove("hidden");
                                                                        e.currentTarget.classList.add("text-transparent");
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent px-1 outline-none"
                                                                />

                                                                {/* visible placeholder */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                    {Number(entry.total_cost_with_charges ?? entry.total_cost).toFixed(2) + "$"}
                                                                </div>

                                                                {/* height reference */}
                                                                <div className="text-transparent pointer-events-none">
                                                                    {Number(entry.total_cost_with_charges ?? entry.total_cost).toFixed(2) + "$"}
                                                                </div>

                                                            </div>
                                                            :
                                                            Number(entry.total_cost_with_charges ?? entry.total_cost).toFixed(2) + "$"
                                                    }
                                                </td>
                                                <td className="p-2 border">
                                                    {
                                                        editingId === entry.id ?
                                                            <div className="relative overflow-hidden bg-transparent border-2 border-green-400 border-dashed px-5">

                                                                {/* absolute input overlay */}
                                                                <input
                                                                    type="date"
                                                                    value={editingData.created_at}
                                                                    onChange={(e) => {
                                                                        setEditingData((prev) => ({
                                                                            ...prev,
                                                                            created_at: e.target.value,
                                                                        }));
                                                                    }}
                                                                    onFocus={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.add("hidden");
                                                                        e.currentTarget.classList.remove("text-transparent");
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                                                                        placeholder?.classList.remove("hidden");
                                                                        e.currentTarget.classList.add("text-transparent");
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full bg-transparent text-transparent px-1 outline-none"
                                                                />

                                                                {/* visible placeholder */}
                                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                                                    {new Date(entry.created_at).toLocaleDateString("fr-CA")}
                                                                </div>

                                                                {/* height reference */}
                                                                <div className="text-transparent pointer-events-none">
                                                                    {new Date(entry.created_at).toLocaleDateString("fr-CA")}
                                                                </div>

                                                            </div>
                                                            :
                                                            new Date(entry.created_at).toLocaleDateString("fr-CA")
                                                    }
                                                </td>
                                                <td className="p-2 border ">
                                                    {editingId === entry.id ? (
                                                        <div className="relative bg-transparent border-2 border-green-400 border-dashed px-2 py-1">

                                                            {/* input for search */}
                                                            <input
                                                                type="text"
                                                                value={editingData.field}
                                                                onChange={(e) => setEditingData((prev) => ({ ...prev, field: e.target.value }))}
                                                                placeholder="Rechercher un champ..."
                                                                className="w-full px-1 py-1 outline-none"
                                                                onFocus={(e) => {
                                                                    const list = e.currentTarget.nextElementSibling
                                                                    list?.classList.remove("hidden")
                                                                }}
                                                                onBlur={(e) => {
                                                                    const list = e.currentTarget.nextElementSibling
                                                                    list?.classList.add("hidden")
                                                                }}
                                                            />



                                                            {/* dropdown list */}
                                                            <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border rounded shadow z-50">
                                                                {fields.filter(f =>
                                                                    f.field.toLowerCase().includes(editingData.field.toLowerCase())
                                                                ).map(f => (
                                                                    <div
                                                                        key={f.field}
                                                                        onMouseDown={() => setEditingData(prev => ({ ...prev, field: f.field }))}
                                                                        className="px-2 py-1 hover:bg-green-100 cursor-pointer"
                                                                    >
                                                                        {f.field}
                                                                    </div>
                                                                ))}
                                                                {fields.filter(f =>
                                                                    f.field.toLowerCase().includes(editingData.field.toLowerCase())
                                                                ).length === 0 && <div className="px-2 py-1 text-gray-400">Aucun résultat</div>}
                                                            </div>

                                                        </div>



                                                    ) : (
                                                        entry.field || "N/A"
                                                    )
                                                    }
                                                </td>
                                                <td className="p-2 border">
                                                    <button
                                                        onClick={async () => {
                                                            if (editingId === entry.id) {
                                                                // ✅ Row is being edited → confirm changes
                                                                try {
                                                                    const updated = await fetchWithAuth<PatchTaskCostResponse>(
                                                                        `${API_BASE_URL}/data/costs/${entry.id}`,
                                                                        {
                                                                            method: "PATCH",
                                                                            headers: {
                                                                                "Content-Type": "application/json",
                                                                                Authorization: `Bearer ${token}`,
                                                                            },
                                                                            body: JSON.stringify({
                                                                                vegetable: editingData.vegetable,
                                                                                category: editingData.category,
                                                                                sub_category: editingData.sub_category,
                                                                                total_hours: Number(editingData.total_hours),
                                                                                total_worker: Number(editingData.total_worker),
                                                                                supervisor: editingData.supervisor,
                                                                                total_cost: Number(editingData.total_cost),
                                                                                total_cost_with_charges: Number(editingData.total_cost_with_charges),
                                                                                created_at: editingData.created_at,
                                                                                field: editingData.field,
                                                                            }),
                                                                        }
                                                                    );

                                                                    // Update the table locally
                                                                    setLatestEntries((prev) =>
                                                                        prev.map((e) =>
                                                                            e.id === entry.id ? { ...e, ...updated.entry } : e
                                                                        )
                                                                    );

                                                                    // Exit edit mode
                                                                    setEditingId(null);
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert("Erreur lors de la modification.");
                                                                }
                                                            } else {
                                                                // 🖊 Start editing this row
                                                                startEditing(entry);
                                                            }
                                                        }}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                                                    >
                                                        {editingId === entry.id ? "Confirmer" : "Modifier"}
                                                    </button>

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
