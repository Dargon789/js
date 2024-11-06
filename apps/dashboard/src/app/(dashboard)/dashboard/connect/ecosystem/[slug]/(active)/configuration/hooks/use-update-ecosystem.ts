import { useLoggedInUser } from "@3rdweb-sdk/react/hooks/useLoggedInUser";
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Ecosystem } from "../../../../types";

export function useUpdateEcosystem(
  options?: Omit<UseMutationOptions<boolean, unknown, Ecosystem>, "mutationFn">,
) {
  const { onSuccess, ...queryOptions } = options || {};
  const { isLoggedIn, user } = useLoggedInUser();
  const queryClient = useQueryClient();

  return useMutation({
    // Returns true if the update was successful
    mutationFn: async (params: Ecosystem): Promise<boolean> => {
      if (!isLoggedIn || !user?.jwt) {
        throw new Error("Please login to update this ecosystem");
      }

      const res = await fetch(`${params.url}/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const body = await res.json();
        console.error(body);
        if (res.status === 401) {
          throw new Error("You're not authorized to update this ecosystem");
        }
        if (res.status === 406) {
          throw new Error(
            "Please setup billing on your account to continue managing this ecosystem",
          );
        }
        throw new Error(
          body?.message ?? body?.error?.message ?? "Failed to update ecosystem",
        );
      }

      return true;
    },
    onSuccess: async (partner, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ["ecosystems"],
      });
      if (onSuccess) {
        return onSuccess(partner, variables, context);
      }
      return;
    },
    ...queryOptions,
  });
}