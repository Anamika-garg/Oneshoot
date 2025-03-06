import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const fetchNotifications = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch notifications");
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }

  return data;
};

const markNotificationAsRead = async (id) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }

  return { id, success: true };
};

const useNotifications = (userId) => {
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const markAsRead = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["notifications", userId]);

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData([
        "notifications",
        userId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["notifications", userId],
        (old) =>
          old?.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          ) || []
      );

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      console.error("Error in markAsRead mutation:", err);
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["notifications", userId],
        context.previousNotifications
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync with the server
      queryClient.invalidateQueries(["notifications", userId]);
    },
  });

  return {
    notifications,
    loading: isLoading,
    error,
    markAsRead: (id) => markAsRead.mutate(id),
    refetchNotifications: refetch,
  };
};

export default useNotifications;
