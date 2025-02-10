import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const fetchNotifications = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

const markNotificationAsRead = async (id) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) throw error;
};

const useNotifications = (userId) => {
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsRead = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["notifications", userId]);
      const previousNotifications = queryClient.getQueryData([
        "notifications",
        userId,
      ]);
      queryClient.setQueryData(["notifications", userId], (old) =>
        old.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["notifications", userId],
        context.previousNotifications
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["notifications", userId]);
    },
  });

  return {
    notifications,
    loading: isLoading,
    markAsRead: (id) => markAsRead.mutate(id),
    refetchNotifications: refetch,
  };
};

export default useNotifications;
