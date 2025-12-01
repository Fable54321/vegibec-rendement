import { useEffect, useState } from "react";
import { DateContext } from "./DateContext";

export const DateProvider = ({ children }: { children: React.ReactNode }) => {
    const [yearSelected, setYearSelected] = useState("2024");
    const [monthSelected, setMonthSelected] = useState<string | undefined>();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (!monthSelected) {
            setStartDate(`${yearSelected}-01-01`);
            setEndDate(`${yearSelected}-12-31`);
        } else {
            const month = monthSelected.padStart(2, "0");
            setStartDate(`${yearSelected}-${month}-01`);
            const lastDay = new Date(Number(yearSelected), Number(month), 0).getDate();
            setEndDate(`${yearSelected}-${month}-${lastDay}`);
        }
    }, [yearSelected, monthSelected]);

    return (
        <DateContext.Provider
            value={{
                yearSelected,
                setYearSelected,
                monthSelected,
                setMonthSelected,
                startDate,
                setStartDate,
                endDate,
                setEndDate,
            }}
        >
            {children}
        </DateContext.Provider>
    );
};
