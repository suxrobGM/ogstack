"use client";

import { ERROR_CODES } from "@ogstack/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSubscriptionPlanLimit } from "@/providers/subscription-provider";
import { useToast } from "./use-toast";

type MutationFn<TData, TVariables> = (variables: TVariables) => Promise<{
  data: TData | null;
  error: unknown;
}>;

interface EdenError extends Error {
  value: { message: string; code?: string };
}

interface UseApiMutationOptions<TData, TVariables> {
  invalidateKeys?: readonly (readonly unknown[])[];
  successMessage?: string | ((data: TData) => string);
  errorMessage?: string | ((error: EdenError) => string);
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: EdenError) => void;
}

/**
 * Wraps `useMutation` with Eden Treaty response unwrapping, query invalidation, and toast notifications.
 * Detects plan limit errors (code: PLAN_LIMIT_EXCEEDED) and shows the upgrade dialog instead of a generic toast.
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFn: MutationFn<TData, TVariables>,
  options?: UseApiMutationOptions<TData, TVariables>,
) {
  const queryClient = useQueryClient();
  const notification = useToast();
  const { showUpgradePrompt } = useSubscriptionPlanLimit();

  return useMutation<TData, EdenError, TVariables>({
    mutationFn: async (variables) => {
      const { data, error } = await mutationFn(variables);
      if (error) {
        const body = (error as { value?: { message?: string; code?: string } }).value;
        const err = new Error(body?.message ?? "Request failed") as EdenError;
        err.value = { message: body?.message ?? "", code: body?.code };
        throw err;
      }
      return data as TData;
    },
    onSuccess: (data, variables) => {
      options?.invalidateKeys?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key as unknown[] }),
      );

      if (options?.successMessage) {
        const msg =
          typeof options.successMessage === "function"
            ? options.successMessage(data)
            : options.successMessage;
        notification.success(msg);
      }

      options?.onSuccess?.(data, variables);
    },
    onError: (error) => {
      if (error.value?.code === ERROR_CODES.PLAN_LIMIT_EXCEEDED) {
        showUpgradePrompt(error.message);
        return;
      }

      if (options?.onError) {
        options.onError(error);
      } else if (options?.errorMessage) {
        const msg =
          typeof options.errorMessage === "function"
            ? options.errorMessage(error)
            : options.errorMessage;
        notification.error(msg);
      } else {
        notification.error(error.message ?? "Something went wrong");
      }
    },
  });
}
