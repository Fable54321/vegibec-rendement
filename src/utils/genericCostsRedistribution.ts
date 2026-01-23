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

  // Remove generic group after redistribution
  return adjusted.filter((v) => v.vegetable !== groupName);
};

/**
 * Builds a dynamic groups map from projected revenues.
 */
const extractDynamicGroups = (
  projectedRevenues: ProjectedRevenue[],
): Record<string, string[]> => {
  return projectedRevenues.reduce(
    (acc, r) => {
      if (!r.generic_group) return acc;

      if (!acc[r.generic_group]) acc[r.generic_group] = [];
      acc[r.generic_group].push(r.vegetable);
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
  projectedRevenues: ProjectedRevenue[],
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
    "LAITUE ROMAINE": ["LAITUE ROMAINE", "CŒUR DE ROMAINE"],
    "LAITUE FRISÉE": ["LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"],
  };

  for (const [group, children] of Object.entries(nestedGroups)) {
    adjusted = redistributeGroup(adjusted, group, children, effectiveRevenues);
  }

  // --- 3️⃣ Dynamic groups from projected revenues ---
  const dynamicGroups = extractDynamicGroups(projectedRevenues);
  for (const [group, children] of Object.entries(dynamicGroups)) {
    adjusted = redistributeGroup(adjusted, group, children, effectiveRevenues);
  }

  return adjusted;
};
