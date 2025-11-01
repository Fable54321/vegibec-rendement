import { useEffect, useState } from "react";

type CostRow = {
    vegetable: string;
    category: string;
    sub_category: string;
    supervisor: string;
    total_hours: number;
    total_cost: number;
};

const VisualTaskCosts = () => {
    const [year, setYear] = useState(2024);
    const [yearlyData, setYearlyData] = useState<CostRow[]>([]);

    // --- Fetch yearly data ---
    const fetchYearlyData = async () => {
        try {
            const start = `${year}-01-01`;
            const end = `${year}-12-31`;
            const url = `http://localhost:3000/data/costs/summary?groupBy=vegetable&start=${start}&end=${end}`;
            const res = await fetch(url);
            const json = await res.json();

            if (Array.isArray(json)) {
                console.log("Yearly summary for", year, json);
                setYearlyData(json);
            } else {
                console.error("Unexpected yearly response:", json);
                setYearlyData([]);
            }
        } catch (err) {
            console.error("Yearly fetch failed:", err);
            setYearlyData([]);
        }
    };

    useEffect(() => {
        fetchYearlyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    // --- Scaling logic ---
    const maxHeightPx = 400;
    const minBarHeight = 4;

    const filteredData = yearlyData.filter((row) => row.vegetable !== "AUCUNE" && row.vegetable !== "GÉNÉRAL")

    const maxCost =
        filteredData.length > 0
            ? Math.max(...filteredData.map((d) => d.total_cost))
            : 0;

    // compute scaled bar heights
    const scaledData = filteredData.map((d) => {
        const height =
            maxCost > 0
                ? Math.max(minBarHeight, (d.total_cost / maxCost) * maxHeightPx)
                : minBarHeight;
        return { ...d, height };
    });

    return (
        <article className="w-full flex flex-col items-center">
            <h2 className="mt-[1.5rem] font-bold text-center text-[1.5rem]">
                Visualisation des statistiques de coûts de tâches
            </h2>

            <section className="w-full flex flex-col items-center">
                <h3 className="mt-[1.5rem] font-bold text-center text-[1.2rem]">
                    Statistiques annuelles par légume ({year})
                </h3>

                {/* Year selector (optional) */}
                <div className="my-2">
                    <label className="mr-2 font-semibold">Année:</label>
                    <input
                        type="number"
                        value={year}
                        min={2020}
                        max={2030}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border border-green-400 px-2 py-1 rounded w-[6rem]"
                    />
                </div>

                {/* Chart */}
                <div className="pl-[0.7rem] w-[min(98.5%,_700px)] h-[400px] border-3 border-green-400 border-t-0 border-r-0 flex gap-[0.5rem] items-end ">
                    {scaledData
                        // hide these two
                        .map((row, i) => (
                            <>
                                <div
                                    key={i}

                                    className="relative  flex flex-col items-center justify-end text-white text-[0.7rem] lg:text-[0.8rem] rounded-t-sm"
                                    style={{
                                        height: `${row.height}px`,
                                        width: `5.5%`, // auto width depending on number of bars
                                        minWidth: "10px",
                                        backgroundColor: `${i % 2 === 0 ? "#96c61c" : "#4b7312"}`,
                                    }}
                                    title={`${row.vegetable}: ${row.total_cost.toLocaleString()} $`}
                                >
                                    <p className="absolute rotate-290 text-black bottom-[-6.5rem] left-[0] translate-x-[-62%] font-bold w-[10rem] text-right">{row.vegetable}</p>
                                </div>

                            </>
                        ))}



                    {scaledData.length === 0 && (
                        <p className="text-gray-500 text-center w-full mt-6 ">
                            Aucune donnée trouvée pour {year}.
                        </p>
                    )}

                </div>
                <div className="grid grid-cols-2 mt-[9rem] gap-x-[2rem]">
                    {filteredData.map((row, i) => (
                        <div key={i} className="flex flex-col items-start ">
                            <p className="text-[0.8rem] font-bold">{row.vegetable}:</p>
                            <p className="text-[0.8rem] "> {row.total_cost.toLocaleString()} $</p>
                        </div>
                    ))}
                </div>
            </section>
        </article>
    );
};

export default VisualTaskCosts;

