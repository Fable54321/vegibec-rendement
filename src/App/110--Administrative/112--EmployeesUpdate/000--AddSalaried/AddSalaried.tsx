import { useAddEmployee } from "@/hooks/handleAddEmployee"
import { useState } from "react";

const AddSalaried = ({ employees }: { employees: string[] }) => {

    const [name, setName] = useState("");
    const { handleAddEmployee, loading, error } = useAddEmployee();



    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleAddEmployee(name);
        setName(""); // clear input
    };


    return (
        <form onSubmit={onSubmit} className="flex flex-col items-center mt-[2rem] gap-[0.8rem] w-[min(85%,_400px)]">
            <input
                type="text"
                placeholder="Nom de l'employé"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="border rounded px-3 py-2 w-full"
            />
            <button className="button-generic text-[0.8rem]" type="submit" disabled={loading}>
                {loading ? "Ajout en cours" : "Ajouter un salarié"}
            </button>

            <h3 className="text-lg font-semibold ">
                Liste actuelle des salariés
            </h3>

            <select
                disabled
                size={Math.min(employees.length, 20)} // shows multiple rows
                className="flex flex-col border-2 border-green-700  rounded-md px-3 py-2 w-full   cursor-not-allowed"
            >
                {employees.map((employee) => (
                    <option
                        className="text-[1.1em] text-black  border-b-1 border-green-400 mb-[0.4rem]"
                        key={employee} value={employee}>

                        {employee}
                    </option>
                ))}
            </select>


            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    )
}

export default AddSalaried
