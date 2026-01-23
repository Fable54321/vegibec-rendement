type CultureRevenueFormProps = {
    culture: string;
    setCulture: (value: string) => void;

    isRevenueExisting: boolean;
    setIsRevenueExisting: (value: boolean) => void;

    projectedRevenue: number | "";
    setProjectedRevenue: (value: number | "") => void;

    projectedRevenueYear: number;
    setProjectedRevenueYear: (value: number) => void;

    loading?: boolean;
};

export function SimpleCultureForm({
    culture,
    setCulture,
    isRevenueExisting,
    setIsRevenueExisting,
    projectedRevenue,
    setProjectedRevenue,
    projectedRevenueYear,
    setProjectedRevenueYear,
    loading = false,
}: CultureRevenueFormProps) {
    const currentYear = new Date().getFullYear();

    return (
        <>
            {/* Nom de la culture */}
            <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Nom de la culture</span>
                <input
                    type="text"
                    value={culture}
                    onChange={(e) => setCulture(e.target.value)}
                    placeholder="Ex: Carotte"
                    className="border rounded px-3 py-2"
                    disabled={loading}
                />
            </label>

            {/* Revenus existants */}
            <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={isRevenueExisting}
                    onChange={(e) => setIsRevenueExisting(e.target.checked)}
                    className="mr-2"
                    disabled={loading}
                />
                <span className="text-sm">Revenus d'année complète existants</span>
            </label>

            {/* Revenus projetés */}
            {!isRevenueExisting && (
                <>
                    <label className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Revenus projetés</span>
                        <input
                            type="number"
                            className="border rounded px-3 py-2 w-full"
                            disabled={loading}
                            value={projectedRevenue}
                            onChange={(e) =>
                                setProjectedRevenue(
                                    e.target.value ? Number(e.target.value) : ""
                                )
                            }
                        />
                    </label>

                    <label className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Pour l'année</span>
                        <select
                            value={projectedRevenueYear}
                            onChange={(e) =>
                                setProjectedRevenueYear(Number(e.target.value))
                            }
                            className="border rounded px-2 py-1"
                            disabled={loading}
                        >
                            {Array.from({ length: 10 }, (_, index) => {
                                const year = currentYear - index;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </label>
                </>
            )}
        </>
    );
}


export default SimpleCultureForm