import { useEffect, type Dispatch, type SetStateAction } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useFields } from "@/context/fields/FieldsContext";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";
import SearchableFieldListbox from "@/components/SearchableListBox";



interface FirstStepProps {
    task: {
        Entretien: boolean;
        Entrepôt: boolean;
        Agronomie: boolean;
        Pompage: boolean;
        Transport: boolean;
        Opérations: boolean;
        Autre: boolean;
    };
    setTask: Dispatch<SetStateAction<{
        Entretien: boolean;
        Entrepôt: boolean;
        Agronomie: boolean;
        Pompage: boolean;
        Transport: boolean;
        Opérations: boolean;
        Autre: boolean;
    }>>;
    subCategories: string[];
    setSubcategories: Dispatch<SetStateAction<string[]>>;
    subCategory: string;
    setSubCategory: Dispatch<SetStateAction<string>>;
    cultureDefined: boolean;
    setCultureDefined: Dispatch<SetStateAction<boolean>>;
    selectedVeggie: string;
    setSelectedVeggie: Dispatch<SetStateAction<string>>;
    vegetables?: string[];
    isFirstStepCompleted: boolean;
    setIsFirstStepCompleted: Dispatch<SetStateAction<boolean>>;
    supervisor: string;
    setSupervisor: Dispatch<SetStateAction<string>>;
    field: string | null;
    setField: Dispatch<SetStateAction<string | null>>;
    isFieldDefined: boolean;
    setIsFieldDefined: Dispatch<SetStateAction<boolean>>;
}


