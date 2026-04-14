// stores/notificationStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type NotificationType = "SMS" | "EMAIL";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "CANCELLED";

export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  subject?: string;
  content: string;
  status: NotificationStatus;
  createdAt: Date;
  sentAt?: Date;
  reference?: string;
  orderId?: string;
  repairId?: string;
  error?: string;
}

export const useNotificationStore = defineStore("notification", () => {
  // ---- State -------------------------------------------------
  const notifications = ref<Notification[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ---- Getters ------------------------------------------------
  const pendingNotifications = computed(() =>
    notifications.value.filter((n) => n.status === "PENDING")
  );

  const historyNotifications = computed(() =>
    notifications.value.filter(
      (n) => n.status === "SENT" || n.status === "FAILED" || n.status === "CANCELLED"
    )
  );

  const pendingCount = computed(() => pendingNotifications.value.length);

  const sentCount = computed(() =>
    notifications.value.filter((n) => n.status === "SENT").length
  );

  const failedCount = computed(() =>
    notifications.value.filter((n) => n.status === "FAILED").length
  );

  // ---- Actions ------------------------------------------------
  async function fetchNotifications(status?: NotificationStatus, type?: NotificationType) {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (type) params.append("type", type);

      const response = await fetch(`/api/notifications?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        notifications.value = result.data.map((notif: any) => ({
          id: notif.id,
          type: notif.type,
          recipient: notif.recipient,
          subject: notif.subject,
          content: notif.content,
          status: notif.status,
          createdAt: new Date(notif.createdAt),
          sentAt: notif.sentAt ? new Date(notif.sentAt) : undefined,
          reference: notif.reference,
          orderId: notif.orderId,
          repairId: notif.repairId,
          error: notif.error,
        }));
      } else {
        throw new Error(result.error || "Failed to fetch notifications");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors du chargement des notifications";
      console.error("Error fetching notifications:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createNotification(
    type: NotificationType,
    recipient: string,
    content: string,
    subject?: string,
    orderId?: string,
    repairId?: string,
    reference?: string,
    customerId?: string
  ): Promise<Notification | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          recipient,
          subject,
          content,
          orderId,
          repairId,
          reference,
          customerId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newNotification = {
          id: result.data.id,
          type: result.data.type,
          recipient: result.data.recipient,
          subject: result.data.subject,
          content: result.data.content,
          status: result.data.status,
          createdAt: new Date(result.data.createdAt),
          sentAt: result.data.sentAt ? new Date(result.data.sentAt) : undefined,
          reference: result.data.reference,
          orderId: result.data.orderId,
          repairId: result.data.repairId,
          error: result.data.error,
        };

        notifications.value.unshift(newNotification);
        return newNotification;
      } else {
        throw new Error(result.error || "Failed to create notification");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors de la création de la notification";
      console.error("Error creating notification:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function validateAndSend(notificationId: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "SENT",
          sentAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        const notification = notifications.value.find((n) => n.id === notificationId);
        if (notification) {
          notification.status = "SENT";
          notification.sentAt = new Date();
        }
        return true;
      } else {
        throw new Error(result.error || "Failed to send notification");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors de l'envoi de la notification";
      console.error("Error sending notification:", err);
      
      const notification = notifications.value.find((n) => n.id === notificationId);
      if (notification) {
        notification.status = "FAILED";
        notification.error = err instanceof Error ? err.message : "Unknown error";
      }
      
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function cancelNotification(notificationId: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        const index = notifications.value.findIndex((n) => n.id === notificationId);
        if (index !== -1) {
          notifications.value[index].status = "CANCELLED";
        }
        return true;
      } else {
        throw new Error(result.error || "Failed to cancel notification");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors de l'annulation de la notification";
      console.error("Error canceling notification:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function markAsFailed(notificationId: string, errorMessage: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "FAILED",
          error: errorMessage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const notification = notifications.value.find((n) => n.id === notificationId);
        if (notification) {
          notification.status = "FAILED";
          notification.error = errorMessage;
        }
        return true;
      } else {
        throw new Error(result.error || "Failed to mark notification as failed");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la notification";
      console.error("Error marking notification as failed:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) {
      return "À l'instant";
    } else if (diffMins < 60) {
      return `Il y a ${diffMins}min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Il y a ${diffDays}j`;
    }
  }

  function formatPhoneNumber(phone: string): string {
    return phone.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  }

  function refreshNotifications() {
    fetchNotifications();
  }

  return {
    notifications,
    isLoading,
    error,
    pendingNotifications,
    historyNotifications,
    pendingCount,
    sentCount,
    failedCount,
    fetchNotifications,
    createNotification,
    validateAndSend,
    cancelNotification,
    markAsFailed,
    getRelativeTime,
    formatPhoneNumber,
    refreshNotifications,
  };
});
