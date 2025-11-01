import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const Revenues = () => {
    const [selectedYear] = useState("2024");
    const [revenues, setRevenues] = useState<{ vegetable: string; total_revenue: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    // const [revenuePercentages, setRevenuePercentages] = useState<{ [vegetable: string]: number }>({});

    useEffect(() => {
        const fetchRevenues = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`http://localhost:3000/revenues/by-year?year_from=${selectedYear}`);
                if (!res.ok) throw new Error("Erreur de chargement");
                const data = await res.json();
                setRevenues(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenues();
    }, [selectedYear]);


    // useEffect(() => {
    //     if (revenues.length > 0) {
    //         const total = revenues.reduce((sum, r) => sum + Number(r.total_revenue), 0);
    //         const percentages = revenues.reduce((acc, r) => {
    //             acc[r.vegetable] = (Number(r.total_revenue) / total) * 100;
    //             return acc;
    //         }, {} as { [vegetable: string]: number });

    //         setRevenuePercentages(percentages);
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [revenues]);





    const colors = [
        "#2ecc71",
        "#3498db",
        "#f1c40f",
        "#e67e22",
        "#1abc9c",
        "#9b59b6",
        "#e74c3c",

        "#120385",  // fixed
        "#FAEE46",
        "#F207D5",
    ];


    const getConicGradient = (revenues: { vegetable: string; total_revenue: number }[]) => {
        if (revenues.length === 0) return "radial-gradient(circle, #ccc 0%, #999 100%)";

        const total = revenues.reduce((sum, r) => sum + Number(r.total_revenue), 0);
        let currentAngle = 0;

        // pick colors (you can replace or randomize these)


        // build gradient stops
        const stops = revenues.map((r, i) => {
            const ratio = Number(r.total_revenue) / total;
            const start = currentAngle;
            const end = currentAngle + ratio * 360;
            currentAngle = end;
            const color = colors[i % colors.length];
            return `${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
        });

        return `conic-gradient(${stops.join(", ")})`;
    };

    return (
        <article className="flex flex-col items-center mt-6 md:text-[1.4rem] pb-[2rem]">
            <Link className="button-generic" to="/">Accueil</Link>
            <h2 className="text-[1.9em] text-center font-bold">
                Revenus pour l'année {selectedYear}
            </h2>

            {loading && <p className="mt-4 text-sm italic">Chargement...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            {!loading && !error && (
                <>
                    <section className="flex flex-col items-center w-full">
                        <div
                            style={{
                                background: getConicGradient(revenues),
                            }}
                            className="w-[min(98%,_540px)] aspect-square rounded-full shadow-md border"
                        ></div>

                    </section>


                    <section className="w-full">
                        <ul className="mt-4 text-[0.9em] w-full flex flex-col items-center gap-[0.45rem]">
                            {revenues.map((item, index) => (
                                <li key={item.vegetable} className="flex w-[min(99%,_600px)]  justify-between items-center border-b-2 border-dotted border-black">
                                    <div style={{ backgroundColor: colors[index % colors.length] }} className="w-[0.8rem] h-[0.8rem]"></div> <div className="w-[70%]"><span className="font-bold ">{item.vegetable}</span>: <span className="text-[0.9em] text-nowrap">{Number(item.total_revenue).toFixed(2)} $ </span>,</div> <p className="text-[1.1em] font-bold">{((Number(item.total_revenue) / revenues.reduce((sum, r) => sum + Number(r.total_revenue), 0)) * 100).toFixed(2)} %</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </>
            )}

            <p className="text-center mt-[1.5rem]">***Les données présentées ci-dessus ont pour but d'avoir une représentation visuelle du prorata utilisé pour la
                redistribution des coûts qui n'étaient pas déjà attribuables.
            </p>
        </article>
    );
};

export default Revenues;
