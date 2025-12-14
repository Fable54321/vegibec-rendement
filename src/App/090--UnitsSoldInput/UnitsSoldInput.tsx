import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const allVegetables = [
    "CHOU",
    "CHOU DE BRUXELLES",
    "CHOU-FLEUR",
    "CHOU VERT",
    "CHOU PLAT",
    "CHOU ROUGE",
    "CHOU DE SAVOIE",
    "CÉLERI",
    "CŒUR DE ROMAINE",
    "ENDIVES",
    "LAITUE",
    "LAITUE POMMÉE",
    "LAITUE FRISÉE",
    "LAITUE FRISÉE VERTE",
    "LAITUE FRISÉE ROUGE",
    "LAITUE ROMAINE",
    "POIVRON",
    "POIVRON VERT",
    "POIVRON ROUGE",
    "POIVRON JAUNE",
    "POIVRON ORANGE",
    "POIVRON VERT/ROUGE",
    "ZUCCHINI",
    "ZUCCHINI VERT",
    "ZUCCHINI JAUNE",
    "ZUCCHINI LIBANAIS",
];

const UnitsSoldInput = () => {
    const { token } = useAuth();

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    const [culture, setCulture] = useState("CHOU VERT");
    const [value, setValue] = useState<number | "">("");
    const [entryDate, setEntryDate] = useState<string>("");

    const isKg = culture === "CHOU DE BRUXELLES"; // check for special vegetable

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!value || Number(value) <= 0) {
            alert(`Veuillez entrer un nombre de ${isKg ? "kg" : "unités"} valide.`);
            return;
        }

        const payload = {
            vegetable: culture,
            value: Number(value),
            is_kg: isKg,
            date_of_sale: entryDate || null,
        };

        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/units/send-data`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            console.log("Server response:", data);

            if (!data) {
                throw new Error("Server did not return data");
            }

            // Reset
            setValue("");
            setEntryDate("");

            alert("Entrée enregistrée avec succès ✅");

        } catch (err) {
            console.error(err);
            alert("Erreur serveur ❌");
        }
    };

    useEffect(() => {
        console.log("value changed:", value);
    }, [value]);

    return (

        <article className="flex flex-col items-center md:text-[1.5em] mt-[9rem]">
            <Link className="button-generic mb-[1rem]" to="/">Accueil</Link>
            <h2 className="text-center text-[1.5em]">Entrée des unités vendues</h2>

            <form
                onSubmit={handleSubmit}
                className="mt-[1rem] flex flex-col items-center w-[min(90%,_400px)] md:w-[600px] gap-[1.7rem] rounded-[0.75rem] border-4 border-green-400 border-solid py-[1rem] px-[0.5rem]"
            >

                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]">
                    Culture :
                    <select
                        value={culture}
                        onChange={(e) => setCulture(e.target.value)}
                        className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]"
                    >
                        {allVegetables.map((veg, index) => (
                            <option key={index} value={veg}>{veg}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]">
                    {isKg ? "Poids (kg)" : "Unités vendues"}:
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
                        className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]"
                    />
                </label>

                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]">
                    En date du :
                    <input
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]"
                    />
                </label>

                <button
                    type="submit"
                    className="bg-gradient-to-b from-[hsl(85,73%,56%)] to-[hsl(85,73%,26%)]

                        border border-black rounded-[4px]
                        text-white shadow-[-2px_4px_6px_hsl(0_0%_0%_/_0.5)]
                        px-[0.25rem] py-[0.25rem]
                        text-center text-[1.4em] font-bold
                        flex flex-row items-center justify-center gap-2
                        hover:cursor-pointer "
                >
                    Soumettre
                    <ChevronRightIcon className="w-5 h-5 md:w-7 md:h-7" />
                </button>

            </form>
        </article>
    );
};

export default UnitsSoldInput;
