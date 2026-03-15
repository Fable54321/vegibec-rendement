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
import ScrollToTop from "../0--ScrollToTop/ScrollToTop";



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



function App() {
  const { loading } = useAuth();



  type SoilProductCost =
    | { vegetable: string; total_cost: number }
    | { category: string; total_cost: number };




  // --- Filters ---
  const { yearSelected, setYearSelected, monthSelected, setMonthSelected, startDate, setStartDate, endDate, setEndDate } = useDate();


  interface Revenue {
    vegetable: string;
    revenue: number;
  }



  const [soilGroupBy, setSoilGroupBy] = useState<"vegetable" | "category">("category");

  // --- Data ---
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [revenuesSelectedYear, setRevenuesSelectedYear] = useState("");
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    if (loading) return;

    const fetchYears = async () => {
      const data: number[] = await fetchWithAuth(
        `/revenues/available-years`,

      );

      setAvailableYears(data);

      // 🟢 Pick MOST RECENT available year
      const mostRecent = Math.max(...data);

      // 🔒 Only override if user hasn't picked anything yet
      setRevenuesSelectedYear(prev =>
        prev === "" || !data.includes(Number(prev))
          ? mostRecent.toString()
          : prev
      );
    };

    fetchYears();
  }, [loading]);



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
  const [, setErrorRevenues] = useState<string | null>(null);
  const [errorCosts, setErrorCosts] = useState<string | null>(null);
  const [errorOtherCosts, setErrorOtherCosts] = useState<string | null>(null);
  const [errorSeedCosts, setErrorSeedCosts] = useState<string | null>(null);
  const [errorSoilProducts, setErrorSoilProducts] = useState<string | null>(null);
  const { unitsError, unitsLoading } = useContext(UnitsContext);
  const [allVegetables, setAllVegetables] = useState<string[]>([]);

  const { loading: projectedRevenuesloading, error: projectedRevenuesError, projectedRevenues } = useProjectedRevenues()

  // const normalizedProjectedRevenues = useMemo(
  //   () =>
  //     projectedRevenues.map((p) => ({
  //       vegetable: p.vegetable,
  //       revenue: Number(p.projected_revenue),
  //       year: p.year,
  //       generic_group: p.generic_group,
  //     })),
  //   [projectedRevenues] // only recompute when projectedRevenues changes
  // );


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


  const mainError = errorCosts || errorOtherCosts || errorSeedCosts || errorPackagingCosts
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


    const fetchRevenues = async () => {
      setLoadingRevenues(true);
      setErrorRevenues(null);

      try {
        const data = await fetchWithAuth<
          { vegetable: string; total_revenue: number }[]
        >(
          `/revenues/by-year?year_from=${revenuesSelectedYear}`,

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
    projectedRevenues,    // ✅ REQUIRED
  ]);



  useEffect(() => {


    const fetchPackagingCosts = async () => {
      setLoadingPackagingCosts(true);
      setErrorPackagingCosts(null);

      try {
        const data = (await fetchWithAuth(
          `/data/packaging_costs/per_vegetable?${periodQuery}`,

        )) as { vegetable: string; total_cost: number }[];

        setPackagingCosts(data);
      } catch (err) {
        setErrorPackagingCosts((err as Error).message);
      } finally {
        setLoadingPackagingCosts(false);
      }
    };

    fetchPackagingCosts();
  }, [periodQuery]);



  // --- Fetch Vegetable Costs ---
  useEffect(() => {


    const fetchCosts = async () => {
      setLoadingCosts(true);
      setErrorCosts(null);

      try {
        const data = (await fetchWithAuth(
          `/data/costs/summary?groupBy=vegetable&${periodQuery}`,

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
  }, [periodQuery]);


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

    const revenueMap = revenues.reduce<Record<string, number>>((acc, r) => {
      acc[r.vegetable] = Number(r.revenue || 0);
      return acc;
    }, {});

    console.log("==== BEFORE REDISTRIBUTION ====");
    console.log("Vegetable costs:", newAdjusted);
    console.log("Revenue map LR:", revenueMap["LAITUE ROMAINE"]);
    console.log("Revenue map CR:", revenueMap["CŒUR DE ROMAINE"]);
    console.log("Vegetables metadata:", vegetables);


    console.log(
      "Base LR:",
      newAdjusted.find(v => v.vegetable === "LAITUE ROMAINE")
    );

    console.log(
      "Base CR:",
      newAdjusted.find(v => v.vegetable === "CŒUR DE ROMAINE")
    );

    console.log(
      "Base LAITUE:",
      newAdjusted.find(v => v.vegetable === "LAITUE")
    );

    // 4️⃣ Apply the generic redistribution
    newAdjusted = genericCostsRedistribution(
      newAdjusted,

      // revenue map
      revenues.reduce<Record<string, number>>((acc, r) => {
        acc[r.vegetable] = Number(r.revenue || 0);
        return acc;
      }, {}),

      vegetables   // ✅ NEW SOURCE OF TRUTH
    );

    console.log("==== AFTER REDISTRIBUTION ====");
    console.log(
      "LR:",
      newAdjusted.find(v => v.vegetable === "LAITUE ROMAINE")
    );
    console.log(
      "CR:",
      newAdjusted.find(v => v.vegetable === "CŒUR DE ROMAINE")
    );

    setAdjustedVegetableCosts(newAdjusted);


  }, [vegetableCosts, revenues, yearSelected, monthSelected, startDate, endDate, allVegetables, vegetables]);




  // --- Fetch Other Costs ---
  useEffect(() => {

    const fetchOtherCosts = async () => {
      setLoadingOtherCosts(true);
      setErrorOtherCosts(null);

      try {
        const data = (await fetchWithAuth(
          `/data/costs/other_costs?${periodQuery}`,

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
  }, [periodQuery]);

  // --- Fetch Seed Costs ---
  useEffect(() => {


    const fetchSeedCosts = async () => {
      setLoadingSeedCosts(true);
      setErrorSeedCosts(null);

      try {
        const data = (await fetchWithAuth(
          `/data/costs/seed_costs?${periodQuery}`,

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
  }, [periodQuery]);





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
    newAdjusted = genericCostsRedistribution(newAdjusted, revenueMap, vegetables);

    // 6️⃣ Set state
    setAdjustedPackagingCosts(newAdjusted);


  }, [packagingCosts, revenues, allVegetables, vegetables]);



  useEffect(() => {


    const fetchSoilProducts = async () => {
      setLoadingSoilProducts(true);
      setErrorSoilProducts(null);

      try {
        const data = (await fetchWithAuth(
          `/data/costs/soil_products/vegetable?${periodQuery}`,

        )) as SoilProductCost[];

        setVegetableSoilProducts(data);
      } catch (err) {
        setErrorSoilProducts((err as Error).message);
      } finally {
        setLoadingSoilProducts(false);
      }
    };

    fetchSoilProducts();
  }, [periodQuery]);

  useEffect(() => {


    const fetchCategorySoilProducts = async () => {

      setLoadingSoilProducts(true);
      setErrorSoilProducts(null);

      try {
        const data = (await fetchWithAuth(
          `/data/costs/soil_products/category?${periodQuery}`,

        )) as SoilProductCost[];

        setCategorySoilProducts(data);
      } catch (err) {
        setErrorSoilProducts((err as Error).message);
      } finally {
        setLoadingSoilProducts(false);
      }
    };

    fetchCategorySoilProducts();
  }, [periodQuery])


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
    newAdjusted = genericCostsRedistribution(newAdjusted, revenueMap, vegetables);

    // 6️⃣ Set state
    setAdjustedSoilProducts(newAdjusted);


  }, [vegetableSoilProducts, revenues, allVegetables, vegetables]);




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
    const redistributed = genericCostsRedistribution(baseCosts, revenueMap, vegetables);

    // 4️⃣ No remapping needed
    setAdjustedUnspecifiedCosts(redistributed);


  }, [data, revenues, yearSelected, monthSelected, startDate, endDate, vegetables]);









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
        <ScrollToTop />
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