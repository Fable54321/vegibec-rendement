export interface CostEntry {
  vegetable: string;
  total_cost: number;
}

export const genericCostsRedistribution = (
  data: CostEntry[],
  revenues: Record<string, number>
): CostEntry[] => {
  let adjusted: CostEntry[] = [...data];

  const redistributeGroup = (groupName: string, children: string[]) => {
    const validChildren = children.filter(
      (v) => revenues[v] && revenues[v] > 0
    );

    if (!validChildren.length) return;

    const groupEntry = adjusted.find((v) => v.vegetable === groupName);
    const groupCost = groupEntry?.total_cost || 0;

    const totalRevenue = validChildren.reduce(
      (sum, v) => sum + (revenues[v] || 0),
      0
    );

    validChildren.forEach((child) => {
      const idx = adjusted.findIndex((v) => v.vegetable === child);
      const revenueShare = (revenues[child] || 0) / totalRevenue;
      const childCost = groupCost * revenueShare;

      if (idx >= 0) {
        adjusted[idx].total_cost += childCost;
      } else {
        adjusted.push({ vegetable: child, total_cost: childCost });
      }
    });

    adjusted = adjusted.filter((v) => v.vegetable !== groupName);
  };

  // Step 1: Top-level redistribution
  redistributeGroup("CHOU", [
    "CHOU VERT",
    "CHOU PLAT",
    "CHOU ROUGE",
    "CHOU DE SAVOIE",
  ]);
  redistributeGroup("POIVRON", [
    "POIVRON VERT",
    "POIVRON ROUGE",
    "POIVRON JAUNE",
    "POIVRON ORANGE",
    "POIVRON VERT/ROUGE",
  ]);
  redistributeGroup("ZUCCHINI", [
    "ZUCCHINI VERT",
    "ZUCCHINI JAUNE",
    "ZUCCHINI LIBANAIS",
  ]);
  redistributeGroup("LAITUE", [
    "LAITUE POMMÉE",
    "LAITUE FRISÉE VERTE",
    "LAITUE FRISÉE ROUGE",
    "LAITUE ROMAINE",
    "CŒUR DE ROMAINE",
  ]);

  // Step 2: Nested redistribution for LAITUE ROMAINE group
  const romaineChildren = ["LAITUE ROMAINE", "CŒUR DE ROMAINE"];
  const romaineTotal = romaineChildren.reduce(
    (sum, v) =>
      sum + (adjusted.find((e) => e.vegetable === v)?.total_cost || 0),
    0
  );

  const romaineRevenueTotal = romaineChildren.reduce(
    (sum, v) => sum + (revenues[v] || 0),
    0
  );

  if (romaineRevenueTotal > 0) {
    romaineChildren.forEach((child) => {
      const idx = adjusted.findIndex((v) => v.vegetable === child);
      const share = (revenues[child] || 0) / romaineRevenueTotal;
      if (idx >= 0) {
        adjusted[idx].total_cost = romaineTotal * share;
      } else {
        adjusted.push({ vegetable: child, total_cost: romaineTotal * share });
      }
    });
  }

  const friseeCost =
    adjusted.find((v) => v.vegetable === "LAITUE FRISÉE")?.total_cost || 0;
  if (friseeCost > 0) {
    const friseeChildren = ["LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"];
    const totalFriseeRevenue = friseeChildren.reduce(
      (sum, v) => sum + (revenues[v] || 0),
      0
    );

    if (totalFriseeRevenue === 0) return adjusted;

    friseeChildren.forEach((child) => {
      const idx = adjusted.findIndex((v) => v.vegetable === child);
      const share = (revenues[child] || 0) / totalFriseeRevenue;
      const costShare = friseeCost * share;
      if (idx >= 0) adjusted[idx].total_cost += costShare;
      else adjusted.push({ vegetable: child, total_cost: costShare });
    });

    // Remove generic LAITUE FRISÉE
    adjusted = adjusted.filter((v) => v.vegetable !== "LAITUE FRISÉE");
  }

  return adjusted;
};
