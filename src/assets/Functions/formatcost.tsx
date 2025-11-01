import React from "react";

type FormatCostProps = {
  cost: number | string;
  className?: string;
  integerClassName?: string;
  decimalClassName?: string;
  currencyClassName?: string;
};

const FormatCost: React.FC<FormatCostProps> = ({
  cost,
  className,

  currencyClassName,
}) => {
  const num = typeof cost === "number" ? cost : Number(cost);
  if (!isFinite(num)) return <span className={className}>—</span>;

  const nf = new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  });

  const parts = nf.formatToParts(num);

  let integer = "";
  let fraction = "";
  let decimalSeparator = "";
  let currency = "";
  let sign = "";

  parts.forEach((p) => {
    switch (p.type) {
      case "minusSign":
        sign += p.value;
        break;
      case "integer":
        integer += p.value;
        break;
      case "group":
        // group contains the non-breaking space (\u00A0) for fr-CA
        integer += p.value;
        break;
      case "decimal":
        decimalSeparator = p.value;
        break;
      case "fraction":
        fraction += p.value;
        break;
      case "currency":
        currency += p.value;
        break;
      default:
        break;
    }
  });

  const nbsp = "\u00A0"; // explicit NBSP between number and currency symbol

  return (
    <span className="font-bold">
      <span className="text-[1.1rem]">
        {sign}
        {integer}
      </span>
      <span className="text-[0.9rem]">
        {decimalSeparator}
        {fraction}
      </span>
      <span className={currencyClassName}>
        {nbsp}
        {currency}
      </span>
    </span>
  );
};

export default FormatCost;
