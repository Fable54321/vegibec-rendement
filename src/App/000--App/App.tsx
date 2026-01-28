import { Outlet } from "react-router-dom";
import { useEffect, useState, useMemo, useContext } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import type { VegetableCosts } from "@/utils/types";
import { useDate } from "@/context/date/DateContext";
import { UnitsContext } from "@/context/units/UnitsContext";
import { UnspecifiedContext } from "@/context/unspecified/UnspecifiedContext";
import { genericCostsRedistribution } from "../../utils/genericCostsRedistribution";
import { buildEffectiveRevenues } from "@/utils/buildEffectiveRevenues";
import { useVegetables } from "@/context/vegetables/VegetablesContext";
import { useProjectedRevenues } from "@/context/projectedRevenues/ProjectedRevenuesContext";



export type RevenuePercentage = Record<string, number>;

type SeedCostAPI = {
  vegetable: string;
  cultivar?: string; // optional, can be undefined for older data
  total_cost: number;
};



export type AppOutletContext = {
  revenues: { vegetable: string; revenue: number }[];
  percentages: RevenuePercentage;
  vegetableCosts: { vegetable: string; total_cost: number }[];
  adjustedVegetableCosts: { vegetable: string; total_cost: number }[];
  noCultureCosts: number;
  otherCostsTotal: number;
  totalCostsToRedistribute: number;
  seedCosts: SeedCostAPI[];
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
  availableYears: number[];
};

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

