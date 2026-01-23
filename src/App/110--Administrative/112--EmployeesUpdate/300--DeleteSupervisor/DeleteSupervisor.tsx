import { useState } from "react";
import { useDeleteSupervisor } from "@/hooks/handleDeleteSupervisor";
import { type SupervisorType } from "@/context/supervisors/SupervisorContext";

const DeleteSupervisor = ({
    supervisors,
}: {
    supervisors: SupervisorType[];
}) => {
    const { handleDeleteSupervisor, loading, error } =
        useDeleteSupervisor();

    const [selected, setSelected] = useState("");
    const [success, setSuccess] = useState(false);

    const handleDelete = async () => {
        if (!selected) return;

        setSuccess(false);
        await handleDeleteSupervisor(selected);
        setSelected("");
        setSuccess(true);
    };

    return (
        <section className="w-full max-w-md mx-auto mt-6">
            <h2 className="text-xl font-semibold mb-4 text-red-700">
                Supprimer un superviseur
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
                {supervisors.map((name) => (
                    <option key={name.supervisor} value={name.supervisor}>
                        {name.supervisor}
                    </option>
                ))}
            </select>

            {selected && (
                <p className="mt-2 text-sm text-gray-700">
                    Êtes-vous sûr de vouloir supprimer{" "}
                    <strong>{selected}</strong> ?
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
                    Superviseur supprimé avec succès
                </p>
            )}
        </section>
    );
};

export default DeleteSupervisor;
