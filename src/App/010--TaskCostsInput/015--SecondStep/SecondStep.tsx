import './SecondPage.css';
import { useEffect, useState } from 'react';
import DatePicker from '../../Components/DatePicker';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import type { TaskCategory } from '@/context/taskCategories/TaskCategoriesContext';

interface SecondStepProps {
    numberOfWages: number | "";
    setNumberOfWages: React.Dispatch<React.SetStateAction<number | "">>;
    hoursInput: string;
    setHoursInput: React.Dispatch<React.SetStateAction<string>>;
    wages: (number | "")[];
    setWages: React.Dispatch<React.SetStateAction<(number | "")[]>>;
    multiplier: (number | "")[];
    setMultiplier: React.Dispatch<React.SetStateAction<(number | "")[]>>;
    isFirstStepCompleted: boolean;
    setIsFirstStepCompleted: React.Dispatch<React.SetStateAction<boolean>>;
    categories: TaskCategory[];
    selectedCategoryId: number | null;
    subCategory: string;
    cultureDefined: boolean;
    selectedVeggie: string;
    supervisor: string;
    selectedDate: Date | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
    field: string | null;
}

const SecondStep: React.FC<SecondStepProps> = ({
    numberOfWages, setNumberOfWages,
    hoursInput, setHoursInput,
    wages, setWages, multiplier, setMultiplier,
    setIsFirstStepCompleted,
    categories,
    selectedCategoryId,
    subCategory,
    cultureDefined, selectedVeggie,
    supervisor,
    selectedDate, setSelectedDate,
    field
}) => {



    const [useCustomDate, setUseCustomDate] = useState(false);
    const [totalHours, setTotalHours] = useState(0);
    const [displayTotal, setDisplayTotal] = useState(0);

    const numericHours = hoursInput === "" ? null : Number(hoursInput.replace(",", "."));
    // const total = numericHours === null
    //     ? 0
    //     : wages.reduce<number>((acc, cur, i) => {
    //         const c = Number(cur); // in case somehow a string slipped in
    //         const m = multiplier[i] === "" ? 1 : Number(multiplier[i]);
    //         return acc + c * m;
    //     }, 0);


    useEffect(() => {
        const numeric = numericHours === null ? 0 : numericHours;

        const newTotal = wages.reduce<number>((acc, cur, i) => {
            const w = cur === "" ? 0 : Number(cur);
            const m = multiplier[i] === "" ? 1 : Number(multiplier[i]);
            return acc + w * m * numeric;
        }, 0);

        setDisplayTotal(newTotal);
    }, [wages, multiplier, numericHours]);


    useEffect(() => {
        let employees = 0;
        for (let i = 0; i < multiplier.length; i++) {
            employees += multiplier[i] === "" ? 1 : (multiplier[i] as number);
        }
        setTotalHours(numericHours !== null ? employees * numericHours : 0);
    }, [numericHours, multiplier, numberOfWages]);

    const currentCategory = categories.find(
        (c) => c.id === selectedCategoryId
    );

    const currentTask = currentCategory?.name ?? "—";

    useEffect(() => {

        const normalized = numberOfWages === "" ? 1 : numberOfWages;

        setWages((prev) => {
            const newArr = [...prev];
            while (newArr.length < normalized) newArr.push(0);
            return newArr.slice(0, normalized);
        });

        setMultiplier((prev) => {
            const newArr = [...prev];
            while (newArr.length < normalized) newArr.push(1);
            return newArr.slice(0, normalized);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numberOfWages]);

    const normalizeSupervisor = (name: string) => {
        if (!name) return "";

        // 1️⃣ Trim spaces and collapse multiple spaces
        let cleaned = name.trim().replace(/\s+/g, " ");

        // 2️⃣ Remove accents
        cleaned = cleaned.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 3️⃣ Lowercase everything to match the DB
        cleaned = cleaned.toLowerCase();

        return cleaned;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors: string[] = [];

        // Validate wages
        wages.forEach((w, i) => {
            const num = w === "" ? 0 : w;
            if (isNaN(num) || num <= 0) {
                errors.push(`Salaire #${i + 1} est invalide (valeur: ${w}).`);
            }
        });

        // Validate hours
        if (numericHours === null || isNaN(numericHours) || numericHours <= 0) {
            errors.push("Le nombre d'heures est invalide.");
        }

        if (errors.length > 0) {
            alert("⚠️ Erreurs trouvées:\n\n" + errors.join("\n"));
            return;
        }

        const totalCost = numericHours === null
            ? 0
            : wages.reduce<number>((acc, cur, i) => {
                const w = cur === "" ? 0 : cur;
                const m = multiplier[i] === "" ? 1 : multiplier[i];
                return acc + w * m * numericHours;
            }, 0);

        const payload = {
            vegetable: cultureDefined ? selectedVeggie.toUpperCase() : "AUCUNE",
            category: currentCategory?.name,
            sub_category: subCategory,
            total_hours: totalHours,
            supervisor: supervisor === "Aucun" ? null : normalizeSupervisor(supervisor),
            total_cost: totalCost,
            created_at: useCustomDate && selectedDate ? selectedDate.toISOString() : undefined,
            field: field || null // <-- send field state here
        };

        try {
            const result = await fetchWithAuth(
                "https://vegibec-rendement-backend.onrender.com/data/costs",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            console.log("Report saved:", result);
            alert("✅ Tâche enregistrée avec succès !");
            setIsFirstStepCompleted(true);
        } catch (err) {
            console.error(err);
            alert("❌ Une erreur est survenue lors de l'enregistrement.");
        }

        setTimeout(() => window.location.reload(), 200);
    };


    // 🔹 Helper to format 3.5 → 3h30
    const formatHours = (decimalHours: number) => {
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours}h${minutes.toString().padStart(2, "0")}`;
    };

    return (
        <article className="flex flex-col items-center w-full">
            <div className='text-center mt-[1rem] text-[1.1rem] px-[0.25rem]'>
                <p>Tâche sélectionnée :</p>
                <p className='font-bold'> {currentTask}  - {subCategory}</p>
                <p className='font-bold'>Culture : {cultureDefined ? selectedVeggie : "Non définie"}</p>
                <p className='font-bold'>Superviseur : {supervisor}</p>
            </div>
            <section className="mt-[1rem] w-full flex flex-col items-center ">
                <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col items-center gap-[0.5rem] bg-white p-[0.5rem] pb-[1.2rem] lg:py-[2rem] rounded-[0.75rem] border-4 border-green-400 border-solid w-[min(99%,_500px)]">
                    <label className="font-bold text-center text-[1.1rem] lg:text-[1.35rem]" htmlFor="differentWages">
                        Sélectionner le nombre de salaires différents :
                    </label>
                    <label htmlFor="differentWages">Nombre de salaires différents :</label>
                    <input
                        type="number"
                        list="numberOfWages-list"
                        className="border-2 border-green-400 px-[0.5rem]"
                        value={numberOfWages}
                        onChange={(e) => {
                            const raw = e.target.value;

                            // allow empty string temporarily
                            if (raw === "") {
                                setNumberOfWages("");
                                return;
                            }

                            const value = Number(raw);
                            if (Number.isNaN(value) || value < 1) return;

                            setNumberOfWages(value);
                        }}
                    />

                    <datalist id="numberOfWages-list">
                        {Array.from({ length: 20 }, (_, i) => (
                            <option key={i} value={i + 1} />
                        ))}
                    </datalist>


                    <section className="mt-[0.75rem] lg:mt-[1.25rem] flex flex-col w-[99%] gap-[1rem] border-b-2 border-green-400 border-dotted pb-[1.75rem]">
                        <div className="flex mb-[0.5rem] border-b-2 border-green-400 border-dotted">
                            <h3 className="flex-1 font-bold text-center border-r-2 border-green-400">Salaires</h3>
                            <h3 className="flex-1 font-bold text-center">Nb d'employés</h3>
                            <h3 className="flex-1 font-bold text-center border-l-2 border-green-400">Sous-totaux</h3>
                        </div>

                        {Array.from({ length: numberOfWages === "" ? 1 : numberOfWages }, (_, index) => (
                            <div className="w-full flex" key={index}>
                                <div className="flex flex-1 justify-center gap-[0.2rem] border-green-400">
                                    <input
                                        onChange={(e) =>
                                            setWages(
                                                wages.map((w, i) =>
                                                    i === index ? Number(e.target.value) : w
                                                )
                                            )
                                        }
                                        className="wage-list-input border-2 border-green-400 w-[4.7rem]"
                                        type="number"
                                        step="any"
                                        list="wage-list"
                                        name={`wage${index + 1}`}
                                        id={`wage${index + 1}`}
                                    />
                                    <datalist id="wage-list">
                                        <option value="15.75">15,75</option>
                                        <option value="16">16,00</option>
                                        <option value="16.25">16,25</option>
                                        <option value="16.5">16,50</option>
                                        <option value="16.75">16,75</option>
                                        <option value="17.25">17,25</option>
                                        <option value="17.75">17,75</option>
                                        <option value="17.9">17,90</option>
                                        <option value="18">18,00</option>
                                        <option value="18.25">18,25</option>
                                        <option value="19.08">19,08</option>
                                        <option value="19.25">19,25</option>
                                        <option value="19.58">19,58</option>
                                        <option value="19.98">19,98</option>
                                        <option value="26.92">26,92</option>
                                    </datalist>
                                    <p className="inline">X</p>
                                </div>
                                <div className="flex flex-1 justify-center ">
                                    <input
                                        type="number"
                                        list={`multiplier-list-${index}`}
                                        className="border-2 border-green-400 w-[80%]"
                                        value={multiplier[index]}
                                        onChange={(e) => {
                                            const raw = e.target.value;

                                            // allow user to erase
                                            if (raw === "") {
                                                setMultiplier(
                                                    multiplier.map((m, i) => (i === index ? "" : m))
                                                );
                                                return;
                                            }

                                            const value = Number(raw);
                                            if (Number.isNaN(value) || value < 1) return;

                                            setMultiplier(
                                                multiplier.map((m, i) => (i === index ? value : m))
                                            );
                                        }}
                                    />


                                    <datalist id={`multiplier-list-${index}`}>
                                        {Array.from({ length: 20 }, (_, i) => (
                                            <option key={i} value={i + 1} />
                                        ))}
                                    </datalist>

                                </div>
                                <p className="flex-1 text-center">
                                    {(
                                        (wages[index] === "" ? 0 : wages[index]) *
                                        (multiplier[index] === "" ? 1 : multiplier[index])
                                    ).toFixed(2)}$
                                </p>
                            </div>
                        ))}

                        <div className="flex w-[min(99%,_430px)] border-t-2 pt-[0.5rem] mx-auto border-green-400 border-dotted justify-between items-center font-bold text-lg mt-2">
                            <label htmlFor="hours" className="flex gap-[0.5rem]">
                                <span className="font-light">x</span> heures:
                                <input
                                    type="text"
                                    id="hours"
                                    name="hours"
                                    list="hours-list"
                                    inputMode="decimal"
                                    value={hoursInput}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "") {
                                            setHoursInput("");
                                            return;
                                        }
                                        if (/^\d{0,2}([.,]\d{0,2})?$/.test(val)) {
                                            setHoursInput(val);
                                        }
                                    }}
                                    className="w-[6rem] h-[2.2rem] border-2 border-green-400"
                                />
                                <datalist id="hours-list">
                                    {Array.from({ length: 33 }, (_, i) => (i * 0.5).toString()).map((val) => (
                                        <option key={val} value={val} />
                                    ))}
                                </datalist>
                            </label>

                            <div className="flex flex-col items-center">
                                <p>{hoursInput}</p>
                                {numericHours !== null && (
                                    <p className="text-sm text-gray-600">
                                        ({formatHours(numericHours)})
                                    </p>
                                )}
                            </div>

                            <div className="sm:flex sm:flex-col">
                                <p className="mr-2">= Total:</p>
                                <p>{displayTotal.toFixed(2)} $</p>
                            </div>
                        </div>

                        <div className='w-full flex flex-row-reverse justify-center gap-[2.5rem]'>
                            <button
                                type="button"
                                className='button-generic'
                                onClick={() => {
                                    const current = parseFloat(hoursInput.replace(",", ".")) || 0;
                                    const totalMinutes = Math.round(current * 60);
                                    const newMinutes = totalMinutes + 5;
                                    const newVal = newMinutes / 60;
                                    setHoursInput(newVal.toFixed(2).replace(".", ","));
                                }}
                            >
                                +5mins
                            </button>

                            <button
                                type="button"
                                className='button-generic'
                                onClick={() => {
                                    const current = parseFloat(hoursInput.replace(",", ".")) || 0;
                                    const totalMinutes = Math.round(current * 60);
                                    const newMinutes = Math.max(0, totalMinutes - 5);
                                    const newVal = newMinutes / 60;
                                    setHoursInput(newVal.toFixed(2).replace(".", ","));
                                }}
                            >
                                -5mins
                            </button>
                        </div>

                        <div className='flex flex-col'>
                            <label htmlFor="notCurrent" className="text-sm italic text-center mt-[0.5rem]">
                                *Cocher si la tâche effectuée n'est pas en date d'aujourd'hui
                            </label>
                            <input
                                type="checkbox"
                                name="notCurrent"
                                id="notCurrent"
                                checked={useCustomDate}
                                onChange={(e) => setUseCustomDate(e.target.checked)}
                            />
                            {useCustomDate && (
                                <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} label="Date de la tâche" />
                            )}
                        </div>
                    </section>

                    <button
                        type="submit"
                        className="hover:bg-green-400 hover:cursor-pointer mt-[1rem] bg-green-700 text-white font-bold py-2 px-4 rounded shadow-1xl"
                    >
                        Soumettre (2/2)
                    </button>
                </form>
            </section>
        </article>
    );
};

export default SecondStep;
