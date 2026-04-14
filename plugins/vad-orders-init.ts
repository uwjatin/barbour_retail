// plugins/vad-orders-init.ts
// This plugin automatically fetches orders when the app initializes
export default defineNuxtPlugin(async () => {
  const vadStore = useVADStore();
  
  // Fetch all orders on app initialization
  // This ensures orders are loaded even if the store state was reset
  await vadStore.fetchOrders();
});
