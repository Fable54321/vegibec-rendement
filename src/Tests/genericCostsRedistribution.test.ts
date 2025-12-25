import { genericCostsRedistribution } from "../utils/genericCostsRedistribution";
import { describe, expect, test, it } from "vitest";

type CostEntry = {
  vegetable: string;
  total_cost: number;
};

describe("genericCostsRedistribution", () => {
  test("redistributes CHOU cost proportionally and removes group", () => {
    const data: CostEntry[] = [
      { vegetable: "CHOU", total_cost: 100 },
      { vegetable: "CHOU VERT", total_cost: 0 },
      { vegetable: "CHOU ROUGE", total_cost: 0 },
    ];

    const revenues = {
      "CHOU VERT": 300,
      "CHOU ROUGE": 100,
    };

    const result = genericCostsRedistribution(data, revenues);

    const vert = result.find((v) => v.vegetable === "CHOU VERT")!;
    const rouge = result.find((v) => v.vegetable === "CHOU ROUGE")!;
    const group = result.find((v) => v.vegetable === "CHOU");

    expect(vert.total_cost).toBeCloseTo(75);
    expect(rouge.total_cost).toBeCloseTo(25);
    expect(group).toBeUndefined();
  });

  test("does nothing if no child has revenue", () => {
    const data: CostEntry[] = [{ vegetable: "ZUCCHINI", total_cost: 80 }];

    const revenues = {};

    const result = genericCostsRedistribution(data, revenues);

    expect(result).toEqual(data);
  });

  test("redistributes LAITUE into its children", () => {
    const data: CostEntry[] = [{ vegetable: "LAITUE", total_cost: 200 }];

    const revenues = {
      "LAITUE ROMAINE": 50,
      "CŒUR DE ROMAINE": 50,
      "LAITUE FRISÉE VERTE": 100,
    };

    const result = genericCostsRedistribution(data, revenues);

    const romaine = result.find((v) => v.vegetable === "LAITUE ROMAINE")!;
    const coeur = result.find((v) => v.vegetable === "CŒUR DE ROMAINE")!;
    const frisee = result.find((v) => v.vegetable === "LAITUE FRISÉE VERTE")!;

    expect(romaine.total_cost).toBeCloseTo(50);
    expect(coeur.total_cost).toBeCloseTo(50);
    expect(frisee.total_cost).toBeCloseTo(100);
  });

  test("rebalances LAITUE ROMAINE and CŒUR DE ROMAINE based on revenue", () => {
    const data: CostEntry[] = [
      { vegetable: "LAITUE ROMAINE", total_cost: 120 },
      { vegetable: "CŒUR DE ROMAINE", total_cost: 80 },
    ];

    const revenues = {
      "LAITUE ROMAINE": 75,
      "CŒUR DE ROMAINE": 25,
    };

    const result = genericCostsRedistribution(data, revenues);

    const romaine = result.find((v) => v.vegetable === "LAITUE ROMAINE")!;
    const coeur = result.find((v) => v.vegetable === "CŒUR DE ROMAINE")!;

    expect(romaine.total_cost).toBeCloseTo(150);
    expect(coeur.total_cost).toBeCloseTo(50);
  });

  test("redistributes LAITUE FRISÉE into VERTE and ROUGE and removes group", () => {
    const data: CostEntry[] = [{ vegetable: "LAITUE FRISÉE", total_cost: 90 }];

    const revenues = {
      "LAITUE FRISÉE VERTE": 2,
      "LAITUE FRISÉE ROUGE": 1,
    };

    const result = genericCostsRedistribution(data, revenues);

    const verte = result.find((v) => v.vegetable === "LAITUE FRISÉE VERTE")!;
    const rouge = result.find((v) => v.vegetable === "LAITUE FRISÉE ROUGE")!;
    const group = result.find((v) => v.vegetable === "LAITUE FRISÉE");

    expect(verte.total_cost).toBeCloseTo(60);
    expect(rouge.total_cost).toBeCloseTo(30);
    expect(group).toBeUndefined();
  });

  test("does not create NaN when frisée revenue is zero", () => {
    const data: CostEntry[] = [{ vegetable: "LAITUE FRISÉE", total_cost: 50 }];

    const revenues = {
      "LAITUE FRISÉE VERTE": 0,
      "LAITUE FRISÉE ROUGE": 0,
    };

    const result = genericCostsRedistribution(data, revenues);

    expect(
      result.find((v) => v.vegetable === "LAITUE FRISÉE")?.total_cost
    ).toBe(50);
  });
});

it("preserves total cost", () => {
  const data = [
    { vegetable: "CHOU", total_cost: 100 },
    { vegetable: "ZUCCHINI", total_cost: 50 },
  ];

  const revenues = {
    "CHOU VERT": 1,
    "CHOU ROUGE": 1,
  };

  const result = genericCostsRedistribution(data, revenues);

  const inputTotal = data.reduce((s, v) => s + v.total_cost, 0);
  const outputTotal = result.reduce((s, v) => s + v.total_cost, 0);

  expect(outputTotal).toBeCloseTo(inputTotal);
});

it("never returns NaN or Infinity", () => {
  const data = [{ vegetable: "LAITUE FRISÉE", total_cost: 100 }];

  const revenues = {
    "LAITUE FRISÉE VERTE": 0,
    "LAITUE FRISÉE ROUGE": 0,
  };

  const result = genericCostsRedistribution(data, revenues);

  result.forEach((v) => {
    expect(Number.isFinite(v.total_cost)).toBe(true);
  });
});

it("is idempotent", () => {
  const data = [{ vegetable: "CHOU", total_cost: 100 }];

  const revenues = {
    "CHOU VERT": 2,
    "CHOU ROUGE": 1,
  };

  const once = genericCostsRedistribution(data, revenues);
  const twice = genericCostsRedistribution(once, revenues);

  expect(twice).toEqual(once);
});
