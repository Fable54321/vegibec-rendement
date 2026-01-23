type ProjectedRevenue = {
  vegetable: string;
  generic_group?: string;
  year: number;
  projected_revenue: number;
};

export const getRevenueGroup = (r: ProjectedRevenue) =>
  r.generic_group ?? r.vegetable;
