import { Link, useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../000--App/App";
import { useEffect, useState } from "react";
import { useDate } from "@/context/date/DateContext";

const Costs = () => {
    const {
        seedCosts,
        percentages,
        otherCostsTotal,
        totalCostsToRedistribute,
        mainLoading,
        mainError,
        otherCosts,
        vegetableTotalCosts,
        adjustedPackagingCosts,
        adjustedVegetableCosts,
        categorySoilProducts,
        soilGroupBy,
        setSoilGroupBy,
        adjustedSoilProducts,
    } = useOutletContext<AppOutletContext>();


    const { yearSelected, setYearSelected,
        monthSelected,
        setMonthSelected,
        startDate,
        setStartDate,
        endDate,
        setEndDate, } = useDate();


    // Checked States /////////////////////

    const [workHoursChecked, setWorkHoursChecked] = useState<boolean>(true);
    const [seedsChecked, setSeedsChecked] = useState<boolean>(true);
    const [packagingChecked, setPackagingChecked] = useState<boolean>(true);
    const [soilProductsChecked, setSoilProductsChecked] = useState<boolean>(true);
    const [otherCostsChecked, setOtherCostsChecked] = useState<boolean>(true);
    const [totalsChecked, setTotalsChecked] = useState<boolean>(true);






    const formatCurrency = (value: number | string | undefined | null) => {
        if (value == null) return "—";
        const n = typeof value === "string" ? parseFloat(value) : value;
        if (!Number.isFinite(n)) return "—";
        // Only round for display, keep internal calculations untouched
        return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };


    useEffect(() => { console.log("seed costs", seedCosts) }, [seedCosts])


    return (
        <article
            className="md:text-[1.4rem] "
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
                className="bg-gray-50 p-4 rounded-lg shadow-inner mb-[1.5rem] mt-[1rem]"
                style={{
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
            >
                {/* Year input */}
                <select
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    value={yearSelected}
                    onChange={(e) => setYearSelected(e.target.value)}
                >
                    {Array.from({ length: 2055 - 2024 + 1 }, (_, i) => 2024 + i).map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>


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
            <div className="md:flex flex-col items-center">
                <section className="grid grid-cols-2 gap-y-[0.25rem] mb-[1.5rem] md:w-[50%] md:margin-x-auto md:gap-x-[3rem]" >

                    <div className="flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
                        <a className="underline" href="#workHoursLink">Heures de travail</a>
                        <input
                            className="
                                ml-auto
                                relative
                                appearance-none
                                w-[15px] h-[15px]
                                border border-black
                                bg-white

                                checked:bg-green-700
                                checked:border-green-700

                                checked:after:content-['✔']
                                checked:after:text-white
                                checked:after:text-[12px]
                                checked:after:absolute
                                checked:after:top-[50%]
                                checked:after:left-[50%]
                                checked:after:translate-x-[-50%]
                                checked:after:translate-y-[-50%]
                                "
                            type="checkbox"
                            id="workHours"
                            name="workHours"
                            checked={workHoursChecked}
                            onChange={(e) => setWorkHoursChecked(e.target.checked)}
                        />
                    </div>

                    <div className="flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
                        <a className="underline" href="#seedsLink">Semences</a>
                        <input
                            className="
                                ml-auto
                                relative
                                appearance-none
                                w-[15px] h-[15px]
                                border border-black
                                bg-white

                                checked:bg-green-700
                                checked:border-green-700

                                checked:after:content-['✔']
                                checked:after:text-white
                                checked:after:text-[12px]
                                checked:after:absolute
                                checked:after:top-[50%]
                                checked:after:left-[50%]
                                checked:after:translate-x-[-50%]
                                checked:after:translate-y-[-50%]
                                "
                            type="checkbox"
                            id="seeds"
                            name="seeds"
                            checked={seedsChecked}
                            onChange={(e) => setSeedsChecked(e.target.checked)}
                        />
                    </div>

                    <div className="flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
                        <a className="underline" href="#packagingLink">Emballages</a>
                        <input
                            className="
                                ml-auto
                                relative
                                appearance-none
                                w-[15px] h-[15px]
                                border border-black
                                bg-white

                                checked:bg-green-700
                                checked:border-green-700

                                checked:after:content-['✔']
                                checked:after:text-white
                                checked:after:text-[12px]
                                checked:after:absolute
                                checked:after:top-[50%]
                                checked:after:left-[50%]
                                checked:after:translate-x-[-50%]
                                checked:after:translate-y-[-50%]
                                "
                            type="checkbox"
                            id="packaging"
                            name="packaging"
                            checked={packagingChecked}
                            onChange={(e) => setPackagingChecked(e.target.checked)}
                        />
                    </div>

                    <div className="flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
                        <a className="underline" href="#soilProductsLink">Produits du sol</a>
                        <input
                            className="
                                ml-auto
                                relative
                                appearance-none
                                w-[15px] h-[15px]
                                border border-black
                                bg-white

                                checked:bg-green-700
                                checked:border-green-700

                                checked:after:content-['✔']
                                checked:after:text-white
                                checked:after:text-[12px]
                                checked:after:absolute
                                checked:after:top-[50%]
                                checked:after:left-[50%]
                                checked:after:translate-x-[-50%]
                                checked:after:translate-y-[-50%]
                                "
                            type="checkbox"
                            id="soilProducts"
                            name="soilProducts"
                            checked={soilProductsChecked}
                            onChange={(e) => setSoilProductsChecked(e.target.checked)}
                        />
                    </div>

                    <div className="flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
                        <a className="underline" href="#otherLink">Coûts autres</a>
                        <input
                            className="
                                ml-auto
                                relative
                                appearance-none
                                w-[15px] h-[15px]
                                border border-black
                                bg-white

                                checked:bg-green-700
                                checked:border-green-700

                                checked:after:content-['✔']
                                checked:after:text-white
                                checked:after:text-[12px]
                                checked:after:absolute
                                checked:after:top-[50%]
                                checked:after:left-[50%]
                                checked:after:translate-x-[-50%]
                                checked:after:translate-y-[-50%]
                                "
                            type="checkbox"
                            id="otherCosts"
                            name="otherCosts"
                            checked={otherCostsChecked}
                            onChange={(e) => setOtherCostsChecked(e.target.checked)}
                        />
                    </div>

                    <div className="flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
                        <a className="underline" href="#totalsLink">Coûts totaux</a>
                        <input
                            className="
                                ml-auto
                                relative
                                appearance-none
                                w-[15px] h-[15px]
                                border border-black
                                bg-white

                                checked:bg-green-700
                                checked:border-green-700

                                checked:after:content-['✔']
                                checked:after:text-white
                                checked:after:text-[12px]
                                checked:after:absolute
                                checked:after:top-[50%]
                                checked:after:left-[50%]
                                checked:after:translate-x-[-50%]
                                checked:after:translate-y-[-50%]
                                "
                            type="checkbox"
                            id="totals"
                            name="totals"
                            checked={totalsChecked}
                            onChange={(e) => setTotalsChecked(e.target.checked)}
                        />
                    </div>

                </section>
            </div>

            {/* --- 1. Coûts provenant des heures de travail --- */}
            {workHoursChecked &&
                <section className="mb-8">
                    <h2 id="workHoursLink" className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
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
            }
            {/* --- 1.1 Coûts de semences --- */}
            {!mainLoading ? (
                seedCosts.length > 0 ? (
                    <>
                        <h2 id="seedsLink" className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
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
                                {seedCosts.map((item) => {
                                    const name = "seed" in item ? item.seed : item.vegetable;
                                    return (
                                        <tr className="border-b border-green-400 hover:bg-gray-50 transition duration-150" key={name}>
                                            <td className="py-3 px-4" >{name}</td>
                                            <td className="py-3 px-4 text-right">{formatCurrency(item.total_cost)}</td>
                                        </tr>
                                    );
                                })}
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
                        <h2 id="packagingLink" className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
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
                        Aucun coût d'emballage trouvé pour la période sélectionnée.
                    </p>
                )
            ) : null}

            {!mainLoading ? (
                (soilGroupBy === "vegetable" ? adjustedSoilProducts.length : categorySoilProducts.length) > 0 ? (
                    <section className="mb-8 mt-[1.5rem]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 id="soilLink" className="text-[1.7rem] font-bold text-gray-700 border-b pb-2">
                                Coûts des produits du sol
                            </h2>

                            {/* --- Selector --- */}
                            <select
                                value={soilGroupBy}
                                onChange={(e) =>
                                    setSoilGroupBy(e.target.value as "vegetable" | "category")
                                }
                                className="p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-[1rem]"
                            >
                                <option value="vegetable">Par culture</option>
                                <option value="category">Par catégorie</option>
                            </select>
                        </div>

                        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                            <thead className="bg-green-700 text-white">
                                <tr>
                                    <th className="py-2 text-left pl-4 uppercase font-semibold text-[1.1em]">
                                        {soilGroupBy === "vegetable" ? "Culture" : "Catégorie"}
                                    </th>
                                    <th className="py-2 text-left pl-6 uppercase font-semibold text-[1.1em]">
                                        Coûts Totaux ($)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {(soilGroupBy === "vegetable" ? adjustedSoilProducts : categorySoilProducts)
                                    .filter((item) => item.total_cost > 0).map((item, idx) => {
                                        const label = "vegetable" in item ? item.vegetable : item.category;
                                        return (
                                            <tr key={idx} className="border-b border-green-400 hover:bg-gray-50 transition duration-150">
                                                <td className="py-3 px-4">{label}</td>
                                                <td className="py-3 px-4 text-right">{formatCurrency(item.total_cost)}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </section>
                ) : (
                    <p className="text-gray-500 italic">
                        Aucun coût de produits du sol trouvé pour la période sélectionnée.
                    </p>
                )
            ) : null}




            {/* --- 2. Coûts autres --- */}
            <section className="mb-8">
                <h2 id="otherLink" className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
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
                                    <td className="py-3 px-4">{category.toUpperCase()}</td>
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
                <h2 id="totalsLink" className="text-[2em] font-bold text-gray-700 mb-4 border-b pb-2">
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


