"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { api } from "@/lib/api";

export type EvaluationItem = {
  id: string;
  altura: number;
  peso: number;
  imc: number;
  classificacao: string;
  dtInclusao: string;
  professorId: string;
};

type EvaluationResponse = {
  avaliacao: EvaluationItem[];
};

export type CreateEvaluationPayload = {
  altura: number;
  peso: number;
  alunoId: string;
};

export type UpdateEvaluationPayload = {
  id: string;
  altura: number;
  peso: number;
};

export type EvaluationFilters = {
  alunoId?: string | null;
  professorId?: string | null;
};

export function useUserEvaluations(
  userId: string | null,
  filters?: EvaluationFilters
) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const listQuery = useQuery<EvaluationItem[]>({
    queryKey: ["evaluations", userId],
    enabled: !!userId && !filters?.alunoId && !filters?.professorId,
    queryFn: async () => {
      const response = await api.get<EvaluationResponse>(
        `/avaliation-imc/${userId}`
      );
      return response.data.avaliacao;
    },
  });

  const filterQuery = useQuery<EvaluationItem[]>({
    queryKey: ["evaluations-filter", filters],
    enabled:
      !!filters?.alunoId || !!filters?.professorId,
    queryFn: async () => {
      const response = await api.post<EvaluationResponse>(
        "/avaliation-imc/filter",
        {
          alunoId: filters?.alunoId ?? null,
          professorId: filters?.professorId ?? null,
        }
      );
      return response.data.avaliacao;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateEvaluationPayload) => {
      const response = await api.post("/avaliation-imc", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        position: "top-right",
        description: data?.message ?? "Avaliação criada com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["evaluations-filter"] });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Erro!",
        position: "top-right",
        description:
          err.response?.data?.message ??
          "Não foi possível realizar a operação.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateEvaluationPayload) => {
      const response = await api.put(`/avaliation-imc/${data.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        position: "top-right",
        description: data?.message ?? "Avaliação atualizada com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["evaluations-filter"] });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Erro!",
        position: "top-right",
        description:
          err.response?.data?.message ??
          "Não foi possível realizar a operação.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (evaluationId: string) => {
      const response = await api.delete(`/avaliation-imc/${evaluationId}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        position: "top-right",
        description: data?.message ?? "Avaliação deletada com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["evaluations-filter"] });
    },
    onError: (error) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Erro!",
        position: "top-right",
        description:
          err.response?.data?.message ??
          "Não foi possível realizar a operação.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const data =
    filterQuery.data && (filters?.alunoId || filters?.professorId)
      ? filterQuery.data
      : listQuery.data;

  return {
    data,
    isLoading: listQuery.isLoading || filterQuery.isLoading,
    isError: listQuery.isError || filterQuery.isError,

    createEvaluation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateEvaluation: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteEvaluation: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
