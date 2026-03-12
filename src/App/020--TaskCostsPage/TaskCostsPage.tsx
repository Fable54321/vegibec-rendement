import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import { fr } from "date-fns/locale";
import capitalizeName from "../../assets/Functions/capitalizeName";


import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useVegetables } from "@/context/vegetables/VegetablesContext";

const TaskCostsPage = () => {
    type CostRow = {
        vegetable: string;
        category: string;
        sub_category: string;
        supervisor: string;
        total_hours: number;
        total_cost: number;
        displayCost?: number;
        isRedistributed?: boolean;
        originalCost?: number;
    };



    const [groupBy, setGroupBy] = useState<string | string[]>("supervisor");
    const [data, setData] = useState<CostRow[]>([]);


    const [customizedRange, setCustomizedRange] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [yearSelected, setYearSelected] = useState<string | undefined>(undefined);
    const [monthSelected, setMonthSelected] = useState<string | undefined>(undefined);
    const [selectedVegetable, setSelectedVegetable] = useState<string | undefined>(undefined);

    const { vegetables } = useVegetables();

    const months = [
        { value: "01", label: "Janvier" }, { value: "02", label: "Février" }, { value: "03", label: "Mars" },
        { value: "04", label: "Avril" }, { value: "05", label: "Mai" }, { value: "06", label: "Juin" },
        { value: "07", label: "Juillet" }, { value: "08", label: "Août" }, { value: "09", label: "Septembre" },
        { value: "10", label: "Octobre" }, { value: "11", label: "Novembre" }, { value: "12", label: "Décembre" },
    ];

    const formatCost = (cost: number) => {
        return new Intl.NumberFormat("fr-CA", {
            style: "currency",
            currency: "CAD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(cost);
    };


    const groupingOptions = [
        { label: "Culture", value: ["vegetable"] },
        { label: "Catégorie", value: ["category"] },
        { label: "Sous-Catégorie", value: ["sub_category"] },
        { label: "Superviseur", value: ["supervisor"] },
        { label: "Culture / Sous-Catégorie", value: ["vegetable", "sub_category"] },
        { label: "Culture / Catégorie", value: ["vegetable", "category"] },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

    // --- Fetch main cost summary ---
    const fetchData = async () => {
        try {
            const groupParam = Array.isArray(groupBy)
                ? groupBy.join(",")
                : groupBy;

            let url = `https://vegibec-rendement-backend.onrender.com/data/costs/summary?groupBy=${encodeURIComponent(groupParam)}`;

            if (yearSelected) {
                if (monthSelected) {
                    const start = `${yearSelected}-${monthSelected}-01`;
                    const end = `${yearSelected}-${monthSelected}-31`;
                    url += `&start=${start}&end=${end}`;
                } else {
                    url += `&start=${yearSelected}-01-01&end=${yearSelected}-12-31`;
                }
            } else if (startDate && endDate) {
                url += `&start=${startDate}&end=${endDate}`;
            }

            const json = await fetchWithAuth(url);

            if (Array.isArray(json)) {
                setData(json);
            } else {
                setData([]);
            }

        } catch (err) {
            console.error("Fetch failed:", err);
            setData([]);
        }
    };


    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupBy, startDate, endDate, yearSelected, monthSelected]);

    const groupFields = Array.isArray(groupBy) ? groupBy : [groupBy];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getLabel = (item: any) => {
        return groupFields
            .map((field) => item[field])
            .filter(Boolean)
            .join(" - ");
    };

    const includesVegetable = groupFields.includes("vegetable");

    const filteredData = selectedVegetable
        ? data.filter((row) => row.vegetable === selectedVegetable)
        : data;

    return (



        <>


            <div className="p-1 flex flex-col items-center w-full max-sm:text-[0.9em]">

                <Link to="/entrer-couts-des-taches" className="button-generic mt-2">Retour</Link>

                <h1 className="text-2xl font-bold mb-4 mt-4">Rapports de coûts de tâches</h1>

                <div className="flex gap-2 mb-4">
                    <label>Grouper par:</label>
                    <select
                        value={Array.isArray(groupBy) ? groupBy.join(",") : groupBy}
                        onChange={(e) => setGroupBy(e.target.value.split(","))}
                    >
                        {groupingOptions.map((opt) => (
                            <option key={opt.value.join(",")} value={opt.value.join(",")}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {includesVegetable && (
                    <div className="flex gap-2 mb-4 items-center">
                        <label>Culture:</label>

                        <Select
                            value={selectedVegetable ?? "all"}
                            onValueChange={(val) =>
                                setSelectedVegetable(val === "all" ? undefined : val)
                            }
                        >
                            <SelectTrigger className="border-1 border-green-400 w-[200px]">
                                <SelectValue placeholder="Toutes les cultures" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">Toutes les cultures</SelectItem>

                                {vegetables.map((veg) => (
                                    <SelectItem key={veg.vegetable} value={veg.vegetable}>
                                        {capitalizeName(veg.vegetable)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* DATE PICKER SECTION */}
                <section className="flex flex-col items-center gap-[1rem] mb-[0.5rem]">
                    {!customizedRange && (
                        <div className="w-full flex flex-col items-center">
                            <label htmlFor="yearSelect">Sélectionner une année (optionnel):</label>
                            <Select value={yearSelected} onValueChange={setYearSelected} aria-labelledby="yearSelect">
                                <SelectTrigger className="border-1 border-green-400">
                                    <SelectValue placeholder="Sélectionnez une année" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            {yearSelected && (
                                <div className="w-full flex flex-col items-center mt-2">
                                    <label htmlFor="monthSelect">Sélectionner un mois (optionnel):</label>
                                    <Select value={monthSelected ?? "none"} onValueChange={(val) => setMonthSelected(val === "none" ? undefined : val)}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionnez un mois" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Toute l'année</SelectItem>
                                            {months.map((month) => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}

                    {customizedRange && (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="start">Début:</label>
                            <DatePicker
                                className="cost-datepicker border-2 border-green-400 rounded-[0.55rem] text-center"
                                locale={fr}
                                showYearDropdown
                                yearDropdownItemNumber={5}
                                showMonthDropdown
                                dateFormat="yyyy-MM-dd"
                                minDate={new Date("2024-01-01")}
                                maxDate={new Date()}
                                dropdownMode="select"
                                placeholderText="Date de début"
                                selected={startDate ? new Date(startDate) : null}
                                onChange={(date) => setStartDate(date ? date.toISOString().split("T")[0] : "")}
                            />
                            <label htmlFor="end">Fin:</label>
                            <DatePicker
                                className="cost-datepicker border-2 border-green-400 rounded-[0.55rem] text-center"
                                showYearDropdown
                                showMonthDropdown
                                yearDropdownItemNumber={5}
                                locale={fr}
                                dateFormat="yyyy-MM-dd"
                                minDate={new Date("2024-01-01")}
                                maxDate={new Date()}
                                dropdownMode="select"
                                placeholderText="Date de fin"
                                selected={endDate ? new Date(endDate) : null}
                                onChange={(date) => setEndDate(date ? date.toISOString().split("T")[0] : "")}
                            />
                        </div>
                    )}

                    <button className="button-generic" onClick={() => {
                        setCustomizedRange(!customizedRange);
                        setYearSelected("");
                        setMonthSelected("");
                    }}>
                        {customizedRange ? "Annuler" : "Personnaliser"}
                    </button>
                </section>

                <Link className="my-[0.5rem] text-green-700 decoration-1 underline font-bold w-[50%] text-[1.1rem] text-center" to="/couts-des-taches/visualisation">
                    Représentation graphique
                </Link>

                {/* TABLE SECTION */}
                <section className="flex flex-col items-center w-[min(98%,_40rem)] border-2 border-green-700 rounded-[0.5rem] overflow-x-scroll">
                    <table className="w-full">
                        <thead className="border-b-3 border-green-400 border-dotted">
                            <tr>
                                <th className="border-1 border-green-400 p-2 rounded-[0.5rem]">
                                    {groupFields
                                        .map((field) =>
                                            field === "vegetable"
                                                ? "Culture"
                                                : field === "category"
                                                    ? "Catégorie de tâche"
                                                    : field === "sub_category"
                                                        ? "Sous-catégorie de tâche"
                                                        : "Superviseur"
                                        )
                                        .join(" / ")}
                                </th>
                                <th className="border-1 border-green-400 p-2 rounded-[0.5rem]">
                                    Heures Totales<span className="block text-[0.7rem]">(des groupes supervisés)</span>
                                </th>
                                <th className="border-1 border-green-400 p-2 rounded-[0.5rem]">Coûts totaux</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr className="border border-green-400 " key={index}>
                                    <td className="p-2">{getLabel(item)}</td>
                                    <td className="p-2 border border-x-2 border-green-400">{item.total_hours}</td>
                                    <td className="p-2">{formatCost(item.total_cost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>

            <div className="flex flex-col items-center mt-[1rem]">
                <Link to="/entrer-couts-des-taches" className="text-green-700 decoration-1 underline font-bold w-[50%] text-[1.1rem] text-center">retour à la complétion de rapport</Link>
            </div>

            {/* ******PRECISION****** */}
            <section className="flex flex-col items-center">
                <p className="mt-[2rem] text-[0.9rem] italic text-gray-600 max-w-[600px] text-center">
                    Les coûts ci-présentés sont présentés selon les entrées originales. Pour voir les coûts génériques reditribués, visiter la page :
                </p>
                <Link to="/couts" className="text-green-700 decoration-1 underline font-bold w-[50%] text-[1.1rem] text-center mb-[2rem]">
                    Coûts
                </Link>
            </section>
        </>
    );
};

export default TaskCostsPage;


