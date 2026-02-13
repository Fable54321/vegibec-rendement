export interface CostEntry {
  vegetable: string;
  total_cost: number;
}

export interface ProjectedRevenue {
  vegetable: string;
  generic_group?: string | null;
  revenue: number;
  year: number;
}

export interface VegetableRow {
  vegetable: string;
  generic_group: string | null;
  is_generic: boolean;
}

/**
 * Redistribute group costs among children based on effective revenue.
 */
const redistributeGroup = (
  adjusted: CostEntry[],
  groupName: string,
  children: string[],
  effectiveRevenues: Record<string, number>,
): CostEntry[] => {
  const validChildren = children.filter(
    (v) => effectiveRevenues[v] && effectiveRevenues[v] > 0,
  );

  if (!validChildren.length) return adjusted;

  const groupEntry = adjusted.find((v) => v.vegetable === groupName);
  const groupCost = groupEntry?.total_cost || 0;

  if (groupCost === 0) return adjusted;

  const totalRevenue = validChildren.reduce(
    (sum, v) => sum + effectiveRevenues[v],
    0,
  );

  validChildren.forEach((child) => {
    const share = effectiveRevenues[child] / totalRevenue;
    const costShare = groupCost * share;

    const idx = adjusted.findIndex((v) => v.vegetable === child);
    if (idx >= 0) {
      adjusted[idx].total_cost += costShare;
    } else {
      adjusted.push({ vegetable: child, total_cost: costShare });
    }
  });

  // Only remove the group if it's NOT "LAITUE ROMAINE"
  return adjusted.filter(
    (v) => v.vegetable !== groupName || groupName === "LAITUE ROMAINE",
  );
};

/**
 * Builds a dynamic groups map from projected revenues.
 */
const extractDynamicGroupsFromVegetables = (
  vegetables: VegetableRow[],
): Record<string, string[]> => {
  return vegetables.reduce(
    (acc, v) => {
      if (!v.generic_group) return acc;

      if (!acc[v.generic_group]) {
        acc[v.generic_group] = [];
      }

      acc[v.generic_group].push(v.vegetable);

      return acc;
    },
    {} as Record<string, string[]>,
  );
};

/**
 * Redistribute costs for both hardcoded and dynamic groups.
 */
export const genericCostsRedistribution = (
  data: CostEntry[],
  effectiveRevenues: Record<string, number>,
  vegetables: VegetableRow[],
): CostEntry[] => {
  let adjusted: CostEntry[] = [...data];

  // --- 1️⃣ Hardcoded groups (existing logic) ---
  const hardcodedGroups: Record<string, string[]> = {
    CHOU: ["CHOU VERT", "CHOU PLAT", "CHOU ROUGE", "CHOU DE SAVOIE"],
    POIVRON: [
      "POIVRON VERT",
      "POIVRON ROUGE",
      "POIVRON JAUNE",
      "POIVRON ORANGE",
      "POIVRON VERT/ROUGE",
    ],
    ZUCCHINI: ["ZUCCHINI VERT", "ZUCCHINI JAUNE", "ZUCCHINI LIBANAIS"],
    LAITUE: [
      "LAITUE POMMÉE",
      "LAITUE FRISÉE VERTE",
      "LAITUE FRISÉE ROUGE",
      "LAITUE ROMAINE",
      "CŒUR DE ROMAINE",
    ],
  };

  for (const [group, children] of Object.entries(hardcodedGroups)) {
    adjusted = redistributeGroup(adjusted, group, children, effectiveRevenues);
  }

  // --- 2️⃣ Nested hardcoded groups (if needed) ---
  const nestedGroups: Record<string, string[]> = {
    "LAITUE FRISÉE": ["LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"],
  };

  for (const [group, children] of Object.entries(nestedGroups)) {
    adjusted = redistributeGroup(adjusted, group, children, effectiveRevenues);
  }

  // --- 3️⃣ Dynamic groups from projected revenues ---
  const dynamicGroups = extractDynamicGroupsFromVegetables(vegetables);

  for (const [group, children] of Object.entries(dynamicGroups)) {
    adjusted = redistributeGroup(adjusted, group, children, effectiveRevenues);
  }

  // --- Final pooling of LAITUE ROMAINE + CŒUR DE ROMAINE ---
  const lrIndex = adjusted.findIndex((v) => v.vegetable === "LAITUE ROMAINE");

  const crIndex = adjusted.findIndex((v) => v.vegetable === "CŒUR DE ROMAINE");

  if (lrIndex >= 0 && crIndex >= 0) {
    const combined =
      adjusted[lrIndex].total_cost + adjusted[crIndex].total_cost;

    const lrRevenue = effectiveRevenues["LAITUE ROMAINE"] || 0;
    const crRevenue = effectiveRevenues["CŒUR DE ROMAINE"] || 0;

    const totalRevenue = lrRevenue + crRevenue;

    if (totalRevenue > 0) {
      adjusted[lrIndex].total_cost = combined * (lrRevenue / totalRevenue);

      adjusted[crIndex].total_cost = combined * (crRevenue / totalRevenue);
    }
  }

  return adjusted;
};
