interface Revenue {
  vegetable: string;
  revenue: number;
}

interface ProjectedRevenue {
  vegetable: string;
  revenue: number;
  year: number;
}

export const buildEffectiveRevenues = (
  existingRevenues: Revenue[],
  projectedRevenues: ProjectedRevenue[],
  yearSelected: number
): Revenue[] => {
  const revenueMap = new Map<string, number>();

  // 1️⃣ Load existing revenues (already year-filtered upstream)
  for (const rev of existingRevenues) {
    revenueMap.set(rev.vegetable, rev.revenue);
  }

  // 2️⃣ Inject projected revenues for the selected year
  for (const projected of projectedRevenues) {
    if (projected.year !== yearSelected) continue;

    // Only add if missing from existing revenues
    if (!revenueMap.has(projected.vegetable)) {
      revenueMap.set(projected.vegetable, projected.revenue);
    }
  }

  // 3️⃣ Return normalized list
  return Array.from(revenueMap.entries()).map(([vegetable, revenue]) => ({
    vegetable,
    revenue,
  }));
};
