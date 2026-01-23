
type GroupEntry = {
    vegetable: string;
    revenueExisting: boolean;
    projectedRevenue: number | "";
    projectedRevenueYear: number;
};

type GenericCultureFormProps = {
    genericGroup: string;
    setGenericGroup: (v: string) => void;
    groupEntries: GroupEntry[];
    setGroupEntries: React.Dispatch<React.SetStateAction<GroupEntry[]>>;
    loading: boolean;
};

export function GenericCultureForm({
    genericGroup,
    setGenericGroup,
    groupEntries,
    setGroupEntries,
    loading,
}: GenericCultureFormProps) {


    const updateEntry = (index: number, updates: Partial<GroupEntry>) => {
        setGroupEntries(entries =>
            entries.map((e, i) => (i === index ? { ...e, ...updates } : e))
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Generic group */}
            <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">
                    Groupe générique
                </span>
                <input
                    value={genericGroup}
                    onChange={e => setGenericGroup(e.target.value)}
                    className="border rounded px-3 py-2"
                    placeholder="Ex: CHOU"
                    disabled={loading}
                />
            </label>

            {/* Group entries */}
            {groupEntries.map((entry, index) => (
                <div key={index} className="border rounded p-3 flex flex-col gap-2">
                    <input
                        placeholder="Nom de la culture"
                        value={entry.vegetable}
                        onChange={e =>
                            updateEntry(index, { vegetable: e.target.value })
                        }
                        className="border rounded px-2 py-1"
                    />

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={entry.revenueExisting}
                            onChange={e =>
                                updateEntry(index, { revenueExisting: e.target.checked })
                            }
                        />
                        <span className="text-sm">Revenus existants</span>
                    </label>

                    {!entry.revenueExisting && (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={entry.projectedRevenue}
                                onChange={e =>
                                    updateEntry(index, {
                                        projectedRevenue: e.target.value
                                            ? Number(e.target.value)
                                            : "",
                                    })
                                }
                                className="border rounded px-2 py-1 w-full"
                                placeholder="Revenu projeté"
                            />

                            <select
                                value={entry.projectedRevenueYear}
                                onChange={e =>
                                    updateEntry(index, {
                                        projectedRevenueYear: Number(e.target.value),
                                    })
                                }
                                className="border rounded px-2 py-1"
                            >
                                {Array.from({ length: 10 }, (_, i) => {
                                    const y = new Date().getFullYear() - i;
                                    return <option key={y}>{y}</option>;
                                })}
                            </select>
                        </div>
                    )}
                </div>
            ))}

            <button
                type="button"
                onClick={() =>
                    setGroupEntries(e => [
                        ...e,
                        {
                            vegetable: "",
                            revenueExisting: false,
                            projectedRevenue: "",
                            projectedRevenueYear: new Date().getFullYear(),
                        },
                    ])
                }
                className="border rounded py-1"
            >
                + Ajouter une culture au groupe
            </button>
        </div>
    );
}

