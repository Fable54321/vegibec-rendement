import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export const useDeleteSupervisor = () => {
  const { token } = useAuth();
  const { refetchSupervisors } = useSupervisors();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteSupervisor = async (supervisor: string) => {
    if (!supervisor) {
      setError("Le nom du superviseur est requis");
      return;
    }

    if (!token) {
      setError("Utilisateur non authentifié");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/supervisors/${encodeURIComponent(supervisor)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      await response.json();
      await refetchSupervisors();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error deleting supervisor:", err);
      setError(err.message || "Erreur lors de la suppression");
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
