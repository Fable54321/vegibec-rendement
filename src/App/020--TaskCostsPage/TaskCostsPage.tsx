import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import { fr } from "date-fns/locale";
import FormatCost from "../../assets/Functions/formatcost";
import FormatHours from "../../assets/Functions/FormatHours";
import capitalizeName from "@/assets/Functions/capitalizeName";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

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



    const [groupBy, setGroupBy] = useState("supervisor");
    const [data, setData] = useState<CostRow[]>([]);


    const [customizedRange, setCustomizedRange] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [yearSelected, setYearSelected] = useState<string | undefined>(undefined);
    const [monthSelected, setMonthSelected] = useState<string | undefined>(undefined);

    const months = [
        { value: "01", label: "Janvier" }, { value: "02", label: "Février" }, { value: "03", label: "Mars" },
        { value: "04", label: "Avril" }, { value: "05", label: "Mai" }, { value: "06", label: "Juin" },
        { value: "07", label: "Juillet" }, { value: "08", label: "Août" }, { value: "09", label: "Septembre" },
        { value: "10", label: "Octobre" }, { value: "11", label: "Novembre" }, { value: "12", label: "Décembre" },
    ];

    const getGroupValue = (row: CostRow, key: string) => {
        switch (key) {
            case "vegetable": return row.vegetable;
            case "category": return row.category;
            case "sub_category": return row.sub_category;
            case "supervisor": return row.supervisor;
            default: return "";
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

    // --- Fetch main cost summary ---
    const fetchData = async () => {
        try {
            let url = `https://vegibec-rendement-backend.onrender.com/data/costs/summary?groupBy=${groupBy}`;

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

            const json = await fetchWithAuth(url); // <-- use fetchWithAuth
            if (Array.isArray(json)) setData(json);
            else setData([]);
        } catch (err) {
            console.error("Fetch failed:", err);
            setData([]);
        }
    };


    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupBy, startDate, endDate, yearSelected, monthSelected]);



    return (
        <>
            <div className="p-1 flex flex-col items-center w-full max-sm:text-[0.9em]">
                <h1 className="text-2xl font-bold mb-4">Rapports de coûts de tâches</h1>

                <div className="flex gap-2 mb-4">
                    <label>Grouper par:</label>
                    <select className="w-[65%] border-1 border-green-400" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                        <option value="vegetable">Culture</option>
                        <option value="category">Catégorie de tâche</option>
                        <option value="sub_category">Sous-Catégorie de tâche</option>
                        <option value="supervisor">Superviseur</option>
                    </select>
                </div>

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
                                    {groupBy === "vegetable" ? "Culture" :
                                        groupBy === "category" ? "Catégorie de tâche" :
                                            groupBy === "sub_category" ? "Sous-Catégorie de tâche" :
                                                "Superviseur"}
                                </th>
                                <th className="border-1 border-green-400 p-2 rounded-[0.5rem]">
                                    Heures Totales<span className="block text-[0.7rem]">(des groupes supervisés)</span>
                                </th>
                                <th className="border-1 border-green-400 p-2 rounded-[0.5rem]">Coûts totaux</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => (
                                <tr key={i}>
                                    <td className="border-1 border-green-400 p-2">
                                        {(() => {
                                            if (groupBy === "sub_category") return `${row.sub_category} (${row.category})`;
                                            if (groupBy === "supervisor") return capitalizeName(row.supervisor);
                                            return getGroupValue(row, groupBy);
                                        })()}
                                    </td>
                                    <td className="border-1 border-green-400 p-2">
                                        <FormatHours hours={row.total_hours} />
                                    </td>
                                    <td className="border-1 border-green-400 p-2">
                                        <FormatCost cost={row.total_cost} />
                                    </td>
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