function App() {
  const { token, login, logout, loading } = useAuth();



  type SoilProductCost =
    | { vegetable: string; total_cost: number }
    | { category: string; total_cost: number };

  // --- AUTO-REFRESH ACCESS TOKEN ---
  useEffect(() => {
    if (loading || !token) return;

    let timer: ReturnType<typeof setTimeout>;

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

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      const timeout = expiresAt - now - 5000;

      if (timeout <= 0) {
        refreshToken();
      } else {
        timer = setTimeout(refreshToken, timeout);
      }
    } catch (err) {
      console.error("Failed to parse token for refresh:", err);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [token, login, logout, loading]);


  // --- Filters ---
  const { yearSelected, setYearSelected, monthSelected, setMonthSelected, startDate, setStartDate, endDate, setEndDate } = useDate();


  interface Revenue {
    vegetable: string;
    revenue: number;
  }



  const [soilGroupBy, setSoilGroupBy] = useState<"vegetable" | "category">("category");

  // --- Data ---
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [revenuesSelectedYear, setRevenuesSelectedYear] = useState("2024");
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    if (!token || loading) return; // ✅ wait until auth is loaded

    const fetchYears = async () => {
      const data: number[] = await fetchWithAuth(
        `${API_BASE_URL}/revenues/available-years`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableYears(data);

      // Pick last completed year automatically
      const currentYear = new Date().getFullYear();
      const lastCompleted = data.find(y => y <= currentYear - 1);
      if (lastCompleted) setRevenuesSelectedYear(lastCompleted.toString());
    };

    fetchYears();
  }, [token, loading]);



  const [percentages, setPercentages] = useState<RevenuePercentage>({});
  const [vegetableCosts, setVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [noCultureCosts, setNoCultureCosts] = useState(0);
  const [otherCostsTotal, setOtherCostsTotal] = useState(0);
  const [totalCostsToRedistribute, setTotalCostsToRedistribute] = useState(0);
  const [otherCosts, setOtherCosts] = useState<[string, number][]>([]);
  const [seedCosts, setSeedCosts] = useState<SeedCostAPI[]>([]);
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
  const [allVegetables, setAllVegetables] = useState<string[]>([]);

  const { loading: projectedRevenuesloading, error: projectedRevenuesError, projectedRevenues } = useProjectedRevenues()

  const normalizedProjectedRevenues = useMemo(
    () =>
      projectedRevenues.map((p) => ({
        vegetable: p.vegetable,
        revenue: Number(p.projected_revenue),
        year: p.year,
        generic_group: p.generic_group,
      })),
    [projectedRevenues] // only recompute when projectedRevenues changes
  );


  const { vegetables, loading: vegetablesLoading, error: vegetablesError } = useVegetables();




  useEffect(() => {
    const vegNames = vegetables.map(v => v.vegetable);
    setAllVegetables(vegNames);

  }, [vegetables])


  //Unspecified Context


  type UnspecifiedCost = {
    vegetable: string;
    total_cost: number;
  };


  const [adjustedUnspecifiedCosts, setAdjustedUnspecifiedCosts] = useState<UnspecifiedCost[]>([]);

  const { unspecifiedError, unspecifiedLoading, data } = useContext(UnspecifiedContext);


  const [adjustedVegetableCosts, setAdjustedVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);



  const mainLoading = loadingRevenues || loadingCosts || loadingOtherCosts || loadingSeedCosts
    || loadingPackagingCosts || loadingSoilProducts || unitsLoading || unspecifiedLoading
    || vegetablesLoading || projectedRevenuesloading;


  const mainError = errorRevenues || errorCosts || errorOtherCosts || errorSeedCosts || errorPackagingCosts
    || errorSoilProducts || unitsError
    || unspecifiedError || vegetablesError
    || projectedRevenuesError;

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
        const data = await fetchWithAuth<
          { vegetable: string; total_revenue: number }[]
        >(
          `${API_BASE_URL}/revenues/by-year?year_from=${revenuesSelectedYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 1️⃣ Normalize real revenues
        const normalizedRealRevenues = data.map((r) => ({
          vegetable: r.vegetable,
          revenue: Number(r.total_revenue),
        }));

        const normalizedProjectedRevenues = projectedRevenues.map((p) => ({
          vegetable: p.vegetable,
          revenue: Number(p.projected_revenue),
          year: p.year,
        }));

        // 2️⃣ Build effective revenues (THIS is the key fix)
        const effectiveRevenues = buildEffectiveRevenues(
          normalizedRealRevenues,
          normalizedProjectedRevenues,
          Number(yearSelected)
        );

        setRevenues(effectiveRevenues);

        // 3️⃣ Percentages MUST be based on effective revenues
        if (!effectiveRevenues.length) {
          setPercentages({});
        } else {
          const total = effectiveRevenues.reduce(
            (sum, r) => sum + r.revenue,
            0
          );

          const pct: RevenuePercentage = {};
          effectiveRevenues.forEach((item) => {
            pct[item.vegetable] = (item.revenue / total) * 100;
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
  }, [
    revenuesSelectedYear,
    yearSelected,          // ✅ REQUIRED
    token,
    projectedRevenues,    // ✅ REQUIRED
  ]);



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

  useEffect(() => {
    console.log('packagingCosts', packagingCosts)
  }, [packagingCosts])

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
        acc[r.vegetable] = Number(r.revenue || 0);
        return acc;
      }, {}),
      normalizedProjectedRevenues,
    );

    setAdjustedVegetableCosts(newAdjusted);


  }, [vegetableCosts, revenues, yearSelected, monthSelected, startDate, endDate, allVegetables, normalizedProjectedRevenues]);




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
        )) as SeedCostAPI[];

        // Store raw API data
        setSeedCosts(data);

        // Log to see cultivars


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
    const noPackagingCost = Array.isArray(packagingCosts)
      ? packagingCosts.find(item => item.vegetable === "AUCUNE")?.total_cost || 0
      : 0;

    const noCultureUnspecifiedCost = adjustedUnspecifiedCosts.find((item) => item.vegetable === "AUCUNE" || null)?.total_cost || 0;

    // Sum the costs: No Culture Costs + Other Costs Total + No Packaging Cost
    setTotalCostsToRedistribute(
      Number(noCultureCosts) + Number(otherCostsTotal) + Number(noPackagingCost) + Number(aucuneSoilCost) + Number(noCultureUnspecifiedCost)
    );
  }, [noCultureCosts, otherCostsTotal, packagingCosts, aucuneSoilCost, adjustedUnspecifiedCosts, revenues]);


  useEffect(() => {
    if (!packagingCosts.length) {
      setAdjustedPackagingCosts([]);
      return;
    }




    // 2️⃣ Initialize all vegetables with 0 cost
    let newAdjusted = allVegetables.map(v => ({ vegetable: v, total_cost: 0 }));

    // 3️⃣ Merge in fetched packaging costs
    packagingCosts.forEach(pc => {
      const idx = newAdjusted.findIndex(v => v.vegetable === pc.vegetable);
      if (idx >= 0) newAdjusted[idx].total_cost = Number(pc.total_cost || 0);
    });

    // 4️⃣ Build revenue map
    const revenueMap: Record<string, number> = revenues.reduce((acc, r) => {
      acc[r.vegetable] = Number(r.revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    // 5️⃣ Apply the generic redistribution
    newAdjusted = genericCostsRedistribution(newAdjusted, revenueMap, normalizedProjectedRevenues);

    // 6️⃣ Set state
    setAdjustedPackagingCosts(newAdjusted);


  }, [packagingCosts, revenues, allVegetables, normalizedProjectedRevenues]);



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
      acc[r.vegetable] = Number(r.revenue || 0);
      return acc;
    }, {} as Record<string, number>);



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
    newAdjusted = genericCostsRedistribution(newAdjusted, revenueMap, normalizedProjectedRevenues);

    // 6️⃣ Set state
    setAdjustedSoilProducts(newAdjusted);


  }, [vegetableSoilProducts, revenues, allVegetables, normalizedProjectedRevenues]);




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
      acc[r.vegetable] = Number(r.revenue || 0);
      return acc;
    }, {});

    // 3️⃣ Redistribution
    const redistributed = genericCostsRedistribution(baseCosts, revenueMap, normalizedProjectedRevenues);

    // 4️⃣ No remapping needed
    setAdjustedUnspecifiedCosts(redistributed);


  }, [data, revenues, yearSelected, monthSelected, startDate, endDate, normalizedProjectedRevenues]);









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
            availableYears,
          }}
        />
      </div>
    </>
  );
}

export default App;