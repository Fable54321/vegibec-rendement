import { useState } from "react";
import { useSupervisors } from "@/context/supervisors/SupervisorContext";

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
      const response = await fetch(`/supervisors`, {
        method: "POST",

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
