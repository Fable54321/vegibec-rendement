import { useState } from "react";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type DeleteSupervisorResponse = {
  deleted?: string;
  message?: string;
};

export const useDeleteSupervisor = () => {
  const { refetchSupervisors } = useSupervisors();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteSupervisor = async (supervisor: string) => {
    if (!supervisor.trim()) {
      setError("Le nom du superviseur est requis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchWithAuth<DeleteSupervisorResponse>(
        `/supervisors/${encodeURIComponent(supervisor.trim())}`,
        {
          method: "DELETE",
        },
      );

      console.log("Deleted supervisor:", result.deleted);

      await refetchSupervisors();
    } catch (err: unknown) {
      console.error("Error deleting supervisor:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    handleDeleteSupervisor,
    loading,
    error,
  };
};
