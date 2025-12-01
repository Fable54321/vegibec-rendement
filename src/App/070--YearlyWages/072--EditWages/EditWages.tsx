import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

const EditWages = () => {

    interface SalaryPeriodResponse {
        id: number;
        employee_name: string;
        yearly_amount: number;
        start_date: string;
        days_in_year: number;
    }

    const [employees, setEmployees] = useState<string[]>([]);
    const [name, setName] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [annualSalary, setAnnualSalary] = useState<string>("");

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";
    const { token } = useAuth();

    // Fetch employees
    useEffect(() => {
        if (!token) return;
        const fetchEmployees = async () => {
            try {
                const employeesData: string[] = await fetchWithAuth(`${API_BASE_URL}/employees`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEmployees(employeesData);
            } catch (error) {
                console.error("Erreur lors de la récupération des employés :", error);
            }
        };
        fetchEmployees();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token) return;

        if (!name || !startDate || !annualSalary) {
            alert("Veuillez remplir tous les champs requis.");
            return;
        }

        // Ensure startDate is in YYYY-MM-DD
        const date = new Date(startDate);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/salary-periods`, {
                method: 'PUT', // Update route
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    employee_name: name,
                    yearly_amount: Number(annualSalary),
                    start_date: formattedDate,
                    year: yyyy,
                }),
            }) as SalaryPeriodResponse;

            alert(
                `Salaire modifié pour ${data.employee_name} : ${data.yearly_amount}$ ` +
                `à partir du ${data.start_date}.`
            );

            setAnnualSalary("");
            setStartDate("");
            setName("");

        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err.message);
                alert(err.message || "Une erreur est survenue lors de la modification du salaire.");
            } else {
                console.error("Une erreur inconnue est survenue.");
            }
        }
    };


    return (
        <article className="w-full flex flex-col items-center mt-[5rem] md:text-[1.5em]">
            <form onSubmit={handleSubmit} className="flex flex-col items-center w-[min(90%,_400px)] md:w-[600px] gap-[1.7rem] rounded-[0.75rem] border-4 border-green-400 border-solid py-[1rem] px-[0.5rem]">
                <h2 className="text-[1.5em] font-extrabold text-center">Modification d'un salaire</h2>

                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]">
                    <span className="font-bold">Nom de l'employé :</span>
                    <select value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]">
                        <option value="">Sélectionner un employé</option>
                        {employees.map((employee, index) => (
                            <option key={index} value={employee}>{employee}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]">
                    <span className="font-bold">Date de début :</span>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" />
                </label>

                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]">
                    <span className="font-bold">Salaire annuel (en $) :</span>
                    <input type="number" value={annualSalary} onChange={(e) => setAnnualSalary(e.target.value)} className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" />
                </label>

                <button type="submit" className="bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]
                                border border-black rounded-[4px]
                                box-border text-white
                                cursor-pointer
                                tracking-[-0.022em] leading-[1.47059]
                                shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                                overflow-visible
                                px-[0.25rem] py-[0.25rem]
                                text-center select-none
                                text-[1.4em]
                                font-bold
                                touch-manipulation
                                flex flex-row items-center justify-center
                                ltr  w-fit">
                    Modifier <ChevronRightIcon className="w-5 h-5 md:w-7 md:h-7" />
                </button>
            </form>
        </article>
    )
}

export default EditWages;
