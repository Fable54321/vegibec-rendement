import { Link, useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../000--App/App";
import { useEffect, useState, useContext } from "react";
import { useDate } from "@/context/date/DateContext";
import { UnitsContext } from "@/context/units/UnitsContext";
import { UnspecifiedContext } from "@/context/unspecified/UnspecifiedContext";

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
        adjustedUnspecifiedCosts,
    } = useOutletContext<AppOutletContext>();


    type TotalsTab = "costs" | "units" | "price";

    const [totalsTab, setTotalsTab] = useState<TotalsTab>("costs");

    type SeedCostItem = {
        vegetable: string;
        cultivar?: string;
        total_cost: number;
    };


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

    const [seedCostsGlobal, setSeedCostsGlobal] = useState<Record<string, number>>({});
    const [seedCostsPerCultivar, setSeedCostsPerCultivar] = useState<SeedCostItem[]>([]);
    const [normalizedSeedCosts, setNormalizedSeedCosts] = useState<SeedCostItem[]>([]);
    const [showPerCultivar, setShowPerCultivar] = useState<boolean>(false);

    const { totals } = useContext(UnitsContext);

    const { data } = useContext(UnspecifiedContext);

    console.log("unspecified costs data from context", data);

    const unitsByVegetable: Record<
        string,
        { total: number; unitLabel: "kg" | "unités" }
    > = {};

    totals.forEach((row) => {
        const kg = Number(row.total_kg);
        const units = Number(row.total_units);

        if (kg > 0) {
            unitsByVegetable[row.vegetable] = {
                total: kg,
                unitLabel: "kg",
            };
        } else {
            unitsByVegetable[row.vegetable] = {
                total: units,
                unitLabel: "unités",
            };
        }
    });

    const vegetableTotals = Object.keys(vegetableTotalCosts).filter(
        (veg) => veg !== "AUCUNE"
    );




    useEffect(() => {
        const normalized: SeedCostItem[] = seedCosts.map((item) => {
            if ("seed" in item) {
                // 2024 shape
                return {
                    vegetable: item.seed as string,
                    total_cost: item.total_cost,
                };
            } else {
                // 2025+ shape
                return {
                    vegetable: item.vegetable,
                    cultivar: item.cultivar,
                    total_cost: item.total_cost,
                };
            }
        });

        setNormalizedSeedCosts(normalized);


        const global = normalized.reduce<Record<string, number>>((acc, item) => {
            if (!acc[item.vegetable]) acc[item.vegetable] = 0;
            acc[item.vegetable] += item.total_cost;
            return acc;
        }, {});

        setSeedCostsGlobal(global);



        setSeedCostsPerCultivar(normalized);

    }, [seedCosts]);






    const formatCurrency = (value: number | string | undefined | null) => {
        if (value == null) return "—";
        const n = typeof value === "string" ? parseFloat(value) : value;
        if (!Number.isFinite(n)) return "—";
        // Only round for display, keep internal calculations untouched
        return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };





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
            <div className="md:flex flex-col items-center ">
                <section className="grid grid-cols-2 gap-y-[0.25rem] mb-[1.5rem] md:w-[50%]  md:margin-x-auto md:gap-x-[3rem] " >

                    <div className="pr-2 flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
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

                    <div className="pr-2 flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
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

                    <div className="pr-2 flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
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

                    <div className="pr-2 flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
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

                    <div className="pr-2 flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
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

                    <div className="pr-2 flex flex-row gap-[0.55rem] justify-end items-center md:justify-center">
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
            {/* --- Seed Costs Table --- */}
            <section className="mb-8">
                <h2 id="seedsLink" className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
                    Coûts des semences
                </h2>

                {/* Optional tab to switch between global / per-cultivar */}
                <div className="mb-4 flex gap-2">
                    <button
                        className={`px-4 py-2 rounded font-semibold ${showPerCultivar ? "bg-gray-200 text-gray-700" : "bg-green-700 text-white"}`}
                        onClick={() => setShowPerCultivar(false)}
                    >
                        Totaux globaux
                    </button>
                    <button
                        className={`px-4 py-2 rounded font-semibold ${showPerCultivar ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setShowPerCultivar(true)}
                    >
                        Par cultivar
                    </button>
                </div>

                {!mainLoading && normalizedSeedCosts.length > 0 ? (
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
                            {showPerCultivar
                                ? seedCostsPerCultivar.map((item) => {



                                    return (
                                        <tr
                                            key={item.cultivar ? `${item.vegetable}-${item.cultivar}` : item.vegetable}
                                            className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                        >
                                            <td className="py-3 px-4">
                                                {item.cultivar ? `${item.vegetable} (${item.cultivar})` : item.vegetable}
                                            </td>
                                            <td className="py-3 px-4 text-right">{formatCurrency(item.total_cost)}</td>
                                        </tr>
                                    );
                                })
                                : Object.entries(seedCostsGlobal).map(([veg, total_cost]) => (
                                    <tr
                                        key={veg}
                                        className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                    >
                                        <td className="py-3 px-4">
                                            {veg === "AUCUNE" ? "NON SPÉCIFIÉE" : veg}
                                        </td>
                                        <td className="py-3 px-4 text-right">{formatCurrency(total_cost)}</td>
                                    </tr>
                                ))}
                        </tbody>

                    </table>
                ) : (
                    !mainLoading && (
                        <p className="text-gray-500 italic">
                            Aucun coût de semences trouvé pour la période sélectionnée.
                        </p>
                    )
                )}
            </section>



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
                                        <td className="py-3 px-4">{item.vegetable === "AUCUNE" ? "NON SPÉCIFIÉE" : item.vegetable}</td>
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
                                                <td className="py-3 px-4">{label === "AUCUNE" ? "NON SPÉCIFIÉE" : label}</td>
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

            {/* --- 1.5 coûts non classés */}

            {!mainLoading ? (
                adjustedUnspecifiedCosts.length > 0 ? (
                    <section className="mb-8 mt-[1.5rem]">
                        <h2 id="packagingLink" className="text-[1.7rem] font-bold text-gray-700 mb-4 border-b pb-2">
                            Coûts non classés
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
                                {adjustedUnspecifiedCosts.map((item) => (
                                    <tr
                                        key={item.vegetable}
                                        className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                    >
                                        <td className="py-3 px-4">{item.vegetable === null || item.vegetable === undefined || item.vegetable === "" || !item.vegetable || item.vegetable === "null" ? "NON SPÉCIFIÉE" : item.vegetable}</td>
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
                        Aucun coût non classé trouvé pour la période sélectionnée.
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
                                    <td className="py-3 px-4">{category.toUpperCase().split("_").join(" ")}</td>
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

            {/* --- Totals tabs selector --- */}
            <div className="mt-[2.5rem] flex justify-center gap-2 ">
                <button
                    onClick={() => setTotalsTab("costs")}
                    className={`px-4 py-2 rounded font-semibold hover:cursor-pointer ${totalsTab === "costs"
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-700"
                        }`}
                >
                    Coûts totaux
                </button>

                <button
                    onClick={() => setTotalsTab("units")}
                    className={`px-4 py-2 rounded font-semibold hover:cursor-pointer ${totalsTab === "units"
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-700"
                        }`}
                >
                    Unités / kg vendus
                </button>

                <button
                    onClick={() => setTotalsTab("price")}
                    className={`px-4 py-2 rounded font-semibold hover:cursor-pointer ${totalsTab === "price"
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-700"
                        }`}
                >
                    Prix par unité
                </button>
            </div>


            <section className="mb-8 mt-[1rem]">
                <h2
                    id="totalsLink"
                    className="text-[2em] text-center font-bold text-gray-700 mb-4 border-b pb-2"
                >
                    {totalsTab === "costs" && "Coûts totaux par culture"}
                    {totalsTab === "units" && "Unités / kg vendus par culture"}
                    {totalsTab === "price" && "Prix par unité / kg"}
                </h2>

                {!mainLoading && vegetableTotals.length > 0 ? (
                    <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                        <thead className="bg-green-700 text-white">
                            <tr>
                                <th className="py-2 text-left pl-4 uppercase font-semibold text-[1.1em]">
                                    Culture
                                </th>

                                <th className="py-2 text-right pr-6 uppercase font-semibold text-[1.1em]">
                                    {totalsTab === "costs" && "Coût total ($)"}
                                    {totalsTab === "units" && "Quantité totale"}
                                    {totalsTab === "price" && "Prix"}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="text-gray-700">
                            {vegetableTotals.map((veg) => {
                                const cost = vegetableTotalCosts[veg as keyof typeof vegetableTotalCosts] || 0;
                                const unitsData = unitsByVegetable[veg];

                                let displayValue: React.ReactNode = "—";

                                if (totalsTab === "costs") {
                                    displayValue = formatCurrency(cost);
                                }

                                if (totalsTab === "units" && unitsData) {
                                    displayValue = `${unitsData.total.toLocaleString("fr-CA")} ${unitsData.unitLabel}`;
                                }

                                if (totalsTab === "price" && unitsData && unitsData.total > 0) {
                                    displayValue = formatCurrency(cost / unitsData.total);
                                }

                                return (
                                    <tr
                                        key={veg}
                                        className="border-b border-green-400 hover:bg-gray-50 transition duration-150"
                                    >
                                        <td className="py-3 px-4">
                                            {veg === "AUCUNE" ? "NON SPÉCIFIÉE" : veg}
                                            {totalsTab === "price" && unitsData?.unitLabel === "kg" && (
                                                <span className="ml-2 text-sm italic text-gray-500">
                                                    (au kilo)
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {displayValue}
                                        </td>
                                    </tr>
                                );
                            })}
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

        </article>
    );
};

export default Costs;


