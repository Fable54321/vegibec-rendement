import { Outlet } from "react-router-dom";
import { useEffect, useState, useMemo, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import type { VegetableCosts } from "@/utils/types";
import { useDate } from "@/context/date/DateContext";
import { UnitsContext } from "@/context/units/UnitsContext";
import { UnspecifiedContext } from "@/context/unspecified/UnspecifiedContext";
import { genericCostsRedistribution } from "../../utils/genericCostsRedistribution";


export type RevenuePercentage = Record<string, number>;

type SeedCostItem = { seed: string; total_cost: number } | { vegetable: string; total_cost: number };

export type AppOutletContext = {
  revenues: { vegetable: string; total_revenue: number }[];
  percentages: RevenuePercentage;
  vegetableCosts: { vegetable: string; total_cost: number }[];
  adjustedVegetableCosts: { vegetable: string; total_cost: number }[];
  noCultureCosts: number;
  otherCostsTotal: number;
  totalCostsToRedistribute: number;
  seedCosts: SeedCostItem[];
  mainLoading: boolean;
  mainError: string | null;
  otherCosts: [string, number][];
  vegetableTotalCosts: VegetableCosts;
  yearSelected: string;
  setYearSelected: (year: string) => void;
  monthSelected?: string;
  setMonthSelected: (month: string | undefined) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  packagingCosts: { vegetable: string; total_cost: number }[];
  adjustedPackagingCosts: { vegetable: string; total_cost: number }[];
  vegetableSoilProducts: { vegetable: string; total_cost: number }[];
  categorySoilProducts: { category: string; total_cost: number }[];
  soilGroupBy: "vegetable" | "category";
  setSoilGroupBy: (groupBy: "vegetable" | "category") => void;
  adjustedSoilProducts: { vegetable: string; total_cost: number }[];
  revenuesSelectedYear: string;
  setRevenuesSelectedYear: (year: string) => void;
  adjustedUnspecifiedCosts: { vegetable: string; total_cost: number }[];
};

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

function App() {
  const { token, login, logout, loading } = useAuth();

  type SoilProductCost =
    | { vegetable: string; total_cost: number }
    | { category: string; total_cost: number };

  // --- AUTO-REFRESH ACCESS TOKEN ---
  useEffect(() => {
    if (!token) return;

    const scheduleRefresh = () => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const timeout = expiresAt - now - 5000;

        if (timeout <= 0) {
          refreshToken();
        } else {
          const timer = setTimeout(refreshToken, timeout);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Failed to parse token for refresh:", err);
      }
    };

    const refreshToken = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to refresh token");
        const data = await res.json();
        login(data.token);
      } catch (err) {
        console.error("Refresh token failed:", err);
        logout();
      }
    };

    const cleanup = scheduleRefresh();
    return cleanup;
  }, [token, login, logout]);

  // --- Filters ---
  const { yearSelected, setYearSelected, monthSelected, setMonthSelected, startDate, setStartDate, endDate, setEndDate } = useDate();



  const [soilGroupBy, setSoilGroupBy] = useState<"vegetable" | "category">("vegetable");

  // --- Data ---
  const [revenues, setRevenues] = useState<{ vegetable: string; total_revenue: number }[]>([]);
  const [revenuesSelectedYear, setRevenuesSelectedYear] = useState("2024");


  const [percentages, setPercentages] = useState<RevenuePercentage>({});
  const [vegetableCosts, setVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [noCultureCosts, setNoCultureCosts] = useState(0);
  const [otherCostsTotal, setOtherCostsTotal] = useState(0);
  const [totalCostsToRedistribute, setTotalCostsToRedistribute] = useState(0);
  const [otherCosts, setOtherCosts] = useState<[string, number][]>([]);
  const [seedCosts, setSeedCosts] = useState<SeedCostItem[]>([]);
  const [packagingCosts, setPackagingCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [vegetableSoilProducts, setVegetableSoilProducts] = useState<SoilProductCost[]>([]);
  const [categorySoilProducts, setCategorySoilProducts] = useState<SoilProductCost[]>([]);
  const [aucuneSoilCost, setAucuneSoilCost] = useState(0);
  // 🌟 NEW STATE FOR ADJUSTED PACKAGING COSTS 🌟
  const [adjustedPackagingCosts, setAdjustedPackagingCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [adjustedSoilProducts, setAdjustedSoilProducts] = useState<{ vegetable: string; total_cost: number }[]>([]);

  const [errorPackagingCosts, setErrorPackagingCosts] = useState<string | null>(null);

  // --- Loading / errors ---
  const [loadingRevenues, setLoadingRevenues] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [loadingOtherCosts, setLoadingOtherCosts] = useState(false);
  const [loadingSeedCosts, setLoadingSeedCosts] = useState(false);
  const [loadingPackagingCosts, setLoadingPackagingCosts] = useState(false);
  const [loadingSoilProducts, setLoadingSoilProducts] = useState(false);
  const [errorRevenues, setErrorRevenues] = useState<string | null>(null);
  const [errorCosts, setErrorCosts] = useState<string | null>(null);
  const [errorOtherCosts, setErrorOtherCosts] = useState<string | null>(null);
  const [errorSeedCosts, setErrorSeedCosts] = useState<string | null>(null);
  const [errorSoilProducts, setErrorSoilProducts] = useState<string | null>(null);
  const { unitsError, unitsLoading } = useContext(UnitsContext);

  //Unspecified Context


  type UnspecifiedCost = {
    vegetable: string;
    total_cost: number;
  };


  const [adjustedUnspecifiedCosts, setAdjustedUnspecifiedCosts] = useState<UnspecifiedCost[]>([]);

  const { unspecifiedError, unspecifiedLoading, data } = useContext(UnspecifiedContext);


  const [adjustedVegetableCosts, setAdjustedVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);



  const mainLoading = loadingRevenues || loadingCosts || loadingOtherCosts || loadingSeedCosts || loadingPackagingCosts || loadingSoilProducts || unitsLoading || unspecifiedLoading;
  const mainError = errorRevenues || errorCosts || errorOtherCosts || errorSeedCosts || errorPackagingCosts || errorSoilProducts || unitsError || unspecifiedError;

  // --- Derived query period ---
  const periodQuery = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, "0");

    if (startDate && endDate) return `start=${startDate}&end=${endDate}`;

    if (monthSelected) {
      const monthNum = Number(monthSelected);
      const yearNum = Number(yearSelected);
      const firstDay = `${yearNum}-${pad(monthNum)}-01`;
      const lastDayDate = new Date(yearNum, monthNum, 0);
      const lastDay = `${yearNum}-${pad(monthNum)}-${pad(lastDayDate.getDate())}`;
      return `start=${firstDay}&end=${lastDay}`;
    }

    return `start=${yearSelected}-01-01&end=${yearSelected}-12-31`;
  }, [startDate, endDate, monthSelected, yearSelected]);

  // --- Vegetable total costs (final) ---
  const [vegetableTotalCosts, setVegetableTotalCosts] = useState<Record<string, number>>({});




  interface CostEntry {
    vegetable: string;
    total_cost: number;
  }

  // const genericCostsRedistribution = (
  //   data: CostEntry[],
  //   revenues: Record<string, number>
  // ): CostEntry[] => {
  //   let adjusted: CostEntry[] = [...data];

  //   const redistributeGroup = (groupName: string, children: string[]) => {
  //     const validChildren = children.filter((v) => revenues[v] && revenues[v] > 0);

  //     if (!validChildren.length) return;

  //     const groupEntry = adjusted.find((v) => v.vegetable === groupName);
  //     const groupCost = groupEntry?.total_cost || 0;

  //     const totalRevenue = validChildren.reduce(
  //       (sum, v) => sum + (revenues[v] || 0),
  //       0
  //     );

  //     validChildren.forEach((child) => {
  //       const idx = adjusted.findIndex((v) => v.vegetable === child);
  //       const revenueShare = (revenues[child] || 0) / totalRevenue;
  //       const childCost = groupCost * revenueShare;

  //       if (idx >= 0) {
  //         adjusted[idx].total_cost += childCost;
  //       } else {
  //         adjusted.push({ vegetable: child, total_cost: childCost });
  //       }
  //     });

  //     adjusted = adjusted.filter((v) => v.vegetable !== groupName);
  //   };

  //   // Step 1: Top-level redistribution
  //   redistributeGroup("CHOU", ["CHOU VERT", "CHOU PLAT", "CHOU ROUGE", "CHOU DE SAVOIE"]);
  //   redistributeGroup("POIVRON", ["POIVRON VERT", "POIVRON ROUGE", "POIVRON JAUNE", "POIVRON ORANGE", "POIVRON VERT/ROUGE"]);
  //   redistributeGroup("ZUCCHINI", ["ZUCCHINI VERT", "ZUCCHINI JAUNE", "ZUCCHINI LIBANAIS"]);
  //   redistributeGroup(
  //     "LAITUE",
  //     ["LAITUE POMMÉE", "LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE", "LAITUE ROMAINE", "CŒUR DE ROMAINE"]
  //   );

  //   // Step 2: Nested redistribution for LAITUE ROMAINE group
  //   const romaineChildren = ["LAITUE ROMAINE", "CŒUR DE ROMAINE"];
  //   const romaineTotal = romaineChildren.reduce(
  //     (sum, v) => sum + (adjusted.find((e) => e.vegetable === v)?.total_cost || 0),
  //     0
  //   );

  //   const romaineRevenueTotal = romaineChildren.reduce(
  //     (sum, v) => sum + (revenues[v] || 0),
  //     0
  //   );

  //   if (romaineRevenueTotal > 0) {
  //     romaineChildren.forEach((child) => {
  //       const idx = adjusted.findIndex((v) => v.vegetable === child);
  //       const share = (revenues[child] || 0) / romaineRevenueTotal;
  //       if (idx >= 0) {
  //         adjusted[idx].total_cost = romaineTotal * share;
  //       } else {
  //         adjusted.push({ vegetable: child, total_cost: romaineTotal * share });
  //       }
  //     });
  //   }

  //   const friseeCost = adjusted.find(v => v.vegetable === "LAITUE FRISÉE")?.total_cost || 0;
  //   if (friseeCost > 0) {
  //     const friseeChildren = ["LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"];
  //     const totalFriseeRevenue = friseeChildren.reduce((sum, v) => sum + (revenues[v] || 0), 0);

  //     friseeChildren.forEach((child) => {
  //       const idx = adjusted.findIndex((v) => v.vegetable === child);
  //       const share = (revenues[child] || 0) / totalFriseeRevenue;
  //       const costShare = friseeCost * share;
  //       if (idx >= 0) adjusted[idx].total_cost += costShare;
  //       else adjusted.push({ vegetable: child, total_cost: costShare });
  //     });

  //     // Remove generic LAITUE FRISÉE
  //     adjusted = adjusted.filter(v => v.vegetable !== "LAITUE FRISÉE");
  //   }

  //   return adjusted;
  // };






  useEffect(() => {
    const aucune = vegetableSoilProducts.find((item) => 'vegetable' in item && item.vegetable === "AUCUNE")?.total_cost || 0;
    setAucuneSoilCost(aucune);

  }, [vegetableSoilProducts]);

  // --- Fetch Revenues ---
  useEffect(() => {
    if (!token) return;

    const fetchRevenues = async () => {
      setLoadingRevenues(true);
      setErrorRevenues(null);

      try {
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/revenues/by-year?year_from=${revenuesSelectedYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )) as { vegetable: string; total_revenue: number }[];

        setRevenues(data);

        if (!data.length) {
          setPercentages({});
        } else {
          const total = data.reduce((sum, r) => sum + Number(r.total_revenue), 0);
          const pct: RevenuePercentage = {};
          data.forEach((item) => {
            pct[item.vegetable] = (Number(item.total_revenue) / total) * 100;
          });
          setPercentages(pct);
        }
      } catch (err) {
        setErrorRevenues((err as Error).message);
      } finally {
        setLoadingRevenues(false);
      }
    };

    fetchRevenues();
  }, [revenuesSelectedYear, token]);


  useEffect(() => {
    if (!token) return;

    const fetchPackagingCosts = async () => {
      setLoadingPackagingCosts(true);
      setErrorPackagingCosts(null);

      try {
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/data/packaging_costs/per_vegetable?${periodQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )) as { vegetable: string; total_cost: number }[];

        setPackagingCosts(data);
      } catch (err) {
        setErrorPackagingCosts((err as Error).message);
      } finally {
        setLoadingPackagingCosts(false);
      }
    };

    fetchPackagingCosts();
  }, [periodQuery, token]);

  // --- Fetch Vegetable Costs ---
  useEffect(() => {
    if (!token) return;

    const fetchCosts = async () => {
      setLoadingCosts(true);
      setErrorCosts(null);

      try {
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/data/costs/summary?groupBy=vegetable&${periodQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )) as { vegetable: string; total_cost: number }[];

        setVegetableCosts(data);
        if (!data.length) setNoCultureCosts(0);
        else setNoCultureCosts(data.find((i) => i.vegetable === "AUCUNE")?.total_cost || 0);
      } catch (err) {
        setErrorCosts((err as Error).message);
      } finally {
        setLoadingCosts(false);
      }
    };

    fetchCosts();
  }, [token, periodQuery]);


  useEffect(() => {
    if (!revenues.length) {
      setAdjustedVegetableCosts([]);
      return;
    }

    // 1️⃣ Full template of all vegetables
    const allVegetables = [
      "AUCUNE",
      "CHOU",
      "CHOU DE BRUXELLES",
      "CHOU-FLEUR",
      "CHOU VERT",
      "CHOU PLAT",
      "CHOU ROUGE",
      "CHOU DE SAVOIE",
      "CÉLERI",
      "CŒUR DE ROMAINE",
      "ENDIVES",
      "LAITUE",
      "LAITUE POMMÉE",
      "LAITUE FRISÉE",
      "LAITUE FRISÉE VERTE",
      "LAITUE FRISÉE ROUGE",
      "LAITUE ROMAINE",
      "POIVRON",
      "POIVRON VERT",
      "POIVRON ROUGE",
      "POIVRON JAUNE",
      "POIVRON ORANGE",
      "POIVRON VERT/ROUGE",
      "ZUCCHINI",
      "ZUCCHINI VERT",
      "ZUCCHINI JAUNE",
      "ZUCCHINI LIBANAIS",
    ];

    // 2️⃣ Initialize all vegetables with 0 cost
    let newAdjusted: { vegetable: string; total_cost: number }[] = allVegetables.map(
      (veg) => ({ vegetable: veg, total_cost: 0 })
    );

    // 3️⃣ Merge in fetched costs (default to 0)
    vegetableCosts.forEach((item) => {
      const idx = newAdjusted.findIndex((v) => v.vegetable === item.vegetable);
      if (idx >= 0) newAdjusted[idx].total_cost = Number(item.total_cost || 0);
    });

    // 4️⃣ Apply the generic redistribution
    newAdjusted = genericCostsRedistribution(newAdjusted,
      // Build a revenue map for faster lookup
      revenues.reduce<Record<string, number>>((acc, r) => {
        acc[r.vegetable] = Number(r.total_revenue || 0);
        return acc;
      }, {})
    );

    setAdjustedVegetableCosts(newAdjusted);


  }, [vegetableCosts, revenues, yearSelected, monthSelected, startDate, endDate]);




  // --- Fetch Other Costs ---
  useEffect(() => {
    if (!token) return;

    const fetchOtherCosts = async () => {
      setLoadingOtherCosts(true);
      setErrorOtherCosts(null);

      try {
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/data/costs/other_costs?${periodQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )) as { category: string; total_cost: number }[];

        const entries: [string, number][] = data.map((item) => [item.category, Number(item.total_cost)]);
        setOtherCosts(entries);
        setOtherCostsTotal(entries.reduce((sum, [, v]) => sum + v, 0));
      } catch (err) {
        setErrorOtherCosts((err as Error).message);
      } finally {
        setLoadingOtherCosts(false);
      }
    };

    fetchOtherCosts();
  }, [periodQuery, token]);

  // --- Fetch Seed Costs ---
  useEffect(() => {
    if (!token) return;

    const fetchSeedCosts = async () => {
      setLoadingSeedCosts(true);
      setErrorSeedCosts(null);

      try {
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/data/costs/seed_costs?${periodQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )) as { seed: string; total_cost: number }[];

        setSeedCosts(data);
      } catch (err) {
        setErrorSeedCosts((err as Error).message);
      } finally {
        setLoadingSeedCosts(false);
      }
    };

    fetchSeedCosts();
  }, [periodQuery, token]);





  // --- Compute total redistributable costs ---
  useEffect(() => {
    // Find the "AUCUNE" cost in the packagingCosts array
    const noPackagingCost = packagingCosts.find((item) => item.vegetable === "AUCUNE")?.total_cost || 0;

    const noCultureUnspecifiedCost = adjustedUnspecifiedCosts.find((item) => item.vegetable === "AUCUNE" || null)?.total_cost || 0;

    // Sum the costs: No Culture Costs + Other Costs Total + No Packaging Cost
    setTotalCostsToRedistribute(
      Number(noCultureCosts) + Number(otherCostsTotal) + Number(noPackagingCost) + Number(aucuneSoilCost) + Number(noCultureUnspecifiedCost)
    );
  }, [noCultureCosts, otherCostsTotal, packagingCosts, aucuneSoilCost, adjustedUnspecifiedCosts]);


  useEffect(() => {
    if (!packagingCosts.length) {
      setAdjustedPackagingCosts([]);
      return;
    }

    // 1️⃣ Full template of all vegetables
    const allVegetables = [
      "AUCUNE",
      "CHOU", "CHOU PLAT", "CHOU VERT", "CHOU ROUGE", "CHOU DE SAVOIE",
      "CHOU-FLEUR", "CHOU DE BRUXELLES",
      "CÉLERI",
      "CŒUR DE ROMAINE",
      "ENDIVES",
      "LAITUE", "LAITUE POMMÉE", "LAITUE FRISÉE", "LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE", "LAITUE ROMAINE",
      "POIVRON", "POIVRON VERT", "POIVRON ROUGE", "POIVRON JAUNE", "POIVRON ORANGE", "POIVRON VERT/ROUGE",
      "ZUCCHINI", "ZUCCHINI VERT", "ZUCCHINI JAUNE", "ZUCCHINI LIBANAIS"
    ];

    // 2️⃣ Initialize all vegetables with 0 cost
    let newAdjusted = allVegetables.map(v => ({ vegetable: v, total_cost: 0 }));

    // 3️⃣ Merge in fetched packaging costs
    packagingCosts.forEach(pc => {
      const idx = newAdjusted.findIndex(v => v.vegetable === pc.vegetable);
      if (idx >= 0) newAdjusted[idx].total_cost = Number(pc.total_cost || 0);
    });

    // 4️⃣ Build revenue map
    const revenueMap: Record<string, number> = revenues.reduce((acc, r) => {
      acc[r.vegetable] = Number(r.total_revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    // 5️⃣ Apply the generic redistribution
    newAdjusted = genericCostsRedistribution(newAdjusted, revenueMap);

    // 6️⃣ Set state
    setAdjustedPackagingCosts(newAdjusted);


  }, [packagingCosts, revenues]);



  useEffect(() => {
    if (!token) return;

    const fetchSoilProducts = async () => {
      setLoadingSoilProducts(true);
      setErrorSoilProducts(null);

      try {
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/data/costs/soil_products/vegetable?${periodQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )) as SoilProductCost[];

        setVegetableSoilProducts(data);
      } catch (err) {
        setErrorSoilProducts((err as Error).message);
      } finally {
        setLoadingSoilProducts(false);
      }
    };

    fetchSoilProducts();
  }, [periodQuery, token]);

  useEffect(() => {
    if (!token) return;

    const fetchCategorySoilProducts = async () => {

      setLoadingSoilProducts(true);
      setErrorSoilProducts(null);

      try {
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/data/costs/soil_products/category?${periodQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )) as SoilProductCost[];

        setCategorySoilProducts(data);
      } catch (err) {
        setErrorSoilProducts((err as Error).message);
      } finally {
        setLoadingSoilProducts(false);
      }
    };

    fetchCategorySoilProducts();
  }, [periodQuery, token])


  useEffect(() => {
    if (!vegetableSoilProducts.length) {
      setAdjustedSoilProducts([]);
      return;
    }

    // 1️⃣ Build revenue map
    const revenueMap: Record<string, number> = revenues.reduce((acc, r) => {
      acc[r.vegetable] = Number(r.total_revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    // 2️⃣ Full template of all vegetables
    const allVegetables = [
      "AUCUNE",
      "CHOU", "CHOU PLAT", "CHOU VERT", "CHOU ROUGE", "CHOU DE SAVOIE",
      "CHOU-FLEUR", "CHOU DE BRUXELLES",
      "CÉLERI",
      "CŒUR DE ROMAINE",
      "ENDIVES",
      "LAITUE", "LAITUE POMMÉE", "LAITUE FRISÉE", "LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE", "LAITUE ROMAINE",
      "POIVRON", "POIVRON VERT", "POIVRON ROUGE", "POIVRON JAUNE", "POIVRON ORANGE", "POIVRON VERT/ROUGE",
      "ZUCCHINI", "ZUCCHINI VERT", "ZUCCHINI JAUNE", "ZUCCHINI LIBANAIS"
    ];

    // 3️⃣ Initialize newAdjusted with 0 costs
    let newAdjusted = allVegetables.map(v => ({ vegetable: v, total_cost: 0 }));

    // 4️⃣ Merge in fetched vegetable soil products
    vegetableSoilProducts.forEach(sp => {
      if ('vegetable' in sp) {
        const idx = newAdjusted.findIndex(v => v.vegetable === sp.vegetable);
        if (idx >= 0) newAdjusted[idx].total_cost = Number(sp.total_cost || 0);
      }

    });

    // 5️⃣ Apply the generic redistribution
    newAdjusted = genericCostsRedistribution(newAdjusted, revenueMap);

    // 6️⃣ Set state
    setAdjustedSoilProducts(newAdjusted);


  }, [vegetableSoilProducts, revenues]);




  // Adjusted Unspeciefied Costs Effect


  useEffect(() => {
    if (!data?.length || !revenues.length) {
      setAdjustedUnspecifiedCosts([]);
      return;
    }

    // 1️⃣ Base costs already match CostEntry
    const baseCosts: CostEntry[] = data.map((d) => ({
      vegetable: d.vegetable,
      total_cost: Number(d.total_cost || 0),
    }));

    // 2️⃣ Revenue map
    const revenueMap = revenues.reduce<Record<string, number>>((acc, r) => {
      acc[r.vegetable] = Number(r.total_revenue || 0);
      return acc;
    }, {});

    // 3️⃣ Redistribution
    const redistributed = genericCostsRedistribution(baseCosts, revenueMap);

    // 4️⃣ No remapping needed
    setAdjustedUnspecifiedCosts(redistributed);


  }, [data, revenues, yearSelected, monthSelected, startDate, endDate]);









  // --- Compute final total costs per vegetable (UPDATED DEPENDENCY) ---
  useEffect(() => {
    if (!adjustedVegetableCosts.length || !revenues.length) {
      setVegetableTotalCosts({});
      return;
    }

    // 1. Create packaging cost lookup map from the ADJUSTED state
    const packagingCostMap: Record<string, number> = {};
    adjustedPackagingCosts.forEach(item => {
      packagingCostMap[item.vegetable] = item.total_cost;
    });

    // 2. Final Total Calculation
    const finalTotals: Record<string, number> = {};

    adjustedVegetableCosts.forEach((item) => {
      // A. Base Cost (includes redistributed task_costs)
      let totalCost = Number(item.total_cost);

      // B. Add the redistributed/specific packaging cost (from the new map)
      const packagingCost = packagingCostMap[item.vegetable] || 0;
      totalCost += packagingCost;

      // C. Add seed cost
      const seedCost = Number(
        seedCosts.find(
          (s) => ("seed" in s ? s.seed : s.vegetable) === item.vegetable
        )?.total_cost || 0
      );
      totalCost += seedCost;

      // C. Add soil product cost
      const soilProductCost = Number(adjustedSoilProducts.find((s) => s.vegetable === item.vegetable)?.total_cost || 0);
      totalCost += soilProductCost;

      // C. Add unspecified cost
      const unspecifiedCost = Number(adjustedUnspecifiedCosts.find((s) => s.vegetable === item.vegetable)?.total_cost || 0);
      totalCost += unspecifiedCost;

      // D. Add redistributed generic costs (AUCUNE, Other, No-culture, No-packaging, etc.)
      const redistributed = totalCostsToRedistribute * (Number(percentages[item.vegetable] || 0) / 100);
      totalCost += redistributed;

      finalTotals[item.vegetable] = totalCost;
    });

    setVegetableTotalCosts(finalTotals);
    // Dependency now includes adjustedPackagingCosts
  }, [adjustedVegetableCosts, seedCosts, percentages, totalCostsToRedistribute, adjustedPackagingCosts, adjustedSoilProducts, adjustedUnspecifiedCosts, revenues]);


  if (loading) return <p>Loading...</p>;

  return (
    <>
      {mainLoading && <p className="text-center">Chargement...</p>}
      {mainError && <p className="text-center text-red-500">{mainError}</p>}

      <div className="font-[nunito] w-full">
        <Outlet
          context={{
            revenues,
            percentages,
            vegetableCosts,
            adjustedVegetableCosts,
            otherCosts,
            noCultureCosts,
            otherCostsTotal,
            seedCosts,
            totalCostsToRedistribute,
            mainLoading,
            mainError,
            yearSelected,
            setYearSelected,
            monthSelected,
            setMonthSelected,
            startDate,
            setStartDate,
            endDate,
            setEndDate,
            vegetableTotalCosts,
            packagingCosts,
            adjustedPackagingCosts,
            vegetableSoilProducts,
            categorySoilProducts,
            setSoilGroupBy,
            soilGroupBy,
            adjustedSoilProducts,
            revenuesSelectedYear,
            setRevenuesSelectedYear,
            adjustedUnspecifiedCosts,
          }}
        />
      </div>
    </>
  );
}

export default App;