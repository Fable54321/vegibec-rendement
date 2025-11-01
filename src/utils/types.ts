export const VEGETABLE_NAMES = [
  "CÉLERI",
  "CHOU DE BRUXELLES",
  "CHOU-FLEUR",
  "CHOU VERT",
  "CHOU ROUGE",
  "CHOU PLAT",
  "CHOU DE SAVOIE",
  "CŒUR DE ROMAINE",
  "LAITUE FRISÉE VERTE",
  "LAITUE FRISÉE ROUGE",
  "LAITUE ROMAINE",
  "LAITUE POMMÉE",
  "POIVRON VERT",
  "POIVRON ROUGE",
  "POIVRON JAUNE",
  "POIVRON ORANGE",
  "POIVRON VERT/ROUGE",
  "ZUCCHINI VERT",
  "ZUCCHINI JAUNE",
  "ZUCCHINI LIBANAIS",
] as const;

export type VegetableName = (typeof VEGETABLE_NAMES)[number];
export type VegetableCosts = Record<VegetableName, number>;
