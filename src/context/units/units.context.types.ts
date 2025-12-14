export interface UnitsItem {
  vegetable: string;
  total_units: number;
  total_kg: number;
}

export interface UnitsContextType {
  totals: UnitsItem[];
  unitsLoading: boolean;
  unitsError: string | null;
  refreshTotals: (start?: string, end?: string) => Promise<void>;
}
