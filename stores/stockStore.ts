// stores/stockStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ProductType, Size, Color } from "./types";

export interface StockVariation {
  size: Size;
  color: Color;
  stock: number;
  price?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  type: ProductType;
  basePrice: number;
  active: boolean;
  variations: StockVariation[];
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  variationId?: string;
  type: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  size: Size;
  color: Color;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  createdAt: Date;
}

export const useStockStore = defineStore("stock", () => {
  // ---- State -------------------------------------------------
  const products = ref<Product[]>([]);
  const stockMovements = ref<StockMovement[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ---- Constants for filters ------------------------------------------------
  const allTypes: { value: ProductType | "all"; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "homme", label: "Homme" },
    { value: "femme", label: "Femme" },
    { value: "accessoires", label: "Accessoires" },
  ];

  const allSizes: { value: Size | "all"; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "XXS", label: "XXS" },
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
    { value: "XXXL", label: "XXXL" },
  ];

  const allColors: { value: Color | "all"; label: string }[] = [
    { value: "all", label: "Tout" },
    { value: "Black", label: "Black" },
    { value: "Navy", label: "Navy" },
    { value: "Olive", label: "Olive" },
    { value: "Sage", label: "Sage" },
    { value: "Camel", label: "Camel" },
    { value: "Marron", label: "Marron" },
    { value: "Beige", label: "Beige" },
    { value: "Tartan", label: "Tartan" },
  ];

  const sizeOrder: Size[] = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // ---- Getters ------------------------------------------------
  const getStockBySize = (product: Product, size: Size): number => {
    return product.variations
      .filter((v) => v.size === size)
      .reduce((sum, v) => sum + v.stock, 0);
  };

  const getStockBySizeAndColor = (
    product: Product,
    size: Size,
    color: Color
  ): number => {
    const variation = product.variations.find(
      (v) => v.size === size && v.color === color
    );
    return variation?.stock || 0;
  };

  const getColorsForProduct = (product: Product): Color[] => {
    const colors = new Set<Color>();
    product.variations.forEach((v) => colors.add(v.color));
    return Array.from(colors).sort();
  };

  const getTotalStockForProduct = (product: Product): number => {
    return product.variations.reduce((sum, v) => sum + v.stock, 0);
  };

  const getLowStockProducts = (threshold: number = 5): Product[] => {
    return products.value.filter((product) => {
      return product.variations.some((v) => v.stock < threshold);
    });
  };

  // ---- Actions ------------------------------------------------
  async function fetchProducts(type?: ProductType) {
    isLoading.value = true;
    error.value = null;

    try {
      const queryParams = type && type !== "all" ? `?type=${type}` : "";
      const response = await fetch(`/api/products${queryParams}`);
      const result = await response.json();

      if (result.success) {
        // Transform API response to match Product interface
        products.value = result.data.map((apiProduct: any) => ({
          id: apiProduct.id,
          sku: apiProduct.sku,
          name: apiProduct.name,
          type: apiProduct.type,
          basePrice: typeof apiProduct.basePrice === 'string' 
            ? parseFloat(apiProduct.basePrice) 
            : apiProduct.basePrice,
          active: apiProduct.active,
          variations: apiProduct.variations.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            price: typeof v.price === 'string' 
              ? parseFloat(v.price) 
              : v.price,
          })),
        }));
      } else {
        throw new Error(result.error || "Failed to fetch products");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors du chargement des produits";
      console.error("Error fetching products:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStockMovements(productId?: string, limit?: number) {
    isLoading.value = true;
    error.value = null;

    try {
      let url = "/api/stock/movements";
      const params = new URLSearchParams();
      if (productId) params.append("productId", productId);
      if (limit) params.append("limit", limit.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        stockMovements.value = result.data;
      } else {
        throw new Error(result.error || "Failed to fetch stock movements");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors du chargement des mouvements de stock";
      console.error("Error fetching stock movements:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStock(
    productId: string,
    variationId: string,
    size: Size,
    color: Color,
    quantityChange: number,
    movementType: string,
    notes?: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/stock/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          variationId,
          size,
          color,
          quantity: quantityChange,
          type: movementType,
          notes,
          referenceId,
          referenceType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh products to get updated stock levels
        await fetchProducts();
        return true;
      } else {
        throw new Error(result.error || "Failed to update stock");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors de la mise à jour du stock";
      console.error("Error updating stock:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStockVariation(
    productId: string,
    variationId: string,
    size: Size,
    color: Color,
    newStock: number,
    movementType: string = "ADJUSTMENT",
    notes?: string
  ): Promise<boolean> {
    const product = products.value.find((p) => p.id === productId);
    if (!product) {
      error.value = "Produit non trouvé";
      return false;
    }

    const currentStock = getStockBySizeAndColor(product, size, color);
    const quantityChange = newStock - currentStock;

    return await updateStock(
      productId,
      variationId,
      size,
      color,
      quantityChange,
      movementType,
      notes
    );
  }

  function getProductById(productId: string): Product | undefined {
    return products.value.find((p) => p.id === productId);
  }

  function getVariationBySizeAndColor(
    product: Product,
    size: Size,
    color: Color
  ): StockVariation | undefined {
    return product.variations.find(
      (v) => v.size === size && v.color === color
    );
  }

  return {
    products,
    stockMovements,
    isLoading,
    error,
    allTypes,
    allSizes,
    allColors,
    sizeOrder,
    getStockBySize,
    getStockBySizeAndColor,
    getColorsForProduct,
    getTotalStockForProduct,
    getLowStockProducts,
    fetchProducts,
    fetchStockMovements,
    updateStock,
    updateStockVariation,
    getProductById,
    getVariationBySizeAndColor,
  };
});
