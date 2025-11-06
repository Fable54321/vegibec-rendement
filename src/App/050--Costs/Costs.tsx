import { Link, useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../000--App/App";
import { useEffect } from "react";

const Costs = () => {
    const {
        seedCosts,
        yearSelected,
        setYearSelected,
        monthSelected,
        setMonthSelected,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        percentages,
        otherCostsTotal,
        totalCostsToRedistribute,
        mainLoading,
        mainError,
        otherCosts,
        vegetableTotalCosts,
        adjustedPackagingCosts,
        adjustedVegetableCosts,
    } = useOutletContext<AppOutletContext>();




    const formatCurrency = (value: number | string | undefined | null) => {
        if (value == null) return "—";
        const n = typeof value === "string" ? parseFloat(value) : value;
        if (!Number.isFinite(n)) return "—";
        // Only round for display, keep internal calculations untouched
        return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };


    useEffect(() => { console.log("adjusted packaging costs COSTS PAGE   ", adjustedPackagingCosts) }, [adjustedPackagingCosts])


    return (
        <article
            className="md:text-[1.4rem]"
            style={{ padding: "1rem", maxWidth: "1200px", margin: "auto" }}
        >
            {/* Header */}
            <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
                Analyse des Coûts Annuels
            </h1>
            <div className="w-full flex justify-center">
                <Link to="/" className="button-generic " >Accueil</Link>
            </div>
            {/* --- Date Controls --- */}
            <section
                className="bg-gray-50 p-4 rounded-lg shadow-inner mb-8 mt-[1rem]"
                style={{
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
            >
                {/* Year input */}
                <input
                    type="number"
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Année (ex: 2024)"
                    value={yearSelected || ""}
                    onChange={(e) => setYearSelected(e.target.value || "2024")}
                />

                {/* Month selector */}
                <select
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    value={monthSelected || ""}
                    onChange={(e) => setMonthSelected(e.target.value || undefined)}
                >
                    <option value="">-- Mois --</option>
                    {Array.from({ length: 12 }, (_, i) => {
                        const month = String(i + 1).padStart(2, "0");
                        return (
                            <option key={month} value={month}>
                                {new Date(0, i).toLocaleString("fr-CA", { month: "long" })}
                            </option>
                        );
                    })}
                </select>

                {/* Start/end date range */}
                <input
                    type="date"
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </section>

            {/* Loading / error */}
            {mainLoading && (
                <p className="text-center text-blue-500 my-4 font-semibold">
                    Chargement des données...
                </p>
            )}
            {mainError && (
                <p className="text-center text-red-600 my-4 font-bold"></p>
            )}

            {/* --- 1. Coûts provenant des heures de travail --- */}
            <section className="mb-8">
                <h2 className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
                    Coûts provenant des heures de travail
                </h2>

                {!mainLoading && adjustedVegetableCosts.length > 0 ? (
                    <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                        <thead className="bg-green-700 text-white">
                            <tr>
                                <th className="py-2 text-left pl-4 uppercase font-semibold text-[1.1em]">
                                    Culture
                                </th>
                                <th className="py-2 text-left pl-6 uppercase font-semibold text-[1.1em]">
                                    Coûts Totaux ($)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {adjustedVegetableCosts.map((item) => (
                                <tr
                                    key={item.vegetable}
                                    className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                >
                                    <td className="py-3 px-4">{item.vegetable}</td>
                                    <td className="py-3 px-4 text-right">
                                        {formatCurrency(item.total_cost)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    !mainLoading && (
                        <p className="text-gray-500 italic">
                            Aucune donnée trouvée pour la période sélectionnée.
                        </p>
                    )
                )}
            </section>
            {/* --- 1.1 Coûts de semences --- */}
            {!mainLoading ? (
                seedCosts.length > 0 ? (
                    <>
                        <h2 className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
                            Coûts des semences
                        </h2>
                        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-green-700 text-white">
                                <tr>
                                    <th className="py-2 text-left pl-4 uppercase font-semibold text-[1.1em]">
                                        Semence
                                    </th>
                                    <th className="py-2 text-left pl-6 uppercase font-semibold text-[1.1em]">
                                        Coûts Totaux ($)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {seedCosts.map((item) => (
                                    <tr
                                        key={item.seed}
                                        className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                    >
                                        <td className="py-3 px-4">{item.seed}</td>
                                        <td className="py-3 px-4 text-right">{formatCurrency(item.total_cost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p className="text-gray-500 italic">
                        Aucun coût de semences trouvé pour la période sélectionnée.
                    </p>
                )
            ) : null}

            {/* --- 1.2 Coûts de packaging --- */}
            {!mainLoading ? (
                adjustedPackagingCosts.length > 0 ? (
                    <section className="mb-8 mt-[1.5rem]">
                        <h2 className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
                            Coûts d'emballage
                        </h2>
                        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-green-700 text-white">
                                <tr>
                                    <th className="py-2 text-left pl-4 uppercase font-semibold text-[1.1em]">
                                        Culture
                                    </th>
                                    <th className="py-2 text-left pl-6 uppercase font-semibold text-[1.1em]">
                                        Coûts Totaux ($)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {adjustedPackagingCosts.map((item) => (
                                    <tr
                                        key={item.vegetable}
                                        className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                    >
                                        <td className="py-3 px-4">{item.vegetable}</td>
                                        <td className="py-3 px-4 text-right">
                                            {formatCurrency(item.total_cost)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                ) : (
                    <p className="text-gray-500 italic">
                        Aucun coût de packaging trouvé pour la période sélectionnée.
                    </p>
                )
            ) : null}




            {/* --- 2. Coûts autres --- */}
            <section className="mb-8">
                <h2 className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
                    Coûts autres
                </h2>

                {!mainLoading && otherCosts.length > 0 ? (
                    <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                        <thead className="bg-green-700 text-white">
                            <tr>
                                <th className="py-2 text-left pl-4 uppercase font-semibold text-[1.1em]">
                                    Catégorie
                                </th>
                                <th className="py-2 text-left pl-6 uppercase font-semibold text-[1.1em]">
                                    Coûts Totaux ($)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {otherCosts.map(([category, cost]) => (
                                <tr
                                    key={category}
                                    className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                >
                                    <td className="py-3 px-4">{category}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(cost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    !mainLoading && (
                        <p className="text-gray-500 italic">
                            Aucun autre coût trouvé pour la période selectionnée.
                        </p>
                    )
                )}

                {otherCostsTotal > 0 && (
                    <div className="bg-white shadow-lg rounded-lg p-4 mt-4">
                        <p className="text-[1em]">
                            Total des autres coûts :{" "}
                            <span className="font-bold">{formatCurrency(otherCostsTotal)}</span>
                        </p>
                    </div>
                )}
            </section>

            {/* --- 3. Redistribution --- */}
            <section>
                <h2 className="text-[1.5em] font-bold mt-[1rem]">
                    Coûts à redistribuer au prorata des ventes : &nbsp;
                    <br className="md:hidden" />
                    <p className="font-bold text-[1.3em] text-center md:inline">
                        {formatCurrency(totalCostsToRedistribute)}
                    </p>
                </h2>

                <div className="mt-4 flex flex-col gap-[0.5rem] items-center md:grid md:grid-cols-2">
                    {Object.entries(percentages).map(([veg, pct]) => (
                        <p key={veg}>
                            <span className="font-bold">{veg}:</span>
                            <br />
                            + {formatCurrency(totalCostsToRedistribute * (pct / 100))} (
                            {pct.toFixed(2)}%)
                        </p>
                    ))}
                </div>
            </section>
            {/* --- 4. Total costs per vegetable --- */}
            <section className="mb-8 mt-[2rem]">
                <h2 className="text-[2em] font-bold text-gray-700 mb-4 border-b pb-2">
                    Coûts totaux par culture
                </h2>

                {!mainLoading && Object.keys(vegetableTotalCosts).length > 0 ? (
                    <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                        <thead className="bg-green-700 text-white">
                            <tr>
                                <th className="py-2 text-left pl-4 uppercase font-semibold text-[1.1em]">
                                    Culture
                                </th>
                                <th className="py-2 text-left pl-6 uppercase font-semibold text-[1.1em]">
                                    Coût total ($)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {Object.entries(vegetableTotalCosts).filter(([veg]) => veg !== "AUCUNE").map(([veg, cost]) => (
                                <tr
                                    key={veg}
                                    className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                >
                                    <td className="py-3 px-4">{veg}</td>
                                    <td className="py-3 px-4 text-right">{formatCurrency(cost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    !mainLoading && (
                        <p className="text-gray-500 italic">
                            Aucun coût total trouvé pour la période sélectionnée.
                        </p>
                    )
                )}
            </section>

        </article>
    );
};

export default Costs;


