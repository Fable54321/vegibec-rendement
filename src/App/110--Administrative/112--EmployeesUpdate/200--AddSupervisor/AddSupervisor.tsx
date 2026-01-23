import { useAddSupervisor } from "@/hooks/handleAddSupervisor";
import { useState } from "react";
import { type SupervisorType } from "@/context/supervisors/SupervisorContext";

const AddSupervisor = ({ supervisors }: { supervisors: SupervisorType[] }) => {
    const [name, setName] = useState("");
    const { handleAddSupervisor, loading, error } = useAddSupervisor();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleAddSupervisor(name);
        setName("");
    };

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col items-center mt-[2rem] gap-[0.8rem] w-[min(85%,_400px)]"
        >
            <input
                type="text"
                placeholder="Nom du superviseur"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="border rounded px-3 py-2 w-full"
            />

            <button
                className="button-generic text-[0.8rem]"
                type="submit"
                disabled={loading}
            >
                {loading ? "Ajout en cours" : "Ajouter un superviseur"}
            </button>

            <h3 className="text-lg font-semibold">
                Liste actuelle des superviseurs
            </h3>

            <select
                disabled
                size={Math.min(supervisors.length, 20)}
                className="flex flex-col border-2 border-green-700 rounded-md px-3 py-2 w-full  cursor-not-allowed"
            >
                {supervisors.map((supervisor, index) => (
                    <option
                        key={index}
                        value={supervisor.supervisor}
                        className="text-[1.1em] text-black border-b-1 border-green-400 mb-[0.4rem]"
                    >
                        {supervisor.supervisor}
                    </option>
                ))}
            </select>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
};

export default AddSupervisor;
