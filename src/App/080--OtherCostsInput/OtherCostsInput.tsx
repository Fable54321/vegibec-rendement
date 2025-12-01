import { ChevronRightIcon } from "@heroicons/react/24/solid"
import { useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

const OtherCostsInput = () => {

    const [category, setCategory] = useState<string>("SEMENCE");
    const [amount, setAmount] = useState<number | "">("");
    const [cultureSpecified, setCultureSpecified] = useState<boolean>(false);
    const [culture, setCulture] = useState<string>("CHOU");
    const [entryDate, setEntryDate] = useState<string>("");

    const { token } = useAuth();


    const categories = ["SEMENCE",
        "EMBALLAGE",
        "FÉRIÉ LOCAUX", "FÉRIÉ_TET", "LOCATION_TERRE", "PRÉAVIS LOCAUX", "VACANCES LOCAUX", "VACANCES TET",
        "Chaux calcique", "Engrais chimiques", "Engrais verts", "Fumier", "Terre et Terreaux"]


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

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || amount <= 0) {
            alert("Veuillez entrer un montant valide.");
            return;
        }

        const payload = {
            category,
            amount: Number(amount),
            vegetable: cultureSpecified ? culture : "AUCUNE",
            entry_date: entryDate || null,
        };

        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/other-costs-entry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }) as {
                success: boolean;
                insertedId?: number;
            };

            if (!data.success) {
                throw new Error("Échec côté serveur");
            }

            // ✅ Reset form on success
            setAmount("");
            setCultureSpecified(false);
            setCulture("CHOU");
            setCategory("SEMENCE");

            alert("Coût ajouté avec succès ✅");

        } catch (err) {
            console.error(err);
            alert("Erreur serveur ❌");
        }
    };


    return (
        <article className="flex flex-col items-center md:text-[1.5em] mt-[9rem]">
            <h2 className="text-center text-[1.5em]">Entrée des autres coûts</h2>
            <form className="mt-[1rem] flex flex-col items-center w-[min(90%,_400px)] md:w-[600px] gap-[1.7rem] rounded-[0.75rem] border-4 border-green-400 border-solid py-[1rem] px-[0.5rem]" onSubmit={handleSubmit}>
                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]" htmlFor="cost-category">
                    Catégorie :
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" name="cost-category" id="cost-category">
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                </label>
                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]" htmlFor="cost-description">
                    Montant ($) :
                    <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} type="number" name="cost-amount" id="cost-amount" className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" />
                </label>
                <label className="flex w-full gap-[0.5rem] px-[1rem]" htmlFor="crop-specified">
                    Culture Précisée :
                    <input checked={cultureSpecified} onChange={(e) => setCultureSpecified(e.target.checked)} type="checkbox" name="crop-specified" id="crop-specified" className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" />
                </label>
                {cultureSpecified &&
                    <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]" htmlFor="crop-select">
                        Culture :
                        <select value={culture} onChange={(e) => setCulture(e.target.value)} className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" name="crop-select" id="crop-select">
                            {allVegetables.map((veg, index) => (
                                <option key={index} value={veg}>{veg}</option>
                            ))}
                        </select>
                    </label>

                }
                <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]">
                    En date du :
                    <input
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        type="date" className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" />
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
                                ltr  w-fit">Soumettre <ChevronRightIcon className="w-5 h-5 md:w-7 md:h-7" /></button>
            </form>
        </article>
    )
}

export default OtherCostsInput
