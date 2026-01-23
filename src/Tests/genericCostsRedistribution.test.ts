import { genericCostsRedistribution } from "../utils/genericCostsRedistribution";
import { describe, expect, it, test } from "vitest";

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

describe("genericCostsRedistribution (updated)", () => {
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

    const projected: ProjectedRevenue[] = [];

    const result = genericCostsRedistribution(data, revenues, projected);

    const vert = result.find((v) => v.vegetable === "CHOU VERT")!;
    const rouge = result.find((v) => v.vegetable === "CHOU ROUGE")!;
    const group = result.find((v) => v.vegetable === "CHOU");

    expect(vert.total_cost).toBeCloseTo(75);
    expect(rouge.total_cost).toBeCloseTo(25);
    expect(group).toBeUndefined();
  });

  test("does nothing if no child has revenue or projected revenue", () => {
    const data: CostEntry[] = [{ vegetable: "ZUCCHINI", total_cost: 80 }];
    const revenues = {};
    const projected: ProjectedRevenue[] = [];

    const result = genericCostsRedistribution(data, revenues, projected);

    expect(result).toEqual(data);
  });

  test("redistributes dynamic generic group from projectedRevenues", () => {
    const data: CostEntry[] = [{ vegetable: "TOMATE", total_cost: 120 }];
    const revenues = {
      "TOMATE CERISE": 0, // No real revenue
      "TOMATE RONDE": 0,
    };
    const projected: ProjectedRevenue[] = [
      {
        vegetable: "TOMATE CERISE",
        revenue: 50,
        generic_group: "TOMATE",
        year: 2025,
      },
      {
        vegetable: "TOMATE RONDE",
        revenue: 50,
        generic_group: "TOMATE",
        year: 2025,
      },
    ];

    const result = genericCostsRedistribution(data, revenues, projected);

    const cerise = result.find((v) => v.vegetable === "TOMATE CERISE")!;
    const ronde = result.find((v) => v.vegetable === "TOMATE RONDE")!;
    const group = result.find((v) => v.vegetable === "TOMATE");

    expect(cerise.total_cost).toBeCloseTo(60); // 50% of 120
    expect(ronde.total_cost).toBeCloseTo(60);
    expect(group).toBeUndefined();
  });

  test("uses real revenues first before projected revenues", () => {
    const data: CostEntry[] = [{ vegetable: "POTIRON", total_cost: 200 }];
    const revenues = { "POTIRON ORANGE": 80, "POTIRON VERT": 20 };
    const projected: ProjectedRevenue[] = [
      {
        vegetable: "POTIRON ORANGE",
        revenue: 50,
        generic_group: "POTIRON",
        year: 2025,
      },
      {
        vegetable: "POTIRON VERT",
        revenue: 50,
        generic_group: "POTIRON",
        year: 2025,
      },
    ];

    const result = genericCostsRedistribution(data, revenues, projected);

    const orange = result.find((v) => v.vegetable === "POTIRON ORANGE")!;
    const vert = result.find((v) => v.vegetable === "POTIRON VERT")!;

    expect(orange.total_cost).toBeCloseTo(160); // 80% of 200
    expect(vert.total_cost).toBeCloseTo(40); // 20% of 200
  });

  test("preserves total cost for hardcoded LAITUE FRISÉE redistribution", () => {
    const data: CostEntry[] = [{ vegetable: "LAITUE FRISÉE", total_cost: 90 }];
    const revenues = {
      "LAITUE FRISÉE VERTE": 2,
      "LAITUE FRISÉE ROUGE": 1,
    };
    const projected: ProjectedRevenue[] = [];

    const result = genericCostsRedistribution(data, revenues, projected);

    const verte = result.find((v) => v.vegetable === "LAITUE FRISÉE VERTE")!;
    const rouge = result.find((v) => v.vegetable === "LAITUE FRISÉE ROUGE")!;
    const group = result.find((v) => v.vegetable === "LAITUE FRISÉE");

    expect(verte.total_cost).toBeCloseTo(60);
    expect(rouge.total_cost).toBeCloseTo(30);
    expect(group).toBeUndefined();
  });

  it("never returns NaN or Infinity", () => {
    const data: CostEntry[] = [{ vegetable: "LAITUE FRISÉE", total_cost: 100 }];
    const revenues = {
      "LAITUE FRISÉE VERTE": 0,
      "LAITUE FRISÉE ROUGE": 0,
    };
    const projected: ProjectedRevenue[] = [];

    const result = genericCostsRedistribution(data, revenues, projected);

    result.forEach((v) => {
      expect(Number.isFinite(v.total_cost)).toBe(true);
    });
  });

  it("is idempotent", () => {
    const data: CostEntry[] = [{ vegetable: "CHOU", total_cost: 100 }];
    const revenues = {
      "CHOU VERT": 2,
      "CHOU ROUGE": 1,
    };
    const projected: ProjectedRevenue[] = [];

    const once = genericCostsRedistribution(data, revenues, projected);
    const twice = genericCostsRedistribution(once, revenues, projected);

    expect(twice).toEqual(once);
  });
});

describe("genericCostsRedistribution - dynamic groups", () => {
  it("redistributes group cost among children from effectiveRevenues", () => {
    const data: CostEntry[] = [
      { vegetable: "TOMATE", total_cost: 120 }, // group
    ];

    const effectiveRevenues: Record<string, number> = {
      "TOMATE CERISE": 50,
      "TOMATE RONDE": 50,
    };

    const projectedRevenues: ProjectedRevenue[] = [
      {
        vegetable: "TOMATE CERISE",
        revenue: 50,
        generic_group: "TOMATE",
        year: 2025,
      },
      {
        vegetable: "TOMATE RONDE",
        revenue: 50,
        generic_group: "TOMATE",
        year: 2025,
      },
    ];

    const result = genericCostsRedistribution(
      data,
      effectiveRevenues,
      projectedRevenues,
    );

    const cerise = result.find((v) => v.vegetable === "TOMATE CERISE")!;
    const ronde = result.find((v) => v.vegetable === "TOMATE RONDE")!;
    const group = result.find((v) => v.vegetable === "TOMATE");

    expect(group).toBeUndefined();
    expect(cerise.total_cost).toBeCloseTo(60); // 50% of 120
    expect(ronde.total_cost).toBeCloseTo(60);
  });
});
