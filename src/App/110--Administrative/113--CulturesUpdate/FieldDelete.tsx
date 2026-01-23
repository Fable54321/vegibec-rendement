import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import "./field.css";

type FieldDeleteProps = {
    field: string;
    setField: (field: string) => void;
    fields: { field: string }[];
    refreshFields: () => Promise<void>;
    fieldsLoading: boolean;
};

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

const FieldDelete = ({
    field,
    setField,
    fields,
    refreshFields,
    fieldsLoading,
}: FieldDeleteProps) => {
    const { token } = useAuth();

    const [fieldDeleteLoading, setFieldDeleteLoading] = useState(false);
    const [fieldSearch, setFieldSearch] = useState("");
    const [fieldMessage, setFieldMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Filter for searchable dropdown
    const filteredFields = fields.filter((f) =>
        f.field.includes(fieldSearch.trim().toUpperCase())
    );

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!field.trim()) return;

        const normalizedField = field.trim().toUpperCase();

        try {
            setFieldDeleteLoading(true);

            await fetchWithAuth(`${API_BASE_URL}/getfields`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ field: normalizedField }),
            });

            // Success message
            setFieldMessage({ type: "success", text: `Le champ "${normalizedField}" a été supprimé avec succès !` });

            // Reset input & search
            setField("");
            setFieldSearch("");
            refreshFields();
        } catch (error: any) {
            let errorText = `Échec de la suppression du champ "${normalizedField}".`;
            if (error?.message) {
                try {
                    const parsed = JSON.parse(error.message);
                    if (parsed?.error) errorText = parsed.error;
                } catch (parseError) {
                    console.warn("Failed to parse error message:", parseError);
                }
            }
            setFieldMessage({ type: "error", text: errorText });
            console.error("Failed to delete field:", error);
        } finally {
            setFieldDeleteLoading(false);

            // Clear message automatically after 4s
            setTimeout(() => setFieldMessage(null), 4000);
        }
    };

    return (
        <article>
            <h1 className="text-2xl font-semibold mb-4 mt-4">Supprimer un champ</h1>

            <form
                onSubmit={handleDelete}
                className="w-full flex flex-col gap-3 max-w-md max-sm:w-[95%]"
            >
                {/* Searchable dropdown */}
                <label className="flex flex-col">
                    <span className="text-sm text-gray-600 mb-1">
                        Sélectionnez le champ à supprimer
                    </span>

                    <div className="relative overflow-hidden border rounded px-3 py-2">
                        {!fieldSearch && !isFocused && (
                            <span className="scroll-left-right absolute left-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-gray-400 pointer-events-none">
                                Rechercher un champ existant...
                            </span>
                        )}

                        <input
                            type="text"
                            value={fieldSearch}
                            onChange={(e) => setFieldSearch(e.target.value)}
                            className="w-full outline-none bg-transparent"
                            disabled={fieldsLoading || fieldDeleteLoading}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </div>

                    {/* Dropdown list */}
                    {fieldSearch && (
                        <div className="border rounded mt-1 max-h-40 overflow-y-auto bg-white">
                            {filteredFields.length > 0 ? (
                                filteredFields.map((f) => (
                                    <div
                                        key={f.field}
                                        className="px-3 py-1 text-sm text-gray-700 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
                                        onClick={() => {
                                            setField(f.field);
                                            setFieldSearch(f.field);
                                        }}
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

                {/* Show selected field */}
                {field && (
                    <p className="text-sm text-gray-700">
                        Champ sélectionné : <strong>{field}</strong>
                    </p>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={fieldDeleteLoading || !field}
                    className="bg-red-700 text-white py-2 px-4 rounded hover:bg-red-400 disabled:opacity-50"
                >
                    {fieldDeleteLoading ? "Suppression en cours..." : "Supprimer le champ"}
                </button>

                {/* Success / Error message */}
                {fieldMessage && (
                    <p
                        className={`mt-2 text-sm ${fieldMessage.type === "success" ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {fieldMessage.text}
                    </p>
                )}
            </form>
        </article>
    );
};

export default FieldDelete;
