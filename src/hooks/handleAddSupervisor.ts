import { useState } from "react";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type AddedSupervisorResponse = {
  id?: number;
  supervisor?: string;
  message?: string;
};

export const useAddSupervisor = () => {
  const { refetchSupervisors } = useSupervisors();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSupervisor = async (supervisor: string) => {
    if (!supervisor.trim()) {
      setError("Le nom du superviseur est requis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchWithAuth<AddedSupervisorResponse>("/supervisors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          supervisor: supervisor.trim(),
        }),
      });

      await refetchSupervisors();
    } catch (err: unknown) {
      console.error("Error adding supervisor:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return { handleAddSupervisor, loading, error };
};
