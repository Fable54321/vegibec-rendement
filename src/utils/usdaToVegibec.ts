const normalize = (v?: string) =>
  v && v !== "N/A" ? v.toUpperCase().trim() : "";

export function usdaToVegibec(row: {
  commodity: string;
  var?: string;
  properties?: string;
}): string | null {
  const commodity = row.commodity.toUpperCase();
  const variant = normalize(row.var);
  const props = normalize(row.properties);

  // 🥬 Brussels sprouts
  if (commodity === "BRUSSELS SPROUTS") {
    return "CHOU DE BRUXELLES";
  }

  // 🥬 Cabbage
  if (commodity === "CABBAGE") {
    if (variant === "ROUND GREEN TYPE") return "CHOU VERT";
    if (variant === "RED TYPE") return "CHOU ROUGE";
  }

  // 🥦 Cauliflower
  if (commodity === "CAULIFLOWER") {
    if (props === "WHITE") return "CHOU-FLEUR";
  }

  // 🌿 Celery
  if (commodity === "CELERY") {
    return "CÉLERI";
  }

  // 🥬 Lettuce
  if (commodity === "LETTUCE, GREEN LEAF") {
    return "LAITUE FRISÉE VERTE";
  }

  if (commodity === "LETTUCE, RED LEAF") {
    return "LAITUE FRISÉE ROUGE";
  }

  if (commodity === "LETTUCE, ICEBERG") {
    return "LAITUE POMMÉE";
  }

  if (commodity === "LETTUCE, ROMAINE") {
    if (variant === "HEARTS") return "CŒUR DE ROMAINE";
    return "LAITUE ROMAINE";
  }

  // 🫑 Peppers
  if (commodity === "PEPPERS, BELL TYPE") {
    if (props === "GREEN") return "POIVRON VERT";
    if (props === "ORANGE") return "POIVRON ORANGE";
    if (props === "YELLOW") return "POIVRON JAUNE";
    if (props === "RED") return "POIVRON ROUGE";
  }

  // 🎃 Squash
  if (commodity === "SQUASH, GREY") {
    return "ZUCCHINI LIBANAIS";
  }

  if (commodity === "SQUASH, YELLOW STRAIGHTNECK") {
    return "ZUCCHINI JAUNE";
  }

  if (commodity === "SQUASH, ZUCCHINI") {
    return "ZUCCHINI VERT";
  }

  return null;
}
