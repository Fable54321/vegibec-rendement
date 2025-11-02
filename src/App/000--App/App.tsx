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
        const expiresAt = payload.exp * 1000; // JWT exp is in seconds
        const now = Date.now();
        const timeout = expiresAt - now - 5000; // refresh 5s before expiry

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
  const [adjustedVegetableCosts, setAdjustedVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [noCultureCosts, setNoCultureCosts] = useState(0);
  const [otherCostsTotal, setOtherCostsTotal] = useState(0);
  const [totalCostsToRedistribute, setTotalCostsToRedistribute] = useState(0);
  const [otherCosts, setOtherCosts] = useState<[string, number][]>([]);
  const [seedCosts, setSeedCosts] = useState<{ seed: string; total_cost: number }[]>([]);

  // --- Loading / errors ---
  const [loadingRevenues, setLoadingRevenues] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [loadingOtherCosts, setLoadingOtherCosts] = useState(false);
  const [loadingSeedCosts, setLoadingSeedCosts] = useState(false);
  const [errorRevenues, setErrorRevenues] = useState<string | null>(null);
  const [errorCosts, setErrorCosts] = useState<string | null>(null);
  const [errorOtherCosts, setErrorOtherCosts] = useState<string | null>(null);
  const [errorSeedCosts, setErrorSeedCosts] = useState<string | null>(null);

  const mainLoading = loadingRevenues || loadingCosts || loadingOtherCosts || loadingSeedCosts;
  const mainError = errorRevenues || errorCosts || errorOtherCosts || errorSeedCosts;

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
          `${API_BASE_URL}/revenues/by-year?year_from=${yearSelected}`,
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

  // --- Fetch Vegetable Costs ---
  useEffect(() => {
    if (!token) return;

    const fetchCosts = async () => {
      setLoadingCosts(true);
      setErrorCosts(null);

      try {
        console.log("Fetching vegetable costs with URL:", `${API_BASE_URL}/data/costs/summary?groupBy=vegetable&${periodQuery}`);
        const data = (await fetchWithAuth(
          `${API_BASE_URL}/data/costs/summary?groupBy=vegetable&${periodQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )) as { vegetable: string; total_cost: number }[];

        console.log("Fetched vegetable costs data:", data);

        setVegetableCosts(data);

        console.log("VegetableCosts state now:", data);
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
    setTotalCostsToRedistribute(Number(noCultureCosts) + Number(otherCostsTotal));
  }, [noCultureCosts, otherCostsTotal]);

  // --- Adjust vegetable costs ---
  useEffect(() => {
    if (!vegetableCosts.length) {
      setAdjustedVegetableCosts([]);
      return;
    }

    let newAdjusted = vegetableCosts.map((v) => ({
      ...v,
      total_cost: Number(v.total_cost),
    }));

    // --- Lettuce redistribution ---

    // 1️⃣ LAITUE FRISÉE → VERTE & ROUGE
    const friseeCost = newAdjusted.find((v) => v.vegetable === "LAITUE FRISÉE")?.total_cost || 0;
    const friseeVarieties = ["LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"];
    const friseeRevenueTotal = friseeVarieties.reduce(
      (sum, name) => sum + (revenues.find((r) => r.vegetable === name)?.total_revenue || 0),
      0
    );
    friseeVarieties.forEach((name) => {
      const idx = newAdjusted.findIndex((v) => v.vegetable === name);
      const revenue = revenues.find((r) => r.vegetable === name)?.total_revenue || 0;
      const costShare = friseeRevenueTotal > 0 ? (revenue / friseeRevenueTotal) * friseeCost : 0;
      if (idx >= 0) newAdjusted[idx].total_cost += costShare;
      else newAdjusted.push({ vegetable: name, total_cost: costShare });
    });
    newAdjusted = newAdjusted.filter((v) => v.vegetable !== "LAITUE FRISÉE");

    // 2️⃣ LAITUE ROMAINE + CŒUR DE ROMAINE split by revenue
    const romaineCost =
      (newAdjusted.find((v) => v.vegetable === "LAITUE ROMAINE")?.total_cost || 0) +
      (newAdjusted.find((v) => v.vegetable === "CŒUR DE ROMAINE")?.total_cost || 0);
    const romaineVarieties = ["LAITUE ROMAINE", "CŒUR DE ROMAINE"];
    const romaineRevenueTotal = romaineVarieties.reduce(
      (sum, name) => sum + (revenues.find((r) => r.vegetable === name)?.total_revenue || 0),
      0
    );
    romaineVarieties.forEach((name) => {
      const idx = newAdjusted.findIndex((v) => v.vegetable === name);
      const revenue = revenues.find((r) => r.vegetable === name)?.total_revenue || 0;
      if (idx >= 0) newAdjusted[idx].total_cost = romaineRevenueTotal > 0 ? (revenue / romaineRevenueTotal) * romaineCost : 0;
    });

    // 3️⃣ Spread generic LAITUE across all lettuces
    const genericLettuceCost = newAdjusted.find((v) => v.vegetable === "LAITUE")?.total_cost || 0;
    const allLettuceVarieties = ["LAITUE ROMAINE", "CŒUR DE ROMAINE", "LAITUE POMMÉE", "LAITUE FRISÉE VERTE", "LAITUE FRISÉE ROUGE"];
    const totalLettuceRevenue = allLettuceVarieties.reduce(
      (sum, name) => sum + (revenues.find((r) => r.vegetable === name)?.total_revenue || 0),
      0
    );
    allLettuceVarieties.forEach((name) => {
      const idx = newAdjusted.findIndex((v) => v.vegetable === name);
      const revenue = revenues.find((r) => r.vegetable === name)?.total_revenue || 0;
      if (idx >= 0) newAdjusted[idx].total_cost += totalLettuceRevenue > 0 ? (revenue / totalLettuceRevenue) * genericLettuceCost : 0;
    });
    newAdjusted = newAdjusted.filter((v) => v.vegetable !== "LAITUE");

    // --- CHOU, ZUCCHINI, POIVRON redistribution ---
    const redistributions = [
      { base: "CHOU", exclude: ["CHOU-FLEUR", "CHOU DE BRUXELLES"] },
      { base: "ZUCCHINI", exclude: [] },
      { base: "POIVRON", exclude: [] },
    ];

    redistributions.forEach(({ base, exclude }) => {
      const baseCost = newAdjusted.find((v) => v.vegetable === base)?.total_cost || 0;
      const related = newAdjusted.filter(
        (v) => v.vegetable.startsWith(base) && !exclude.includes(v.vegetable)
      );
      const totalRevenue = related.reduce(
        (sum, item) => sum + (revenues.find((r) => r.vegetable === item.vegetable)?.total_revenue || 0),
        0
      );
      related.forEach((item) => {
        const revenue = revenues.find((r) => r.vegetable === item.vegetable)?.total_revenue || 0;
        item.total_cost += totalRevenue > 0 ? (revenue / totalRevenue) * baseCost : 0;
      });
      newAdjusted = newAdjusted.filter((v) => v.vegetable !== base);
    });

    setAdjustedVegetableCosts(newAdjusted);
  }, [vegetableCosts, revenues]);


  // --- Compute final total costs per vegetable ---
  useEffect(() => {
    if (!adjustedVegetableCosts.length || !revenues.length) {
      setVegetableTotalCosts({});
      return;
    }

    const finalTotals: Record<string, number> = {};

    adjustedVegetableCosts.forEach((item) => {
      const seedCost = Number(seedCosts.find(s => s.seed === item.vegetable)?.total_cost || 0);
      const redistributed = totalCostsToRedistribute * (Number(percentages[item.vegetable] || 0) / 100);
      finalTotals[item.vegetable] = Number(item.total_cost) + seedCost + redistributed;
    });

    setVegetableTotalCosts(finalTotals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustedVegetableCosts, seedCosts, percentages, totalCostsToRedistribute]);

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
          }}
        />
      </div>
    </>
  );
}

export default App;

