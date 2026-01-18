
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { AppOutletContext } from "../000--App/App";
import { useEffect, useState } from "react";



interface Revenue {
    vegetable: string;
    revenue: number;
}

const Revenues = () => {
    const { loading: authLoading } = useAuth();

    const [isEditingYear, setIsEditingYear] = useState(false);


    const { revenues, revenuesSelectedYear, setRevenuesSelectedYear } = useOutletContext<AppOutletContext>();

    const colors = [
        "#2ecc71",
        "#3498db",
        "#f1c40f",
        "#e67e22",
        "#1abc9c",
        "#9b59b6",
        "#e74c3c",
        "#120385",
        "#FAEE46",
        "#F207D5",
    ];



    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("fr-CA", {
            style: "currency",
            currency: "CAD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };


    useEffect(() => {
        console.log("Revenues updated:", revenues);
    }, [revenues])

    const getConicGradient = (revenues: Revenue[]) => {
        if (revenues.length === 0) return "radial-gradient(circle, #ccc 0%, #999 100%)";

        const total = revenues.reduce((sum, r) => sum + Number(r.revenue), 0);
        let currentAngle = 0;

        const stops = revenues.map((r, i) => {
            const ratio = Number(r.revenue) / total;
            const start = currentAngle;
            const end = currentAngle + ratio * 360;
            currentAngle = end;
            const color = colors[i % colors.length];
            return `${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
        });

        return `conic-gradient(${stops.join(", ")})`;
    };

    if (authLoading) {
        return <p className="mt-4 text-sm italic">Authenticating...</p>;
    }

    return (
        <article className="flex flex-col items-center mt-6 md:text-[1.4rem] pb-[2rem]">
            <Link className="button-generic" to="/">
                Accueil
            </Link>
            <h2 className="text-[1.9em] text-center font-bold">
                Revenus pour l'année{" "}
                {isEditingYear ? (
                    <select
                        value={revenuesSelectedYear}
                        onChange={(e) => {
                            setRevenuesSelectedYear(e.target.value);
                            setIsEditingYear(false);
                        }}
                        onBlur={() => setIsEditingYear(false)}
                        autoFocus
                        className="border px-2 py-1 rounded "
                    >
                        {Array.from({ length: 30 }, (_, i) => {
                            const year = 2024 + i;
                            return (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            );
                        })}
                    </select>
                ) : (
                    <button
                        onClick={() => setIsEditingYear(true)}
                        className="underline text-green-700 hover:text-green-400 hover:cursor-pointer"
                    >
                        {revenuesSelectedYear}
                    </button>
                )}
            </h2>


            <>
                {revenues.length === 0 && (
                    <p className="mt-4 text-center">Aucun revenu enregistré pour l'année sélectionnée.</p>
                )}
                {revenues.length > 0 && (<section className="flex flex-col items-center w-full">
                    <div
                        style={{
                            background: getConicGradient(revenues),
                        }}
                        className="w-[min(98%,_540px)] aspect-square rounded-full shadow-md border"
                    ></div>
                </section>)}

                <section className="w-full">
                    <ul className="mt-4 text-[0.9em] w-full flex flex-col items-center gap-[0.45rem]">
                        {revenues.length > 0 && revenues.map((item, index) => (
                            <li
                                key={item.vegetable}
                                className="flex w-[min(99%,_600px)] justify-between items-center border-b-2 border-dotted border-black"
                            >
                                <div
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                    className="w-[0.8rem] h-[0.8rem]"
                                ></div>{" "}
                                <div className="w-[70%] flex">
                                    <span className="font-bold">{item.vegetable}</span>:{" "}
                                    <span className="text-[1em]  text-nowrap mr-[2rem] ml-auto font-bold">
                                        {formatCurrency(Number(item.revenue))}
                                    </span>

                                </div>{" "}
                                <p className="text-[1.1em] font-bold">
                                    {((Number(item.revenue) /
                                        revenues.reduce(
                                            (sum, r) => sum + Number(r.revenue),
                                            0
                                        )) *
                                        100
                                    ).toFixed(2)}
                                    %
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            </>


            <p className="text-center mt-[1.5rem]">
                ***Les données présentées ci-dessus ont pour but d'avoir une
                représentation visuelle du prorata utilisé pour la redistribution des
                coûts qui n'étaient pas déjà attribuables.
            </p>
        </article>
    );
};

export default Revenues;
