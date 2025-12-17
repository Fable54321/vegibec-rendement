export interface UnspecifiedCost {
  vegetable: string;
  total_cost: number;
}

export interface UnspecifiedContextType {
  data: UnspecifiedCost[];
  unspecifiedLoading: boolean;
  unspecifiedError: string | null;
  refreshData: () => Promise<void>;
}
