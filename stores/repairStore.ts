// stores/repairStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type RepairStatus = 
  | "devis_envoye" 
  | "en_cours" 
  | "pret_a_retirer" 
  | "termine";

export interface Repair {
  id: string;
  repairNumber: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  description: string;
  status: RepairStatus;
  amount?: number;
  estimatedDays?: number;
  isPaid?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const useRepairStore = defineStore("repair", () => {
  // ---- State -------------------------------------------------
  const repairs = ref<Repair[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ---- Getters ------------------------------------------------
  const enCoursCount = computed(() => 
    repairs.value.filter(r => r.status === "en_cours").length
  );
  
  const pretARetirerCount = computed(() => 
    repairs.value.filter(r => r.status === "pret_a_retirer").length
  );

  const devisEnvoyeCount = computed(() => 
    repairs.value.filter(r => r.status === "devis_envoye").length
  );

  const terminesCount = computed(() => 
    repairs.value.filter(r => r.status === "termine").length
  );

  const repairsByStatus = computed(() => {
    const grouped: Record<RepairStatus, Repair[]> = {
      devis_envoye: [],
      en_cours: [],
      pret_a_retirer: [],
      termine: [],
    };
    repairs.value.forEach(r => {
      grouped[r.status].push(r);
    });
    return grouped;
  });

  // ---- Actions ------------------------------------------------
  async function fetchRepairs(status?: RepairStatus) {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const response = await fetch(`/api/repairs?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        repairs.value = result.data.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
          amount: r.amount ? parseFloat(r.amount) : undefined,
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch repairs');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching repairs:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function createRepair(data: Omit<Repair, "id" | "repairNumber" | "createdAt" | "updatedAt">) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newRepair = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
          amount: result.data.amount ? parseFloat(result.data.amount) : undefined,
        };
        repairs.value.push(newRepair);
        return newRepair;
      } else {
        throw new Error(result.error || 'Failed to create repair');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error creating repair:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateRepairStatus(id: string, status: RepairStatus) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/repairs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const repair = repairs.value.find(r => r.id === id);
        if (repair) {
          repair.status = status;
          repair.updatedAt = new Date();
        }
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update repair status');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating repair status:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateRepair(id: string, data: Partial<Repair>) {
    isLoading.value = true;
    error.value = null;

    console.log('=== updateRepair called ===');
    console.log('ID:', id);
    console.log('Data being sent:', data);

    try {
      const response = await fetch(`/api/repairs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (result.success) {
        // Update the local state with the full response data (includes customer)
        const index = repairs.value.findIndex(r => r.id === id);
        if (index !== -1) {
          repairs.value[index] = {
            ...result.data,
            createdAt: new Date(result.data.createdAt),
            updatedAt: new Date(result.data.updatedAt),
            amount: result.data.amount ? parseFloat(result.data.amount) : undefined,
          };
        }
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update repair');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error updating repair:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteRepair(id: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/repairs/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        repairs.value = repairs.value.filter(r => r.id !== id);
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete repair');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error deleting repair:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function getRepairById(id: string) {
    return repairs.value.find(r => r.id === id);
  }

  return {
    repairs,
    isLoading,
    error,
    enCoursCount,
    pretARetirerCount,
    devisEnvoyeCount,
    terminesCount,
    repairsByStatus,
    fetchRepairs,
    createRepair,
    updateRepairStatus,
    updateRepair,
    deleteRepair,
    getRepairById,
  };
});
