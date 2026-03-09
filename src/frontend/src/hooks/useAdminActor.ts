/**
 * useAdminActor: Creates an actor initialized with the Caffeine admin token.
 * Used by the admin panel to ensure backend admin operations are authorized.
 * This is separate from useActor because the password-based admin auth needs
 * explicit admin token initialization even for anonymous (non-II) sessions.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";

const ADMIN_ACTOR_QUERY_KEY = "adminActor";

export function useAdminActor() {
  const queryClient = useQueryClient();
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ADMIN_ACTOR_QUERY_KEY],
    queryFn: async () => {
      const actor = await createActorWithConfig();
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      if (adminToken) {
        await actor._initializeAccessControlWithSecret(adminToken);
      }
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ADMIN_ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
