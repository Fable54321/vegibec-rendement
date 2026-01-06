import { ChevronRightIcon } from "@heroicons/react/24/solid"
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const OtherCostsInput = () => {

    const [category, setCategory] = useState<string>("SEMENCE");
    const [amount, setAmount] = useState<number | "">("");
    const [cultureSpecified, setCultureSpecified] = useState<boolean>(false);
    const [culture, setCulture] = useState<string>("CHOU");
    // const [entryDate, setEntryDate] = useState<string>("");
    const [isUnspecified, setIsUnspecified] = useState<boolean>(false);
    const [isSeasonal, setIsSeasonal] = useState<boolean>(false);
    const [description, setDescription] = useState<string>("");

    const currentYear = new Date().getFullYear();
    const [costYear, setCostYear] = useState<number>(currentYear);

    const { token } = useAuth();


    const categories = ["SEMENCE",
        "EMBALLAGE",
        "FÉRIÉ LOCAUX", "FÉRIÉ_TET", "LOCATION_TERRE", "PRÉAVIS LOCAUX", "VACANCES LOCAUX", "VACANCES TET",
        "Chaux calcique", "Engrais chimiques", "Engrais verts", "Fumier", "Terre et Terreaux", "HORS CATÉGORIE"];


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
        "CULTIVAR",
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

    type UnspecifiedCostPayload = {
        category: string; // keep category for consistency
        amount: number;
        vegetable: string | null;
        year: number;
        cost_domain: "UNSPECIFIED";
        employee_name: string;
        description: string;
        is_seasonal: boolean;
    };

    type RegularCostPayload = {
        category: string;
        amount: number;
        vegetable: string;
        year: number;
        cost_domain: string; // same as category for regular costs
        employee_name: string;
        description?: never;
        is_seasonal?: never;
    };

    type SubmitPayload = UnspecifiedCostPayload | RegularCostPayload;




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || amount <= 0) {
            alert("Veuillez entrer un montant valide.");
            return;
        }

        if (costYear < 2000 || costYear > currentYear + 1) {
            alert("Année invalide.");
            return;
        }

        if (isUnspecified && !description.trim()) {
            alert("Veuillez ajouter une description pour les coûts hors catégorie.");
            return;
        }

        try {
            const endpoint = `${API_BASE_URL}/other-costs-entry`;

            let payload: SubmitPayload;

            // Build payload
            if (isUnspecified) {
                payload = {
                    category,
                    amount: Number(amount),
                    vegetable: cultureSpecified ? culture : "AUCUNE",
                    year: costYear,
                    cost_domain: "UNSPECIFIED",
                    employee_name: "-", // or from auth
                    description,
                    is_seasonal: isSeasonal ?? false
                };
            } else {
                payload = {
                    category,
                    amount: Number(amount),
                    vegetable: cultureSpecified ? culture : "AUCUNE",
                    year: costYear,
                    cost_domain: category,
                    employee_name: "-"
                };
            }

            const data = await fetchWithAuth(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }) as { success?: boolean };

            if (data?.success === false) {
                throw new Error("Échec côté serveur");
            }

            // Reset form
            setAmount("");
            setCultureSpecified(false);
            setCulture("CHOU");
            setCategory("SEMENCE");
            setIsSeasonal(false);
            setDescription("");

            alert("Coût ajouté avec succès ✅");

        } catch (err) {
            console.error(err);
            alert("Erreur serveur ❌");
        }
    };


    useEffect(() => {
        if (category === "HORS CATÉGORIE") {
            setIsUnspecified(true);
        } else {
            setIsUnspecified(false);
        }
    }, [category]);


    return (
        <>
            <Link to="/" className="button-generic absolute left-[50%] translate-x-[-50%] top-[5.5rem] text-[1.1rem]"> Accueil</Link>
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
                        <input
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAmount(value === "" ? "" : Number(value));
                            }}
                            type="number"
                            className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]"
                        />

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
                    {
                        isUnspecified &&
                        <div className="flex flex-col w-full px-[1rem] gap-[2rem]">
                            <label htmlFor="isSeasonal">
                                Coût Saisonnier ?
                                <input type="checkbox" name="isSeasonal" id="isSeasonal" checked={isSeasonal} onChange={(e) => setIsSeasonal(e.target.checked)} className="ml-[0.5rem] border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" />
                            </label>
                            <label className="flex flex-col relative gap-[0.5rem]" htmlFor="description">
                                <span>Courte description <span className="text-[0.8rem] inline">(ex : électricité, maintenance, etc.)</span> :</span>

                                <input type="text" name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="ml-[0.5rem] border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]" />
                            </label>
                        </div>
                    }

                    <label className="flex flex-col w-full gap-[0.5rem] px-[1rem]">
                        Année du coût :
                        <input
                            type="number"
                            min="2000"
                            max={currentYear + 1}
                            value={costYear}
                            onChange={(e) => setCostYear(Number(e.target.value))}
                            className="border border-gray-400 rounded-[0.25rem] px-[0.5rem] py-[0.25rem] text-[1em]"
                        />
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
        </>
    )
}

export default OtherCostsInput
