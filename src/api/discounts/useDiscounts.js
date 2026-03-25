import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { discountApi } from "./discountApi";

const queryKey = ["admin", "discounts"];

export const useDiscountsQuery = () => {
  return useQuery({
    queryKey,
    queryFn: () => discountApi.list(),
    staleTime: 15_000,
  });
};

export const useCreateDiscountMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => discountApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
};

export const useUpdateDiscountMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => discountApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
};

export const useDeleteDiscountMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => discountApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old) =>
        Array.isArray(old) ? old.filter((d) => d.id !== id) : old,
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });
};

export const useToggleDiscountStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => discountApi.toggleStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData(queryKey);
      qc.setQueryData(queryKey, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((d) => (d.id === id ? { ...d, status } : d));
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });
};
