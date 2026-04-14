// stores/dashboardStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface RevenueData {
  boutique: number;
  web: number;
  atelier: number;
  total: number;
}

export interface RevenueChange {
  boutique: number;
  web: number;
  atelier: number;
  total: number;
}

export interface StockAlert {
  id: string;
  name: string;
  size: string;
  currentStock: number;
  threshold: number;
}

export interface AtelierStats {
  pendingQuotes: number;
  inProgress: number;
  readyForPickup: number;
}

export interface TopSale {
  rank: number;
  name: string;
  sales: number;
}

export interface AISuggestion {
  icon: string;
  title: string;
  subtitle: string;
  action: string;
}

export interface DashboardData {
  totalSales: {
    amount: number;
    count: number;
  };
  totalRepairs: {
    amount: number;
    count: number;
  };
  pendingOrders: number;
  inProgressRepairs: number;
  lowStockCount: number;
  dailySales: any[];
  topProducts: any[];
}

export const useDashboardStore = defineStore("dashboard", () => {
  // ---- State -------------------------------------------------
  const revenue = ref<RevenueData>({
    boutique: 0,
    web: 0,
    atelier: 0,
    total: 0,
  });

  const revenueChange = ref<RevenueChange>({
    boutique: 0,
    web: 0,
    atelier: 0,
    total: 0,
  });

  const stockAlerts = ref<StockAlert[]>([]);

  const atelierStats = ref<AtelierStats>({
    pendingQuotes: 0,
    inProgress: 0,
    readyForPickup: 0,
  });

  const topSales = ref<TopSale[]>([]);

  const aiSuggestions = ref<AISuggestion[]>([
    {
      icon: "🌧️",
      title: "Pluie prévue 10-15 février",
      subtitle: "Prévision : 45mm sur 5 jours",
      action: "Commander +15 unités Veste Imperméable (focus M/L)",
    },
    {
      icon: "📊",
      title: "Rupture concurrent",
      subtitle: "Opportunité de marché identifiée",
      action: "Anticiper demande sur produits similaires",
    },
    {
      icon: "📈",
      title: "Pic média",
      subtitle: "Mention dans presse spécialisée",
      action: "Prévoir stock supplémentaire",
    },
  ]);

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);
  const dashboardData = ref<DashboardData | null>(null);

  // ---- Getters ------------------------------------------------
  const criticalStockCount = computed(() => stockAlerts.value.length);
  
  const atelierTotalActive = computed(() => 
    atelierStats.value.pendingQuotes + atelierStats.value.inProgress
  );

  const hasRevenueIncrease = computed(() => revenueChange.value.total > 0);

  const totalRevenue = computed(() => 
    revenue.value.boutique + revenue.value.web + revenue.value.atelier
  );

  // ---- Actions ------------------------------------------------
  async function fetchDashboardData() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        
        dashboardData.value = data;

        revenue.value = {
          boutique: parseFloat(data.totalSales.amount) || 0,
          web: 0,
          atelier: parseFloat(data.totalRepairs.amount) || 0,
          total: (parseFloat(data.totalSales.amount) || 0) + (parseFloat(data.totalRepairs.amount) || 0),
        };

        atelierStats.value = {
          pendingQuotes: data.pendingOrders || 0,
          inProgress: data.inProgressRepairs || 0,
          readyForPickup: 0,
        };

        topSales.value = (data.topProducts || []).slice(0, 5).map((product: any, index: number) => ({
          rank: index + 1,
          name: product.name,
          sales: parseInt(product.total_quantity) || 0,
        }));

        stockAlerts.value = [];

        revenueChange.value = {
          boutique: 12,
          web: -5,
          atelier: 18,
          total: 9,
        };

        lastUpdated.value = new Date();
      } else {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors du chargement du dashboard";
      console.error("Error fetching dashboard:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function refreshData() {
    fetchDashboardData();
  }

  function orderProduct(productId: string) {
    console.log(`Commande produit ${productId}`);
  }

  function createSupplierOrder(suggestionIndex: number) {
    const suggestion = aiSuggestions.value[suggestionIndex];
    console.log(`Création commande fournisseur: ${suggestion?.action}`);
  }

  return {
    revenue,
    revenueChange,
    stockAlerts,
    atelierStats,
    topSales,
    aiSuggestions,
    isLoading,
    error,
    lastUpdated,
    dashboardData,
    criticalStockCount,
    atelierTotalActive,
    hasRevenueIncrease,
    totalRevenue,
    fetchDashboardData,
    refreshData,
    orderProduct,
    createSupplierOrder,
  };
});
