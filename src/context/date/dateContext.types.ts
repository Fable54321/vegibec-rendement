export interface DateContextType {
  yearSelected: string;
  setYearSelected: (year: string) => void;

  monthSelected?: string;
  setMonthSelected: (month?: string) => void;

  startDate: string;
  setStartDate: (date: string) => void;

  endDate: string;
  setEndDate: (date: string) => void;
}
