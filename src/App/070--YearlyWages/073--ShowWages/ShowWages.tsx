import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";


const ShowWages = () => {

    type salaryType = {
        employee_name: string;
        yearly_amount: number;
        start_date: string;
    };



    const [employees, setEmployees] = useState<string[]>([]);
    const [salaries, setSalaries] = useState<salaryType[]>([]);
    const [year, setYear] = useState<number | null>(null);


    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    const { token } = useAuth();

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        setYear(currentYear);
    }, [])



    useEffect(() => {

        if (!token) {
            return;
        }
        const fetchEmployees = async () => {
            try {
                const employeesData: string[] = await fetchWithAuth(`${API_BASE_URL}/employees`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )




                setEmployees(employeesData);

            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        fetchEmployees();


    }, [token]);

    useEffect(() => {

        if (!token) {
            return;
        }

        const fetchSalaries = async () => {
            try {
                const salariesData = await fetchWithAuth(`${API_BASE_URL}/salary-periods/by-year/${year}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ) as salaryType[];

                setSalaries(salariesData);
            }
            catch (error) {
                console.error('Error fetching salaries:', error);
            }

        }

        if (!year) return;

        fetchSalaries();

    }, [token, year])



    const formatDate = (dateString: string) => {
        // ✅ Forces date to be treated as plain YYYY-MM-DD with NO timezone shift
        const [year, month, day] = dateString.slice(0, 10).split("-");

        return `${day}/${month}/${year}`;
    };



    return (
        <article className="w-full flex flex-col items-center px-[0.25rem]">
            <h2 className="text-[1.5em] text-center font-bold mb-[1rem]">Salaires annuels pour l'année {year}</h2>
            <section className="border-4 border-green-400 rounded-2xl max-h-[80vh] overflow-y-auto ">
                <table>
                    <thead >
                        <tr>
                            <th className="border border-black px-[0.5rem] py-[0.25rem] border-l-0 border-t-0">Employé</th>
                            <th className="border border-black px-[0.5rem] py-[0.25rem] border-r-0 border-t-0">Salaire annuel</th>
                            <th className="border border-black px-[0.5rem] py-[0.25rem] border-r-0 border-t-0">En date du</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee, index) => {
                            const salaryData = salaries.find(
                                salary => salary.employee_name === employee
                            );

                            return (
                                <tr key={index}>
                                    <td className="border border-black px-[0.5rem] py-[0.25rem] border-l-0">{employee}</td>
                                    <td className="border border-black px-[0.5rem] py-[0.25rem] border-r-0">
                                        {salaryData?.yearly_amount || 0}</td>

                                    <td className="border border-black px-[0.5rem] py-[0.25rem] border-r-0">{salaryData ? formatDate(salaryData.start_date) : ""}</td>
                                </tr>
                            )
                        }
                        )}


                    </tbody>
                </table>

            </section>
        </article>
    )
}

export default ShowWages
