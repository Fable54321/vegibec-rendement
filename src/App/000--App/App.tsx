import { Outlet } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import type { VegetableCosts } from "@/utils/types";

export type RevenuePercentage = Record<string, number>;

export type AppOutletContext = {
  revenues: { vegetable: string; total_revenue: number }[];
  percentages: RevenuePercentage;
  vegetableCosts: { vegetable: string; total_cost: number }[];
  adjustedVegetableCosts: { vegetable: string; total_cost: number }[];
  noCultureCosts: number;
  otherCostsTotal: number;
  totalCostsToRedistribute: number;
  seedCosts: { seed: string; total_cost: number }[];
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
  // 🌟 NEW CONTEXT VARIABLE 🌟
  adjustedPackagingCosts: { vegetable: string; total_cost: number }[];
};

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

function App() {
  const { token, login, logout, loading } = useAuth();

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
  const [yearSelected, setYearSelected] = useState("2024");
  const [monthSelected, setMonthSelected] = useState<string | undefined>();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- Data ---
  const [revenues, setRevenues] = useState<{ vegetable: string; total_revenue: number }[]>([]);
  const [percentages, setPercentages] = useState<RevenuePercentage>({});
  const [vegetableCosts, setVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [noCultureCosts, setNoCultureCosts] = useState(0);
  const [otherCostsTotal, setOtherCostsTotal] = useState(0);
  const [totalCostsToRedistribute, setTotalCostsToRedistribute] = useState(0);
  const [otherCosts, setOtherCosts] = useState<[string, number][]>([]);
  const [seedCosts, setSeedCosts] = useState<{ seed: string; total_cost: number }[]>([]);
  const [packagingCosts, setPackagingCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  // 🌟 NEW STATE FOR ADJUSTED PACKAGING COSTS 🌟
  const [adjustedPackagingCosts, setAdjustedPackagingCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [loadingPackagingCosts, setLoadingPackagingCosts] = useState(false);
  const [errorPackagingCosts, setErrorPackagingCosts] = useState<string | null>(null);

  // --- Loading / errors ---
  const [loadingRevenues, setLoadingRevenues] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [loadingOtherCosts, setLoadingOtherCosts] = useState(false);
  const [loadingSeedCosts, setLoadingSeedCosts] = useState(false);
  const [errorRevenues, setErrorRevenues] = useState<string | null>(null);
  const [errorCosts, setErrorCosts] = useState<string | null>(null);
  const [errorOtherCosts, setErrorOtherCosts] = useState<string | null>(null);
  const [errorSeedCosts, setErrorSeedCosts] = useState<string | null>(null);
  const [adjustedVegetableCosts, setAdjustedVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);

  const mainLoading = loadingRevenues || loadingCosts || loadingOtherCosts || loadingSeedCosts || loadingPackagingCosts;
  const mainError = errorRevenues || errorCosts || errorOtherCosts || errorSeedCosts || errorPackagingCosts;

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

  // --- Fetch Revenues ---
  useEffect(() => {
    if (!token) return;

    const fetchRevenues = async () => {
      setLoadingRevenues(true);
      setErrorRevenues(null);

      try {
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/revenues/by-year?year_from=2024`,
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
  }, [yearSelected, token]);


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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearSelected, monthSelected, startDate, endDate, token]);


  // --- Fetch Vegetable Costs ---
  useEffect(() => {
    // ... (existing fetch logic for setVegetableCosts and setNoCultureCosts) ...
  }, [/* ... dependencies ... */]);

  // 🚀 🌟 RE-INSERT THE ORIGINAL ADJUSTED VEGETABLE COSTS LOGIC HERE 🌟 🚀
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
    let newAdjusted = allVegetables.map((veg) => ({ vegetable: veg, total_cost: 0 }));



    // 3️⃣ Merge in fetched costs (default to 0)
    vegetableCosts.forEach((item) => {
      const idx = newAdjusted.findIndex((v) => v.vegetable === item.vegetable);
      if (idx >= 0) newAdjusted[idx].total_cost = Number(item.total_cost || 0);
    });

    // 4️⃣ Redistribution helpers
    const redistributeGroupCost = (
      groupName: string,
      varieties: string[],
      exclude: string[] = []
    ) => {
      const children = varieties.filter((v) => !exclude.includes(v));
      const totalRevenue = children.reduce(
        (sum, name) => sum + Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 0),
        0
      );

      if (totalRevenue <= 0) return;

      const groupCost = Number(newAdjusted.find((v) => v.vegetable === groupName)?.total_cost || 0);

      children.forEach((name) => {
        const revenue = Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 0);
        const idx = newAdjusted.findIndex((v) => v.vegetable === name);
        if (idx >= 0) {
          newAdjusted[idx].total_cost += (revenue / totalRevenue) * groupCost;
        } else {
          newAdjusted.push({ vegetable: name, total_cost: (revenue / totalRevenue) * groupCost });
        }
      });

      // 🛑 CRITICAL: Remove the generic parent after redistribution
      newAdjusted = newAdjusted.filter((v) => v.vegetable !== groupName);
    };

    // 5️⃣ Lettuce redistribution
    const redistributeLettuce = () => {
      let updated = [...newAdjusted];

      // LAITUE FRISÉE → VERTE & ROUGE
      const friseeCost = updated.find((v) => v.vegetable === "LAITUE FRISÉE")?.total_cost || 0;
      if (friseeCost > 0) {
        const friseeVarieties = ["LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"];
        const friseeRevenueTotal = friseeVarieties.reduce(
          (sum, name) => sum + Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 1),
          0
        );

        friseeVarieties.forEach((name) => {
          const revenue = Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 1);
          const idx = updated.findIndex((v) => v.vegetable === name);
          const costShare = (revenue / friseeRevenueTotal) * friseeCost;
          if (idx >= 0) updated[idx].total_cost += costShare;
          else updated.push({ vegetable: name, total_cost: costShare });
        });

        updated = updated.filter((v) => v.vegetable !== "LAITUE FRISÉE");
      }

      // LAITUE ROMAINE + CŒUR DE ROMAINE
      const romaineCost =
        (updated.find((v) => v.vegetable === "LAITUE ROMAINE")?.total_cost || 0) +
        (updated.find((v) => v.vegetable === "CŒUR DE ROMAINE")?.total_cost || 0);
      const romaineVarieties = ["LAITUE ROMAINE", "CŒUR DE ROMAINE"];
      const romaineRevenueTotal = romaineVarieties.reduce(
        (sum, name) => sum + Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 1),
        0
      );
      romaineVarieties.forEach((name) => {
        const idx = updated.findIndex((v) => v.vegetable === name);
        const revenue = Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 1);
        const costShare = (revenue / romaineRevenueTotal) * romaineCost;
        if (idx >= 0) updated[idx].total_cost = costShare; // This seems to overwrite, not add, based on your original logic
        else updated.push({ vegetable: name, total_cost: costShare });
      });

      // Remove the original LAITUE ROMAINE and CŒUR DE ROMAINE direct entries since their costs 
      // were aggregated into romaineCost and redistributed (this is implicit in the logic above, 
      // but explicit removal of the old items is safer if they were in the base data)
      updated = updated.filter(v => !["LAITUE ROMAINE", "CŒUR DE ROMAINE"].includes(v.vegetable) || v.total_cost > 0);
      // We ensure the redistributed values are present:
      romaineVarieties.forEach(name => {
        const cost = (romaineRevenueTotal > 0) ? (Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 1) / romaineRevenueTotal) * romaineCost : 0;
        if (cost > 0 && !updated.some(v => v.vegetable === name)) {
          updated.push({ vegetable: name, total_cost: cost });
        }
      });


      // Spread generic LAITUE across all lettuces
      const genericLettuceCost = updated.find((v) => v.vegetable === "LAITUE")?.total_cost || 0;
      if (genericLettuceCost > 0) {
        const allLettuceVarieties = [
          "LAITUE ROMAINE",
          "CŒUR DE ROMAINE",
          "LAITUE POMMÉE",
          "LAITUE FRISÉE VERTE",
          "LAITUE FRISÉE ROUGE",
        ];
        const totalLettuceRevenue = allLettuceVarieties.reduce(
          (sum, name) => sum + Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 1),
          0
        );

        allLettuceVarieties.forEach((name) => {
          const idx = updated.findIndex((v) => v.vegetable === name);
          const revenue = Number(revenues.find((r) => r.vegetable === name)?.total_revenue || 1);
          const costShare = (revenue / totalLettuceRevenue) * genericLettuceCost;
          if (idx >= 0) updated[idx].total_cost += costShare;
          else updated.push({ vegetable: name, total_cost: costShare });
        });

        updated = updated.filter((v) => v.vegetable !== "LAITUE");
      }

      return updated;
    };

    newAdjusted = redistributeLettuce();

    // 6️⃣ Other groups
    // Note: CHOU PLAT's direct costs will be absorbed into CHOU and redistributed here.
    redistributeGroupCost("CHOU", ["CHOU VERT", "CHOU PLAT", "CHOU ROUGE", "CHOU DE SAVOIE"], [
      "CHOU-FLEUR",
      "CHOU DE BRUXELLES",
    ]);
    redistributeGroupCost("ZUCCHINI", ["ZUCCHINI VERT", "ZUCCHINI JAUNE", "ZUCCHINI LIBANAIS"]);
    redistributeGroupCost("POIVRON", [
      "POIVRON VERT",
      "POIVRON ROUGE",
      "POIVRON JAUNE",
      "POIVRON ORANGE",
      "POIVRON VERT/ROUGE",
    ]);


    setAdjustedVegetableCosts(newAdjusted);

  }, [vegetableCosts, revenues, yearSelected, monthSelected, startDate, endDate]);

  // --- 🌟 NEW: ADJUST PACKAGING COSTS (Redistribute Generic Costs) 🌟 
  // ... (The rest of your code follows)

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

  useEffect(() => { console.log("basic packaging costs", packagingCosts) }, [packagingCosts])

  // --- Compute total redistributable costs ---
  useEffect(() => {
    // Find the "AUCUNE" cost in the packagingCosts array
    const noPackagingCost = packagingCosts.find((item) => item.vegetable === "AUCUNE")?.total_cost || 0;

    // Sum the costs: No Culture Costs + Other Costs Total + No Packaging Cost
    setTotalCostsToRedistribute(
      Number(noCultureCosts) + Number(otherCostsTotal) + Number(noPackagingCost)
    );
  }, [noCultureCosts, otherCostsTotal, packagingCosts]);


  useEffect(() => {
    if (!packagingCosts.length) {
      setAdjustedPackagingCosts([]);
      return;
    }

    // 1️⃣ Build quick lookup maps
    const revenueMap: Record<string, number> = {};
    revenues.forEach(r => revenueMap[r.vegetable] = Number(r.total_revenue || 0));

    const directCostsMap: Record<string, number> = {};
    let aucuneCost = 0;

    // 2️⃣ Initialize all vegetables (with 0) to guarantee final existence
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

    allVegetables.forEach(v => directCostsMap[v] = 0);

    // 3️⃣ Process direct packaging costs
    packagingCosts.forEach(pc => {
      const cost = Number(pc.total_cost || 0);
      if (pc.vegetable === "AUCUNE") {
        aucuneCost = cost;
      } else if (pc.vegetable !== "CHOU" && pc.vegetable !== "LAITUE" && pc.vegetable !== "LAITUE FRISÉE" && pc.vegetable !== "POIVRON" && pc.vegetable !== "ZUCCHINI") {
        directCostsMap[pc.vegetable] = cost;
      }
    });

    // 4️⃣ Redistribute group costs helper
    const redistribute = (parent: string, children: string[]) => {
      const parentCost = packagingCosts.find(pc => pc.vegetable === parent)?.total_cost || 0;
      if (parentCost <= 0) return;

      const totalRevenue = children.reduce((sum, v) => sum + (revenueMap[v] || 0), 0);
      if (totalRevenue <= 0) return;

      children.forEach(child => {
        directCostsMap[child] += (revenueMap[child] || 0) / totalRevenue * parentCost;
      });
    };

    // 5️⃣ Redistribute CHOU
    redistribute("CHOU", ["CHOU PLAT", "CHOU VERT", "CHOU ROUGE", "CHOU DE SAVOIE"]);

    // 6️⃣ Redistribute lettuce
    redistribute("LAITUE FRISÉE", ["LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"]);
    redistribute("LAITUE", ["LAITUE ROMAINE", "CŒUR DE ROMAINE", "LAITUE POMMÉE", "LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"]);

    // 7️⃣ Redistribute POIVRON and ZUCCHINI
    redistribute("POIVRON", ["POIVRON VERT", "POIVRON ROUGE", "POIVRON JAUNE", "POIVRON ORANGE", "POIVRON VERT/ROUGE"]);
    redistribute("ZUCCHINI", ["ZUCCHINI VERT", "ZUCCHINI JAUNE", "ZUCCHINI LIBANAIS"]);

    // 8️⃣ Build final array
    const adjustedList = Object.entries(directCostsMap)
      .map(([vegetable, total_cost]) => ({ vegetable, total_cost }))
      .filter(item => item.total_cost > 0); // optional: skip zero-cost veggies

    if (aucuneCost > 0) adjustedList.push({ vegetable: "AUCUNE", total_cost: aucuneCost });

    // Optional: sort alphabetically
    adjustedList.sort((a, b) => a.vegetable.localeCompare(b.vegetable));

    console.log("✅ FINAL ADJUSTED PACKAGING COSTS (MAP VERSION):", adjustedList);
    setAdjustedPackagingCosts(adjustedList);

  }, [packagingCosts, revenues]);








  useEffect(() => {
    console.log("REVENUES", revenues);
  }, [revenues])


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
      const seedCost = Number(seedCosts.find((s) => s.seed === item.vegetable)?.total_cost || 0);
      totalCost += seedCost;

      // D. Add redistributed generic costs (AUCUNE, Other, No-culture, No-packaging, etc.)
      const redistributed = totalCostsToRedistribute * (Number(percentages[item.vegetable] || 0) / 100);
      totalCost += redistributed;

      finalTotals[item.vegetable] = totalCost;
    });

    setVegetableTotalCosts(finalTotals);
    // Dependency now includes adjustedPackagingCosts
  }, [adjustedVegetableCosts, seedCosts, percentages, totalCostsToRedistribute, adjustedPackagingCosts, revenues]);


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
            // 🌟 PASS THE ADJUSTED STATE 🌟
            adjustedPackagingCosts,
          }}
        />
      </div>
    </>
  );
}

export default App;