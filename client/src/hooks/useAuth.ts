import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Sync user data with our backend
        try {
          const response = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              id: session.user.id,
              firstName: session.user.user_metadata?.first_name || session.user.email?.split('@')[0],
              lastName: session.user.user_metadata?.last_name || '',
            }),
          });

          if (response.ok) {
            const userData = await response.json();
            queryClient.setQueryData(["/api/auth/user"], userData);
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(["/api/auth/user"], null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      // First check Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return null;
      }

      // If we have a session, get user data from our backend
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          return await response.json();
        } else if (response.status === 401) {
          // If backend doesn't know about this user, sync them
          const syncResponse = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: session.user.email,
              id: session.user.id,
              firstName: session.user.user_metadata?.first_name || session.user.email?.split('@')[0],
              lastName: session.user.user_metadata?.last_name || '',
            }),
          });

          if (syncResponse.ok) {
            return await syncResponse.json();
          }
        }
        return null;
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
