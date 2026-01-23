import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";

const API_BASE_URL = "https://vegibec-rendement-backend.onrender.com";

export const useAddSupervisor = () => {
  const { token } = useAuth();

  const { refetchSupervisors } = useSupervisors();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSupervisor = async (supervisor: string) => {
    if (!supervisor.trim()) {
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
      const response = await fetch(`${API_BASE_URL}/supervisors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supervisor: supervisor.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'ajout");
      }

      await response.json(); // optional payload

      refetchSupervisors();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error adding supervisor:", err);
      setError(err.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return { handleAddSupervisor, loading, error };
};
