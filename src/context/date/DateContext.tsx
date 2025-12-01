import { createContext, useContext } from "react";
import type { DateContextType } from "./dateContext.types";

export const DateContext = createContext<DateContextType | undefined>(undefined);

export const useDate = () => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error("useDate must be used inside a DateProvider");
    }
    return context;
};
