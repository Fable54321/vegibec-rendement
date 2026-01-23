import { describe, it, expect } from "vitest";
import { buildEffectiveRevenues } from "../utils/buildEffectiveRevenues";

describe("buildEffectiveRevenues", () => {
  it("uses real revenues when available for selected year", () => {
    const real = [{ vegetable: "CARROT", revenue: 100 }];
    const projected = [{ vegetable: "CARROT", revenue: 200, year: 2025 }];

    const result = buildEffectiveRevenues(real, projected, 2024);

    expect(result).toEqual([{ vegetable: "CARROT", revenue: 100 }]);
  });

  it("falls back to projected revenues when real data is missing", () => {
    const real: { vegetable: string; revenue: number }[] = [];
    const projected = [{ vegetable: "CARROT", revenue: 200, year: 2025 }];

    const result = buildEffectiveRevenues(real, projected, 2025);

    expect(result).toEqual([{ vegetable: "CARROT", revenue: 200 }]);
  });

  it("does not include projected revenues from other years", () => {
    const real: { vegetable: string; revenue: number }[] = [];
    const projected = [{ vegetable: "CARROT", revenue: 200, year: 2024 }];

    const result = buildEffectiveRevenues(real, projected, 2025);

    expect(result).toEqual([]);
  });
});
