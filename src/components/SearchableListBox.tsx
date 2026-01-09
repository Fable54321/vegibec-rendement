import { useState, useMemo, useEffect, useRef } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

interface Field {
    field: string;
}

interface Props {
    fields: Field[];
    field: string | null;
    setField: (value: string | null) => void;
}

const SearchableFieldListbox = ({ fields, field, setField }: Props) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Filter the list as user types
    const filteredFields = useMemo(() => {
        if (!query) return fields;
        return fields.filter((f) =>
            f.field.toLowerCase().startsWith(query.toLowerCase())
        );
    }, [fields, query]);

    // When Listbox opens, focus the input
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className="w-64">
            <Listbox value={field} onChange={setField}>
                {({ open }) => {
                    setIsOpen(open); // track open state
                    return (
                        <div className="relative mt-1">
                            <Listbox.Button className="relative w-full cursor-default rounded-lg border border-green-400 bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none">
                                <span className="block truncate">{field || "Sélectionner un champ"}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </Listbox.Button>

                            <Listbox.Options className="bottom-full absolute mt-1 max-h-72 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                {/* Search input */}
                                <div className="px-2 pb-2">
                                    <input
                                        type="text"
                                        ref={inputRef}
                                        placeholder="Rechercher..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full border-b border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-400 text-sm"
                                    />
                                </div>

                                {filteredFields.length > 0 ? (
                                    filteredFields.map((item) => (
                                        <Listbox.Option
                                            key={item.field}
                                            value={item.field}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-green-100 text-green-900" : "text-gray-900"
                                                }`
                                            }
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                        {item.field}
                                                    </span>
                                                    {selected && (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))
                                ) : (
                                    <div className="text-gray-400 px-3 py-2">Aucun résultat</div>
                                )}
                            </Listbox.Options>
                        </div>
                    );
                }}
            </Listbox>
        </div>
    );
};

export default SearchableFieldListbox;
