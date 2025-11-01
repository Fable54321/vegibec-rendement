import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
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

const API_BASE_URL = "http://localhost:3000";

function App() {
  const { token, loading } = useAuth();

  // --- Filters
  const [yearSelected, setYearSelected] = useState("2024");
  const [monthSelected, setMonthSelected] = useState<string | undefined>();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- Data
  const [revenues, setRevenues] = useState<{ vegetable: string; total_revenue: number }[]>([]);
  const [percentages, setPercentages] = useState<RevenuePercentage>({});
  const [vegetableCosts, setVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [adjustedVegetableCosts, setAdjustedVegetableCosts] = useState<{ vegetable: string; total_cost: number }[]>([]);
  const [noCultureCosts, setNoCultureCosts] = useState(0);
  const [otherCostsTotal, setOtherCostsTotal] = useState(0);
  const [totalCostsToRedistribute, setTotalCostsToRedistribute] = useState(0);
  const [otherCosts, setOtherCosts] = useState<[string, number][]>([]);
  const [seedCosts, setSeedCosts] = useState<{ seed: string; total_cost: number }[]>([]);

  // --- Loading / errors
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

  // --- Derived query period
  const periodQuery = (() => {
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
  })();

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

  // --- Adjust vegetable costs (lettuce split etc.) ---
  useEffect(() => {
    if (!vegetableCosts.length || !revenues.length) {
      setAdjustedVegetableCosts([]);
      return;
    }

    const romaineRevenue = Number(revenues.find(r => r.vegetable === "LAITUE ROMAINE")?.total_revenue || 0);
    const heartRevenue = Number(revenues.find(r => r.vegetable === "CŒUR DE ROMAINE")?.total_revenue || 0);
    const romaineRevenueTotal = romaineRevenue + heartRevenue;

    const romaineTotalCost =
      Number(vegetableCosts.find(v => v.vegetable === "LAITUE ROMAINE")?.total_cost || 0) +
      Number(vegetableCosts.find(v => v.vegetable === "CŒUR DE ROMAINE")?.total_cost || 0);

    const romaineCostsNew = romaineRevenueTotal > 0 ? romaineTotalCost * (romaineRevenue / romaineRevenueTotal) : 0;
    const romaineHeartCostsNew = romaineRevenueTotal > 0 ? romaineTotalCost * (heartRevenue / romaineRevenueTotal) : 0;

    let newAdjusted = vegetableCosts.map((item) => {
      if (item.vegetable === "LAITUE ROMAINE") return { ...item, total_cost: romaineCostsNew };
      if (item.vegetable === "CŒUR DE ROMAINE") return { ...item, total_cost: romaineHeartCostsNew };
      return { ...item, total_cost: Number(item.total_cost) };
    });

    // Lettuce redistribution
    const lettuceNames = ["LAITUE ROMAINE", "CŒUR DE ROMAINE", "LAITUE POMMÉE", "LAITUE FRISÉE"];
    const lettuceRevenueTotal = lettuceNames.reduce((sum, name) => sum + Number(revenues.find(r => r.vegetable === name)?.total_revenue || 0), 0);

    if (lettuceRevenueTotal > 0) {
      const lettucePercentages: Record<string, number> = {};
      lettuceNames.forEach((name) => {
        lettucePercentages[name] = Number(revenues.find(r => r.vegetable === name)?.total_revenue || 0) / lettuceRevenueTotal;
      });

      const unspecifiedLettuceCost = Number(newAdjusted.find(v => v.vegetable === "LAITUE")?.total_cost || 0);

      newAdjusted = newAdjusted
        .map((item) => {
          if (lettuceNames.includes(item.vegetable)) {
            return {
              ...item,
              total_cost: item.total_cost + unspecifiedLettuceCost * lettucePercentages[item.vegetable],
            };
          }
          if (item.vegetable === "LAITUE") return null;
          return item;
        })
        .filter(Boolean) as { vegetable: string; total_cost: number }[];
    }

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
