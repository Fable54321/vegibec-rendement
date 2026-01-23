import { useState } from "react";
import { useDeleteEmployee } from "@/hooks/handleDeleteEmployee";


const EmployeeDeleteSection = ({ employees }: { employees: string[] }) => {

    const { handleDeleteEmployee, loading, error } = useDeleteEmployee();

    const [selected, setSelected] = useState("");
    const [success, setSuccess] = useState(false);

    const handleDelete = async () => {
        if (!selected) return;

        setSuccess(false);
        await handleDeleteEmployee(selected);
        setSelected("");
        setSuccess(true);
    };

    return (
        <section className="w-full max-w-md mx-auto mt-6">
            <h2 className="text-xl font-semibold mb-4 text-red-700">
                Supprimer un employé
            </h2>

            <select
                value={selected}
                onChange={(e) => {
                    setSelected(e.target.value);
                    setSuccess(false);
                }}
                className="border rounded px-3 py-2 w-full"
            >
                <option value="">— Sélectionner —</option>
                {employees.map((name) => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))}
            </select>

            {/* Optional confirmation text */}
            {selected && (
                <p className="mt-2 text-sm text-gray-700">
                    Êtes-vous sûr de vouloir supprimer <strong>{selected}</strong> ?
                </p>
            )}

            <button
                onClick={handleDelete}
                disabled={!selected || loading}
                className="mt-4 bg-red-600 text-white rounded py-2 w-full disabled:opacity-50 hover:cursor-pointer"
            >
                {loading ? "Suppression..." : "Supprimer"}
            </button>

            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
            {success && !error && (
                <p className="text-green-700 mt-2 text-sm">
                    Employé supprimé avec succès
                </p>
            )}
        </section>
    );
};

export default EmployeeDeleteSection;
