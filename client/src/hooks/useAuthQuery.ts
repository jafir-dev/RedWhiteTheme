import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function useAuthQuery() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        return null;
      }

      // Get user data from our API to include spins, etc.
      const response = await fetch("/api/auth/user", {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}