const FirstStep: React.FC<FirstStepProps> = ({ task, setTask, subCategories, setSubcategories, subCategory, setSubCategory, cultureDefined, setCultureDefined, selectedVeggie, setSelectedVeggie, vegetables, setIsFirstStepCompleted, supervisor, setSupervisor, field, setField, isFieldDefined, setIsFieldDefined }) => {

    const { fields } = useFields();


    const { supervisors } = useSupervisors();

    const supervisorsNames = supervisors.map((sup) => sup.supervisor);




    useEffect(() => {
        if (task.Entretien) {
            setSubcategories(["Mécanique", "Électricité", "Soudure", "Autre"])
        }
        else if (task.Entrepôt) {
            setSubcategories([
                "Emballage céleri",
                "Emballage chou",
                "Emballage chou de Bruxelles",
                "Emballage chou-fleur",
                "Emballage cœur de romaine",
                "Emballage laitue frisée",
                "Emballage laitue pommée",
                "Emballage laitue romaine",
                "Emballage poivron",
                "Emballage produit inconnu",
                "Emballage zucchini",
                "Inventaire",
                "Maintenance de bâtiment",
                "Réception/Expédition",
                "Autre"
            ])
        }
        else if (task.Agronomie) {
            setSubcategories([
                "Application de fongicide",
                "Dépistage",
                "Disposition des plateaux en serres",
                "Fertilisation",
                "Installation de connecteurs",
                "Installation goutte-à-goutte",
                "Installation tuyaux irrigation",
                "Irrigation",
                "Maintenance",
                "Nettoyage",
                "Nettoyage entrepôt d'irrigation",
                "Préparation matériel d'irrigation",
                "Pulvérisateur",
                "Réparation pulvérisateur",
                "Répartition fumier",
                "Retrait de système d'irrigation",
                "Semage",
                "Sortie de plateaux",
                "Tâches générales en serre",
                "Transfert de plants",
                "Vérification goutte-à-goutte",
                "Vidage des pompes d'irrigation",
                "Autre"
            ])
        }
        else if (task.Pompage) {
            setSubcategories([
                "Gicleurs avec tuyaux d'aluminium",
                "Goutte-à-goutte",
                "Autre"
            ])
        }
        else if (task.Autre) {
            setSubcategories([
                "Aménagement paysager",
                "Bois de chauffage",
                "Confection de beignes",
                "Entretien salubrité",
                "Maintenance de bâtiment",
                "Manifestation - accompagnement",
                "Nettoyage de champs",
                "Nettoyage de machinerie",
                "Nettoyage de plateaux",
                "Nettoyage des aires de travail",
                "Opération de pelle mécanique",
                "Peinture",
                "Réparation de caissons de bois",
                "Réparation de palettes",
                "Réunion",
                "Sous-contrat voisin",
                "Varié",
                "Maintenance de bâtiment - ménage",
                "Autre"
            ])
        }
        else if (task.Transport) {
            setSubcategories([
                "Livraison",
                "Transport machinerie",
                "Transport de matériel",
                "Transport de pierres",
                "Transport de plants",
                "Transport de plastique",
                "Transport de support métallique",
                "Transport de terre",
                "Transport de toile",
                "Transport matériel",
                "Transport récolte",
                "Autre"
            ])
        }
        else if (task.Opérations) {
            setSubcategories([
                "Ajustement de plastique",
                "Ajustement de toile",
                "Attache",
                "Conditionnement",
                "Désherbage",
                "Épierrage",
                "Fauchage",
                "Perforage de plastique",
                "Plantation",
                "Pose de plastique",
                "Pose de support métallique",
                "Pose de toile",
                "Rangement de matériel",
                "Récolte",
                "Réparation de plastique",
                "Réparation de toile",
                "Repiquage",
                "Retrait de plastique",
                "Retrait de support métallique",
                "Retrait de toile",
                "Rotoculteur",
                "Sarcleur",
                "Supervision",
                "Taille",
                "Traçage de canaux d’eau",
                "Traçage de rangs",
                "Tri",
                "Autre"
            ])
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task])


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsFirstStepCompleted(true);
    }

    useEffect(() => {
        if (task.Entrepôt === false) {
            return
        }
        switch (subCategory) {
            case "Emballage céleri":
                setCultureDefined(true);
                setSelectedVeggie("Céleri");
                break;
            case "Emballage chou":
                setCultureDefined(true);
                setSelectedVeggie("Chou");
                break;
            case "Emballage chou de Bruxelles":
                setCultureDefined(true);
                setSelectedVeggie("Chou de Bruxelles");
                break;
            case "Emballage chou-fleur":
                setCultureDefined(true);
                setSelectedVeggie("Chou-fleur");
                break;
            case "Emballage cœur de romaine":
                setCultureDefined(true);
                setSelectedVeggie("Cœur de romaine");
                break;
            case "Emballage laitue frisée":
                setCultureDefined(true);
                setSelectedVeggie("Laitue frisée");
                break;
            case "Emballage laitue pommée":
                setCultureDefined(true);
                setSelectedVeggie("Laitue pommée");
                break;
            case "Emballage laitue romaine":
                setCultureDefined(true);
                setSelectedVeggie("Laitue romaine");
                break;
            case "Emballage poivron":
                setCultureDefined(true);
                setSelectedVeggie("Poivron");
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task.Entrepôt, subCategory])




    return (

        < form onSubmit={(e) => handleSubmit(e)} className=" lg:text-[1.2rem] mt-[2rem] flex flex-col items-center gap-[0.5rem] bg-white p-[0.5rem] pb-[1.2rem] lg:py-[2rem] rounded-[0.75rem] border-4 border-green-400 border-solid w-[min(99%,_500px)]">
            <h3 className="lg:text-[1.5rem] text-[1.3rem] text-center font-bold"> Sélection de la tâche effectuée</h3>
            <div className="w-[95%] flex flex-col items-center  ">
                <label className="font-bold text-center flex gap-[2rem] mb-[0.25rem]" htmlFor="supervisor">Superviseur:
                    <div className="flex gap-[0.5rem]">
                        <label htmlFor="aucun">Aucun</label>
                        <input className=" ml-auto w-[1.1rem]" checked={supervisor === "Aucun"} onChange={() => setSupervisor("Aucun")} type="checkbox" id="aucun" name="supervisor" value="Aucun" />
                    </div>
                </label>
                <Listbox value={supervisor} onChange={setSupervisor} >
                    <div className="relative mt-1 w-full">
                        <Listbox.Button className="flex items-center h-[1.9rem] relative w-full cursor-default rounded-lg border border-green-400 bg-white py-2 pl-3 pr-10  text-left shadow-md focus:outline-none">
                            <span className="block truncate">{supervisor}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </Listbox.Button>
                        <Listbox.Options className="absolute top-full max-h-90 mt-1  w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                            {supervisorsNames
                                .sort((a, b) => a.localeCompare(b))
                                .map((person, personIdx) => (
                                    <Listbox.Option
                                        key={personIdx}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${active
                                                ? "bg-green-100 text-green-900"
                                                : "text-gray-900"
                                            }`
                                        }
                                        value={person}>
                                        {({ selected }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${selected ? "font-medium" : "font-normal"
                                                        } sm:text-[1.1rem]`}
                                                >
                                                    {person}
                                                </span>
                                                {selected ? (
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                        </Listbox.Options>
                    </div>
                </Listbox>

            </div>
            <div className="mt-[1rem] grid grid-cols-2 w-[95%] gap-[0.5rem]">
                <div className="mx-auto flex w-[70%] justify-center">
                    <label htmlFor="entretien">Entretien</label>
                    <input className=" ml-auto w-[1.1rem]" checked={task.Entretien} onChange={(e) => setTask({ ...task, Entretien: e.target.checked, Entrepôt: false, Agronomie: false, Pompage: false, Transport: false, Opérations: false, Autre: false })} type="checkbox" id="entretien" name="entretien" />
                </div>
                <div className="mx-auto flex w-[70%] justify-center">
                    <label htmlFor="entrepot">Entrepôt</label>
                    <input className=" ml-auto w-[1.1rem]" checked={task.Entrepôt} onChange={(e) => setTask({ ...task, Entrepôt: e.target.checked, Entretien: false, Agronomie: false, Pompage: false, Transport: false, Opérations: false, Autre: false })} id="entrepot" name="entrepot" type="checkbox" />
                </div>
                <div className="mx-auto flex w-[70%] justify-center">
                    <label htmlFor="agronomie">Agronomie</label>
                    <input className=" ml-auto w-[1.1rem]" checked={task.Agronomie} onChange={(e) => setTask({ ...task, Agronomie: e.target.checked, Entretien: false, Entrepôt: false, Pompage: false, Transport: false, Opérations: false, Autre: false })} type="checkbox" id="agronomie" name="agronomie" />
                </div>
                <div className="mx-auto flex w-[70%] justify-center">
                    <label htmlFor="pompage">Pompage</label>
                    <input className=" ml-auto w-[1.1rem]" checked={task.Pompage} onChange={(e) => setTask({ ...task, Pompage: e.target.checked, Entretien: false, Entrepôt: false, Agronomie: false, Transport: false, Opérations: false, Autre: false })} type="checkbox" id="pompage" name="pompage" />
                </div>
                <div className="mx-auto flex w-[70%] justify-center">
                    <label htmlFor="autre">Autre</label>
                    <input className=" ml-auto w-[1.1rem]" checked={task.Autre} onChange={(e) => setTask({ ...task, Autre: e.target.checked, Entretien: false, Entrepôt: false, Agronomie: false, Pompage: false, Transport: false, Opérations: false })} type="checkbox" id="autre" name="autre" />
                </div>
                <div className="mx-auto flex w-[70%] justify-center">
                    <label htmlFor="transport">Transport</label>
                    <input className=" ml-auto w-[1.1rem]" checked={task.Transport} onChange={(e) => setTask({ ...task, Transport: e.target.checked, Entretien: false, Entrepôt: false, Agronomie: false, Pompage: false, Opérations: false, Autre: false })} type="checkbox" id="transport" name="transport" />
                </div>
                <div className="mx-auto flex w-[70%] justify-center">
                    <label htmlFor="operations">Opérations</label>
                    <input className=" ml-auto w-[1.1rem]" checked={task.Opérations} onChange={(e) => setTask({ ...task, Opérations: e.target.checked, Entretien: false, Entrepôt: false, Agronomie: false, Pompage: false, Transport: false, Autre: false })} type="checkbox" id="operations" name="operations" />
                </div>
            </div>


            <section className="w-full flex flex-col gap-[0.1rem] items-center">
                <label className="font-bold mt-[1rem]" htmlFor="subCategory">Sous-catégorie :</label>
                <div className="w-[99%]">
                    <Listbox value={subCategory} onChange={setSubCategory}>
                        <div className="relative ">
                            <Listbox.Button className="h-[1.9rem] flex items-center relative w-full cursor-default rounded-lg border border-green-400 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none">
                                <span className="block truncate">{subCategory}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </span>
                            </Listbox.Button>
                            <Listbox.Options
                                className="absolute bottom-full mb-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50"
                            >

                                {subCategories
                                    .sort((a, b) => a.localeCompare(b))
                                    .map((cat, index) => (
                                        <Listbox.Option
                                            key={index}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active
                                                    ? "bg-green-100 text-green-900"
                                                    : "text-gray-900"
                                                }`
                                            }
                                            value={cat}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span
                                                        className={`block truncate ${selected ? "font-medium" : "font-normal"
                                                            } sm:text-[1.1rem]`}
                                                    >
                                                        {cat}
                                                    </span>
                                                    {selected ? (
                                                        <span className=" absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))}
                            </Listbox.Options>
                        </div>
                    </Listbox>
                </div>
            </section>

            <section className="flex flex-col mt-[0.5rem] items-center">
                <div className="flex justify-center w-full gap-[0.5rem]">
                    <label htmlFor="cultureDefined">Champ spécifié :</label>
                    <input onChange={(e) => setIsFieldDefined(e.target.checked)} type="checkbox" id="cultureDefined" name="cultureDefined" checked={isFieldDefined} />
                </div>
                {isFieldDefined && (
                    <div className="flex gap-[1rem] justify-center w-[80%]">
                        <label className="text-[1.1rem] font-bold">Champ:</label>
                        <SearchableFieldListbox fields={fields} field={field} setField={setField} />
                    </div>
                )}
            </section>

            <section className="flex flex-col mt-[0.5rem] items-center">
                <div className="flex justify-center w-full gap-[0.5rem]">
                    <label htmlFor="cultureDefined">Cutlure précisée :</label>
                    <input onChange={(e) => setCultureDefined(e.target.checked)} type="checkbox" id="cultureDefined" name="cultureDefined" checked={cultureDefined} />
                </div>
                {cultureDefined && (
                    <div className="flex gap-[1rem] justify-center w-[80%]">
                        <label className="text-[1.1rem] font-bold">Culture:</label>
                        <div className="w-64">
                            <Listbox value={selectedVeggie} onChange={setSelectedVeggie}>
                                <div className="relative mt-1">
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg border border-green-400 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none">
                                        <span className="block truncate">{selectedVeggie}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute bottom-full mt-1 max-h-90 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                        {vegetables && vegetables.map((veg, index) => (
                                            <Listbox.Option
                                                key={index}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active
                                                        ? "bg-green-100 text-green-900"
                                                        : "text-gray-900"
                                                    }`
                                                }
                                                value={veg}
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span
                                                            className={`block truncate ${selected ? "font-medium" : "font-normal"
                                                                } sm:text-[1.1rem]`}
                                                        >
                                                            {veg}
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                    </div>
                )}
            </section>
            <button type="submit" className="mt-[1rem] bg-green-700 hover:bg-green-400 hover:cursor-pointer  text-white font-bold py-2 px-4 rounded shadow-1xl">Soumettre (1/2)</button>
        </form>

    )
}

export default FirstStep;