import { useEffect, type Dispatch, type SetStateAction } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useFields } from "@/context/fields/FieldsContext";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";
import SearchableFieldListbox from "@/components/SearchableListBox";
import type { TaskCategory, TaskSubcategory } from "@/context/taskCategories/TaskCategoriesContext";



interface FirstStepProps {
    categories: TaskCategory[];
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
    onCategoryChange: (category: number) => void;
    selectedCategoryId: number | null;
    subCategories: TaskSubcategory[];
}


const FirstStep: React.FC<FirstStepProps> = ({
    categories,
    subCategories,
    subCategory,
    setSubCategory,
    cultureDefined,
    setCultureDefined,
    selectedVeggie,
    setSelectedVeggie,
    vegetables,
    setIsFirstStepCompleted,
    supervisor,
    setSupervisor,
    field,
    setField,
    isFieldDefined,
    setIsFieldDefined,
    onCategoryChange,
    selectedCategoryId }) => {

    const { fields } = useFields();


    const { supervisors } = useSupervisors();

    const supervisorsNames = supervisors.map((sup) => sup.supervisor);







    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsFirstStepCompleted(true);
    }

    const selectedCategory = categories.find(
        (c) => c.id === selectedCategoryId
    );

    const isEntrepot = selectedCategory?.name === "Entrepôt";


    const emballageToVegetableMap: Record<string, string> = {
        "Emballage céleri": "Céleri",
        "Emballage chou": "Chou",
        "Emballage chou de Bruxelles": "Chou de Bruxelles",
        "Emballage chou-fleur": "Chou-fleur",
        "Emballage cœur de romaine": "Cœur de romaine",
        "Emballage laitue frisée": "Laitue frisée",
        "Emballage laitue pommée": "Laitue pommée",
        "Emballage laitue romaine": "Laitue romaine",
        "Emballage poivron": "Poivron",
    };

    useEffect(() => {
        if (!isEntrepot) return;

        const veggie = emballageToVegetableMap[subCategory];

        if (veggie) {
            setCultureDefined(true);
            setSelectedVeggie(veggie);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEntrepot, subCategory]);




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
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="mx-auto flex w-[70%] justify-center"
                    >
                        <label htmlFor={`category-${category.id}`}>
                            {category.name}
                        </label>

                        <input
                            className="ml-auto w-[1.1rem]"
                            type="radio"
                            name="task-category"
                            id={`category-${category.id}`}
                            checked={selectedCategoryId === category.id}
                            onChange={() => onCategoryChange(category.id)}
                        />
                    </div>
                ))}
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
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((cat, index) => (
                                        <Listbox.Option
                                            key={index}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active
                                                    ? "bg-green-100 text-green-900"
                                                    : "text-gray-900"
                                                }`
                                            }
                                            value={cat.name}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span
                                                        className={`block truncate ${selected ? "font-medium" : "font-normal"
                                                            } sm:text-[1.1rem]`}
                                                    >
                                                        {cat.name}
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