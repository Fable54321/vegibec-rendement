import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import "./field.css";

type FieldUpdateProps = {
    field: string;
    setField: (field: string) => void;
    fields: ({ field: string }[]);
    refreshFields: () => Promise<void>;
    fieldsLoading: boolean;
}

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

const FieldUpdate = ({ field, setField, fields, refreshFields, fieldsLoading }: FieldUpdateProps) => {


    const { token } = useAuth();

    const [fieldSubmitLoading, setFieldSubmitLoading] = useState<boolean>(false);
    const [fieldMessage, setFieldMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [fieldSearch, setFieldSearch] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const filteredFields = fields.filter((f) =>
        f.field.includes(fieldSearch.trim().toUpperCase())
    );


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!field.trim()) return;

        const normalizedField = field.trim().toUpperCase();

        try {
            setFieldSubmitLoading(true);

            await fetchWithAuth(`${API_BASE_URL}/getfields`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    field: normalizedField,
                }),
            });

            // Success message
            setFieldMessage({ type: "success", text: `Le champ "${normalizedField}" a été ajouté avec succès !` });

            // Reset input
            setField("");
            refreshFields?.(); // refresh the list if provided
        } catch (error) {
            let errorText = "Échec de l'ajout du champ."; // fallback generic

            // fetchWithAuth throws Error with backend JSON string in message
            if (error instanceof Error) {
                try {
                    const parsed = JSON.parse(error.message);
                    if (parsed?.error) {
                        errorText = parsed.error; // use backend message directly
                    }
                } catch {
                    // If parsing fails, fallback to generic
                }
            }

            setFieldMessage({ type: "error", text: errorText });
            console.error("Failed to add field:", error);

            // Optional: clear the message after 4 seconds
            setTimeout(() => setFieldMessage(null), 4000);
        }
        finally {
            setFieldSubmitLoading(false);

            // Clear message automatically after 4 seconds
            setTimeout(() => setFieldMessage(null), 4000);
        }
    };





    return (
        <article>
            <h1 className="text-2xl font-semibold mb-4 mt-4">Ajouter un champ</h1>

            <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col gap-3 max-w-md max-sm:w-[95%]"
            >
                <label className="flex flex-col">
                    <span className="text-sm text-gray-600 mb-1">Nom du champ à ajouter</span>
                    <input
                        type="text"
                        value={field}
                        onChange={(e) => setField(e.target.value)}

                        placeholder="Ex: Champ 1"
                        className="border rounded px-3 py-2"
                        disabled={fieldSubmitLoading}
                    />
                </label>


                <button
                    type="submit"

                    className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-400"
                >
                    {fieldSubmitLoading ? "Ajout en cours..." : "Ajouter le champ"}
                </button>

                <label className="flex flex-col mt-[1rem]">
                    <span className=" mb-1">
                        Vérifier si le champ existe déjà
                    </span>

                    <div className="relative overflow-hidden border rounded px-3 py-2">
                        {!fieldSearch && !isFocused && (
                            <span className="scroll-left-right absolute left-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-gray-400  pointer-events-none">
                                Rechercher un champ existant...
                            </span>
                        )}

                        <input
                            type="text"
                            value={fieldSearch}
                            onChange={(e) => setFieldSearch(e.target.value)}
                            className="w-full outline-none bg-transparent"
                            disabled={fieldsLoading}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </div>


                    {fieldSearch && (
                        <div className="border rounded mt-1 max-h-40 overflow-y-auto bg-white">
                            {filteredFields.length > 0 ? (
                                filteredFields.map((f) => (
                                    <div
                                        key={f.field}
                                        className="px-3 py-1 text-sm text-gray-700 border-b last:border-b-0"
                                    >
                                        {f.field}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                    Aucun champ trouvé
                                </div>
                            )}
                        </div>
                    )}
                </label>


            </form>
            {fieldMessage && (
                <p
                    className={`mt-2 text-sm ${fieldMessage.type === "success" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {fieldMessage.text}
                </p>
            )}
        </article>
    )
}

export default FieldUpdate
