import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../000--App/App";
import { useEffect } from "react";

const USDA = () => {

    const {
        totalCostsToRedistribute,
        adjustedVegetableCosts,
        percentages,
    } = useOutletContext<AppOutletContext>()


    useEffect(() => { console.log(percentages) }, [percentages])

    const formatCurrency = (value: number | string | undefined | null) => {
        if (value == null) return "—";
        const n = typeof value === "string" ? parseFloat(value) : value;
        if (!Number.isFinite(n)) return "—";
        // Only round for display, keep internal calculations untouched
        return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    return (
        <article className="flex flex-col items-center">
            <h2 className="text-[2em] font-bold mt-[2rem]">Compartif USDA</h2>
            <section className="mt-[2rem] flex flex-col w-[min(98.5%,_600px)]">
                <h3 className="text-center font-bold mb-[1rem]">Coûts totaux par légumes</h3>
                <div className="flex flex-col items-center gap-[0.5rem] w-full">
                    {adjustedVegetableCosts.filter((item) => item.vegetable !== "AUCUNE" && item.vegetable !== "ENDIVES").map((item) =>

                        <div key={item.vegetable} className="flex justify-between w-full">
                            <span>{item.vegetable}</span>
                            <span> {formatCurrency((Number((percentages[item.vegetable] / 100) * totalCostsToRedistribute) + Number(item.total_cost)).toFixed(2))}</span>
                        </div>
                    )}
                </div>
            </section>
        </article>
    )
}

export default USDA
