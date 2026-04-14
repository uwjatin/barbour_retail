// composables/useRepairWorkflow.ts
import { computed, ref } from "vue";
import { useRepairStore, type Repair, type RepairStatus } from "@/stores/repairStore";

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

export const statusConfig: Record<RepairStatus, StatusConfig> = {
  devis_envoye: {
    label: "Devis envoyé",
    color: "#F59E0B",
    bgColor: "bg-alert/20",
    textColor: "text-alert",
    icon: "📋",
  },
  en_cours: {
    label: "En cours",
    color: "#113e1c",
    bgColor: "bg-primary/20",
    textColor: "text-primary",
    icon: "⏳",
  },
  pret_a_retirer: {
    label: "Prêt à retirer",
    color: "#059669",
    bgColor: "bg-secondary/20",
    textColor: "text-secondary",
    icon: "✅",
  },
  termine: {
    label: "Terminé",
    color: "#6B7280",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    icon: "✓",
  },
};

export function useRepairWorkflow() {
  const repairStore = useRepairStore();

  // ---- Computed ------------------------------------------------
  const repairs = computed(() => repairStore.repairs);
  const enCoursCount = computed(() => repairStore.enCoursCount);
  const pretARetirerCount = computed(() => repairStore.pretARetirerCount);
  const devisEnvoyeCount = computed(() => repairStore.devisEnvoyeCount);

  // ---- Helpers ------------------------------------------------
  
  function getStatusConfig(status: RepairStatus): StatusConfig {
    return statusConfig[status];
  }

  function getStatusLabel(status: RepairStatus): string {
    return statusConfig[status].label;
  }

  function getStatusClasses(status: RepairStatus): string {
    return `${statusConfig[status].bgColor} ${statusConfig[status].textColor}`;
  }

  function getActionButtonLabel(status: RepairStatus): string {
    switch (status) {
      case "devis_envoye":
        return "Voir";
      case "en_cours":
        return "Voir";
      case "pret_a_retirer":
        return "Encaisser";
      case "termine":
        return "Voir";
      default:
        return "Voir";
    }
  }

  function getActionButtonClass(status: RepairStatus): string {
    switch (status) {
      case "pret_a_retirer":
        return "bg-secondary hover:bg-secondary/90";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  }

  function formatRepairId(id: string): string {
    return id;
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  // ---- Workflow Actions ------------------------------------------------
  
  async function handleCreateRepair(formData: {
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    description: string;
    photos?: string[];
    amount?: number;
    estimatedDays?: number;
  }) {
    return await repairStore.createRepair({
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      description: formData.description,
      status: "devis_envoye",
      amount: formData.amount,
      estimatedDays: formData.estimatedDays,
    });
  }

  async function handleViewRepair(repair: Repair) {
    selectedRepair.value = repair;
    // Navigation vers détail ou ouverture modal
    console.log("Voir détail:", repair.id);
  }

  async function handleCheckoutRepair(repair: Repair): Promise<string> {
    // Retourne l'URL de redirection vers la caisse avec le dossier pré-sélectionné
    console.log("Encaisser:", repair.id);
    // Retourne l'URL pour navigation
    return `/pos?repairId=${repair.id}&amount=${repair.amount}`;
  }

  async function handleStatusChange(repairId: string, newStatus: RepairStatus) {
    repairStore.updateRepairStatus(repairId, newStatus);
  }

  return {
    // State
    repairs,
    enCoursCount,
    pretARetirerCount,
    devisEnvoyeCount,
    
    // Helpers
    getStatusConfig,
    getStatusLabel,
    getStatusClasses,
    getActionButtonLabel,
    getActionButtonClass,
    formatRepairId,
    formatDate,
    
    // Actions
    handleCreateRepair,
    handleViewRepair,
    handleCheckoutRepair,
    handleStatusChange,
  };
}
