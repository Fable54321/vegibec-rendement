import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../000--App/App";
import { useEffect, useContext, useState, useMemo } from "react";
import { useDate } from "../../context/date/DateContext";
import { UnitsContext } from "../../context/units/UnitsContext";

const USDA = () => {


    type VegReport = {
        results: VegResult[];
    };

    type PriceResult =
        | { value: number; unit: "ch" }
        | { value: number; unit: "lb" };

    type VegResult = {
        market_location_city: string;
        commodity: string;
        item_size: string;
        pkg: string;
        low_price: string;
        high_price: string;
        var: string;
        organic: string;
        properties: string;
    };

    const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

    const {
        vegetableTotalCosts,
    } = useOutletContext<AppOutletContext>()

    const { totals } = useContext(UnitsContext);

    const { endDate, setEndDate, setStartDate } = useDate();

    const [totalCostsArray, setTotalCostsArray] = useState<{ vegetable: string; total_cost: number }[]>([]);

    const [USDALoading, setUSDALoading] = useState<boolean>(false);
    const [USDAError, setUSDAError] = useState<string | null>(null);
    const [vegReports, setVegReports] = useState<VegReport[]>([]);
    const [usdToCadRate, setUsdToCadRate] = useState<number | null>(null);
    const [fxLoading, setFxLoading] = useState(false);
    const [fxError, setFxError] = useState<string | null>(null);


    useEffect(() => { console.log('remember to deal with these') }, [USDALoading, fxLoading, USDAError, fxError]);

    const genericVegetables = useMemo(() =>
        ["BRUSSELS SPROUTS",
            "CABBAGE",
            "CAULIFLOWER",
            "CELERY", "LETTUCE",
            "PEPPERS, BELL TYPE",
            "SQUASH, YELLOW STRAIGHTNECK",
            "SQUASH, GREY",
            "SQUASH, ZUCCHINI",
            "LETTUCE, ICEBERG",
            "LETTUCE, ROMAINE",
            "LETTUCE, GREEN LEAF",
            "LETTUCE, RED LEAF"], []);

    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`; // ✅ ISO
    };


    useEffect(() => {
        const fetchFxRate = async () => {
            if (!endDate) return;

            const formattedDate = formatDate(new Date(endDate));

            setFxLoading(true);
            setFxError(null);

            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/rate-converter/fx-rate?date=${encodeURIComponent(
                        formattedDate
                    )}`
                );

                if (!res.ok) {
                    throw new Error(`FX API error (${res.status})`);
                }

                const data = await res.json();

                if (typeof data?.rate === "number") {
                    setUsdToCadRate(data.rate);

                    console.log("FX rate:", data.rate);
                } else {
                    throw new Error("Invalid FX response shape");
                }
            } catch (err) {
                console.error("Failed to fetch FX rate:", err);
                setFxError((err as Error).message);
            } finally {
                setFxLoading(false);
            }
        };

        fetchFxRate();
    }, [endDate]);


    useEffect(() => {
        const arr = Object.entries(vegetableTotalCosts).map(([vegetable, total_cost]) => ({ vegetable, total_cost }));
        setTotalCostsArray(arr);
    }, [vegetableTotalCosts])


    useEffect(() => {
        const year = new Date(endDate).getFullYear();
        setStartDate(`${year}-01-01`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endDate])

    // RAPPORTS USDA

    useEffect(() => {
        const fetchReports = async () => {
            if (!endDate) return;

            const formatted = formatDate(new Date(endDate));

            // 🔹 Check localStorage first
            const cached = localStorage.getItem(`vegReports-${formatted}`);
            if (cached) {
                const { data, ts } = JSON.parse(cached);
                // only use if cache is recent enough (e.g. < 24h old)
                if (Date.now() - ts < 1000 * 60 * 60 * 24) {
                    setVegReports(data);
                    return; // ✅ don’t hit API
                }
            }

            setUSDALoading(true);
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/vegReports?date=${formatted}`
                );
                const data = await res.json();
                setVegReports(data.reports || []);

                // 🔹 Save to cache
                localStorage.setItem(
                    `vegReports-${formatted}`,
                    JSON.stringify({ data: data.reports || [], ts: Date.now() })
                );
            } catch (err) {
                setUSDAError((err as Error).message);
                console.error("Failed to fetch veg reports:", err);
            } finally {
                setUSDALoading(false);
                setUSDAError(null);
            }
        };

        fetchReports();
    }, [endDate]);

    //////////////////////////////////////////////////////////////

    const normalizedGenericVegetables = useMemo(
        () => genericVegetables.map(v => v.toUpperCase()),
        [genericVegetables]
    );

    const filteredVegReports = useMemo(() => {
        return vegReports
            .map(report => ({
                ...report,
                results: report.results.filter(result =>
                    normalizedGenericVegetables.includes(
                        result.commodity.toUpperCase()
                    )
                ),
            }))
            .filter(report => report.results.length > 0);
    }, [vegReports, normalizedGenericVegetables]);

    const rows = useMemo(
        () => filteredVegReports
            .flatMap(report => report.results)
            .filter(result => result.organic === "N")
            .filter(result => result.item_size.toUpperCase() !== "IRREGULAR SIZE")
            .filter(result => result.high_price || result.low_price)

            .sort((a, b) => a.commodity.localeCompare(b.commodity)),
        [filteredVegReports]
    );

    useEffect(() => { console.log(vegReports) }, [vegReports]);

    ////////////////////////////////////////////////////WEIGHT INFO////////////  

    const YELLOW_SQUASH_PACKAGE_WEIGHTS: Record<string, number> = {
        "1/2 bushel cartons": 20.5,
        "4/7 bushel cartons": 25,
        "1 1/9 bushel cartons": 42,
        "1/2 and 5/9 bushel cartons": 21.2,
    };

    const YELLOW_SQUASH_UNIT_WEIGHTS: Record<string, number> = {
        SMALL: 0.24,
        "SMALL-MEDIUM": 0.30,
        MEDIUM: 0.42,
        "MEDIUM-LARGE": 0.58,
        LARGE: 0.78,
    };

    const ZUCCHINI_SQUASH_PACKAGE_WEIGHTS: Record<string, number> = {
        "1/2 bushel cartons": 20.5,
        "4/7 bushel cartons": 25,
        "1 1/9 bushel cartons": 42,
        "1/2 and 5/9 bushel cartons": 21.2,
    };


    const ZUCCHINI_SQUASH_UNIT_WEIGHTS: Record<string, number> = {
        SMALL: 0.26,
        "SMALL-MEDIUM": 0.32,
        MEDIUM: 0.45,
        "MEDIUM-LARGE": 0.62,
        LARGE: 0.85,
    };

    const GREY_SQUASH_PACKAGE_WEIGHTS: Record<string, number> = {
        "1/2 bushel cartons": 20.5,
        "4/7 bushel cartons": 25,
        "1 1/9 bushel cartons": 42,
        "1/2 and 5/9 bushel cartons": 21.2,
    };


    const GREY_SQUASH_UNIT_WEIGHTS: Record<string, number> = {
        SMALL: 0.28,
        "SMALL-MEDIUM": 0.34,
        MEDIUM: 0.48,
        "MEDIUM-LARGE": 0.65,
        LARGE: 0.90,
    };

    const BELL_PEPPER_PACKAGE_WEIGHTS: Record<string, number> = {
        "11 lb cartons": 11,
        "1 1/9 bushel cartons": 29, // midpoint of 28–30 lbs
        "15 lb cartons": 15,
    };

    const BELL_PEPPER_UNIT_WEIGHTS: Record<string, number> = {
        "SMALL-MEDIUM": 0.22,
        "MEDIUM": 0.26,
        "MEDIUM-LARGE": 0.31,
        LARGE: 0.35,
        "EXTRA LARGE": 0.40,
        "JUMBO": 0.44,
    };





    //////////////////////////////////////////////////////////////////////////////////


    const normalizeSize = (size?: string) =>
        size?.toUpperCase().replace("_", "-").trim();



    const findWeight = (arr: VegResult, commodity: string): number | "-" => {
        switch (commodity.toUpperCase()) {
            case "SQUASH, YELLOW STRAIGHTNECK":
                return YELLOW_SQUASH_PACKAGE_WEIGHTS[arr.pkg] ?? 0;
            case "SQUASH, ZUCCHINI":
                return ZUCCHINI_SQUASH_PACKAGE_WEIGHTS[arr.pkg] ?? 0;
            case "SQUASH, GREY":
                return GREY_SQUASH_PACKAGE_WEIGHTS[arr.pkg] ?? 0;
            case "PEPPERS, BELL TYPE":
                return BELL_PEPPER_PACKAGE_WEIGHTS[arr.pkg] ?? 0;
            default:
                return "-";
        }
    };


    const findUnits = (
        arr: VegResult,
        commodity: string
    ): number | "-" => {
        switch (commodity.toUpperCase()) {
            case "SQUASH, YELLOW STRAIGHTNECK": {
                const totalWeight =
                    YELLOW_SQUASH_PACKAGE_WEIGHTS[arr.pkg];

                if (!totalWeight) return 0;

                const sizeKey = normalizeSize(arr.item_size);
                const unitWeight = sizeKey
                    ? YELLOW_SQUASH_UNIT_WEIGHTS[sizeKey]
                    : undefined;

                if (!unitWeight) return 0;

                // USDA-style averages → round, not floor
                return Math.round(totalWeight / unitWeight);
            }
            case "SQUASH, ZUCCHINI": {
                const totalWeight =
                    ZUCCHINI_SQUASH_PACKAGE_WEIGHTS[arr.pkg];

                if (!totalWeight) return 0;

                const sizeKey = normalizeSize(arr.item_size);
                const unitWeight = sizeKey
                    ? ZUCCHINI_SQUASH_UNIT_WEIGHTS[sizeKey]
                    : undefined;

                if (!unitWeight) return 0;

                // USDA-style averages → round, not floor
                return Math.round(totalWeight / unitWeight);
            }
            case "SQUASH, GREY": {
                const totalWeight =
                    GREY_SQUASH_PACKAGE_WEIGHTS[arr.pkg];

                if (!totalWeight) return 0;

                const sizeKey = normalizeSize(arr.item_size);
                const unitWeight = sizeKey
                    ? GREY_SQUASH_UNIT_WEIGHTS[sizeKey]
                    : undefined;

                if (!unitWeight) return 0;

                // USDA-style averages → round, not floor
                return Math.round(totalWeight / unitWeight);
            }
            case "PEPPERS, BELL TYPE": {
                const totalWeight =
                    BELL_PEPPER_PACKAGE_WEIGHTS[arr.pkg];

                if (!totalWeight) return 0;

                const sizeKey = normalizeSize(arr.item_size);
                const unitWeight = sizeKey
                    ? BELL_PEPPER_UNIT_WEIGHTS[sizeKey]
                    : undefined;

                if (!unitWeight) return 0;

                // USDA-style averages → round, not floor
                return Math.round(totalWeight / unitWeight);
            }

            default:
                return "-";
        }
    };



    //////// ROMAINE LETTUCE ///////////////////////////////////////////

    function extractUnitsFromPackage(pkg?: string): number | null {
        if (!pkg) return null;

        const text = pkg.toUpperCase();

        // Pattern 1: "12 X 3", "12X3", "12 x 3-count"
        let match = text.match(/(\d+)\s*X\s*(\d+)/);
        if (match) {
            return Number(match[1]) * Number(match[2]);
        }

        // Pattern 2: "cartons 12 3-count packages"
        match = text.match(/(\d+)\s+(\d+)\s*-\s*COUNT/);
        if (match) {
            return Number(match[1]) * Number(match[2]);
        }

        return null;

    }

    function extractUnitsFromSize(size?: string): number | null {
        if (!size) return null;

        const match = size.toUpperCase().match(/(\d+)\s*S\b/);
        return match ? Number(match[1]) : null;
    }


    function findLettuceUnits(row: VegResult): number | "-" {
        // 1️⃣ item_size wins: 24s, 30s, FILM LINED 24S
        const fromSize = extractUnitsFromSize(row.item_size);
        if (fromSize) return fromSize;

        // 2️⃣ package fallback: cartons 12 3-count packages
        const fromPkg = extractUnitsFromPackage(row.pkg);
        if (fromPkg) return fromPkg;

        return "-";
    }



    ////////////////////////////////////////////////////////////////


    function extractUnitsFromDozen(size?: string): number | null {
        if (!size) return null;

        const text = size.toUpperCase();

        // 2 dozen, 3 dozen
        let match = text.match(/(\d+)\s+DOZEN/);
        if (match) {
            return Number(match[1]) * 12;
        }

        // 2 1/2 dozen
        match = text.match(/(\d+)\s+1\/2\s+DOZEN/);
        if (match) {
            return Number(match[1]) * 12 + 6;
        }

        return null;
    }


    function findCeleryUnits(row: VegResult): number | "-" {
        // 1️⃣ 18s, 24s, etc.
        const fromS = extractUnitsFromSize(row.item_size);
        if (fromS) return fromS;

        // 2️⃣ dozen-based sizes
        const fromDozen = extractUnitsFromDozen(row.item_size);
        if (fromDozen) return fromDozen;

        return "-";
    }

    function findCauliflowerUnits(row: VegResult): number | "-" {
        return extractUnitsFromSize(row.item_size) || "-";
    }


    function extractCartonWeight(pkg?: string): number | null {
        if (!pkg) return null;

        const match = pkg.match(/(\d+(?:\.\d+)?)\s*LB/i);
        return match ? Number(match[1]) : null;
    }


    const CABBAGE_UNIT_WEIGHTS: Record<string, number> = {
        "ROUND GREEN TYPE": 2.5,
        "RED TYPE": 2.75,
        "SAVOY TYPE": 2.25,
    };

    const DEFAULT_CABBAGE_WEIGHT = 2.5;





    function findCabbageUnits(row: VegResult): number | null {
        const cartonWeight = extractCartonWeight(row.pkg);
        if (!cartonWeight) return null;

        const unitWeight =
            CABBAGE_UNIT_WEIGHTS[row.var] ?? DEFAULT_CABBAGE_WEIGHT;

        return Math.round(cartonWeight / unitWeight);
    }


    function getPricePerPound(row: VegResult): number | null {
        if (!row.low_price || !row.high_price) return null;

        const avgPrice =
            (parseFloat(row.low_price) + parseFloat(row.high_price)) / 2;

        // Brussels sprouts are always 25 lb cartons
        const CARTON_WEIGHT_LBS = 25;

        return avgPrice / CARTON_WEIGHT_LBS;
    }


    function getPrice(row: VegResult, usdToCadRate?: number | null): PriceResult | null {
        const commodity = row.commodity.toUpperCase();

        // 🥬 Brussels sprouts → price per lb
        if (commodity === "BRUSSELS SPROUTS") {
            let price = getPricePerPound(row);
            if (!price) return null;

            if (usdToCadRate) {
                price *= usdToCadRate;
            }

            return { value: price, unit: "lb" };
        }

        // Everything else → price per unit
        const unitCost = getUnitCost(row, usdToCadRate);
        if (unitCost == null) return null;

        return { value: unitCost, unit: "ch" };
    }



    const formatCurrency = (value: number | string | undefined | null) => {
        if (value == null) return "—";
        const n = typeof value === "string" ? parseFloat(value) : value;
        if (!Number.isFinite(n)) return "—";
        // Only round for display, keep internal calculations untouched
        return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };




    function getUnitCountByCommodity(
        row: VegResult
    ): number | "-" {
        const commodity = row.commodity.toUpperCase();

        // 🥬 Romaine (count-based, special rules)
        if (commodity.startsWith("LETTUCE")) {
            return findLettuceUnits(row);
        }

        if (commodity === "CELERY") {
            return findCeleryUnits(row);
        }

        if (commodity === "CAULIFLOWER") {
            return findCauliflowerUnits(row);
        }

        if (commodity === "CABBAGE") {
            return findCabbageUnits(row) || "-";
        }

        // 🫑 Weight-based commodities
        return findUnits(row, commodity);
    }


    function getUnitCost(
        row: VegResult,
        usdToCadRate?: number | null
    ): number | null {
        const units = getUnitCountByCommodity(row);
        if (!units) return null;

        if (!row.low_price || !row.high_price) return null;

        const avgPrice =
            (parseFloat(row.low_price) + parseFloat(row.high_price)) / 2;

        let unitCost = avgPrice / Number(units);

        if (usdToCadRate) {
            unitCost *= usdToCadRate;
        }

        return unitCost;
    }





    return (
        <>


            <article className="flex flex-col items-center">
                <h2 className="text-[2em] mt-[4rem] font-bold">Comparatif USDA</h2>
                <label className="flex flex-col items-center">
                    Sélectionner la date de comparaison * :
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            const newEndDate = e.target.value;

                            if (!newEndDate) return;

                            const year = new Date(newEndDate).getFullYear();
                            const newStartDate = `${year}-01-01`;

                            // atomic update — no invalid intermediate state
                            setStartDate(newStartDate);
                            setEndDate(newEndDate);
                        }}
                    />
                </label>
                <section className="w-full max-w-4xl mt-8 mb-16 px-4">
                    <table className="w-full border-collapse table-auto">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">Culture</th>
                                <th className="border border-gray-300 px-4 py-2">Coût Unitaire (vegibec)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {totalCostsArray.map((veg) => {
                                const matchingTotal = totals.find(
                                    (t) => t.vegetable === veg.vegetable
                                );

                                const denominator =
                                    matchingTotal?.total_units ??
                                    matchingTotal?.total_kg ??
                                    0;

                                const unitCost =
                                    denominator > 0 ? veg.total_cost / denominator : null;

                                return (
                                    <tr key={veg.vegetable}>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {veg.vegetable}
                                        </td>

                                        <td className="border border-gray-300 px-4 py-2">
                                            {unitCost !== null ? formatCurrency(unitCost) : "—"}
                                        </td>

                                        <td className="border border-gray-300 px-4 py-2">
                                            {formatCurrency(veg.total_cost)}
                                        </td>
                                    </tr>
                                );
                            })}

                        </tbody>
                    </table>
                </section>
            </article>

            <section className="w-full max-w-6xl mt-8 mb-16 mx-auto ">
                <table className="w-full border-collapse table-auto">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Commodity</th>
                            <th className="border px-4 py-2">Properties</th>
                            <th className="border px-4 py-2">Pkg</th>
                            <th className="border px-4 py-2">Item size</th>
                            <th className="border px-4 py-2">Low price</th>
                            <th className="border px-4 py-2">High price</th>
                            <th className="border px-4 py-2">Avg price</th>
                            <th className="border px-4 py-2">Var</th>
                            <th className="border px-4 py-2">Organic</th>
                            <th className="border px-4 py-2">Weight (lbs)</th>
                            <th className="border px-4 py-2">Units</th>
                            <th className="border px-4 py-2">Unit cost (USD)</th>
                            <th className="border px-4 py-2">Unit cost (CAD)</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={`${r.commodity}-${i}`}>
                                <td className="border px-4 py-2 font-medium">
                                    {r.commodity}
                                </td>

                                <td className="border px-4 py-2">
                                    {r.properties || "—"}
                                </td>

                                <td className="border px-4 py-2">
                                    {r.pkg || "—"}
                                </td>

                                <td className="border px-4 py-2">
                                    {r.item_size || "—"}
                                </td>

                                <td className="border px-4 py-2">
                                    {formatCurrency(r.low_price)}
                                </td>

                                <td className="border px-4 py-2">
                                    {formatCurrency(r.high_price)}
                                </td>

                                <td className="border px-4 py-2">
                                    {formatCurrency(r.low_price && r.high_price
                                        ? (parseFloat(r.low_price) + parseFloat(r.high_price)) / 2
                                        : null
                                    )}
                                </td>

                                <td className="border px-4 py-2">
                                    {r.var || "—"}
                                </td>
                                <td className="border px-4 py-2">
                                    {r.organic}
                                </td>
                                <td className="border px-4 py-2">
                                    {findWeight(r, r.commodity) || "—"}
                                </td>
                                <td className="border px-4 py-2">
                                    {findUnits(r, r.commodity) || "—"}
                                </td>
                                <td className="border px-4 py-2">
                                    {(() => {
                                        const price = getPrice(r, null);
                                        if (!price) return "—";

                                        return `${formatCurrency(price.value)}/${price.unit}`;
                                    })()}
                                </td>
                                <td className="border px-4 py-2">
                                    {(() => {
                                        const price = getPrice(r, usdToCadRate);
                                        if (!price) return "—";

                                        return `${formatCurrency(price.value)}/${price.unit}`;
                                    })()}
                                </td>

                            </tr>
                        ))}

                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500">
                                    Aucun rapport USDA pour cette date
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>



        </>
    )
}

export default USDA
