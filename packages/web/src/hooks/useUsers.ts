"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@chakra-ui/react";
import { UserProfile, UserStatus } from "@/types/user.types";

export type UserItem = {
  id: string;
  nome: string;
  usuario: string;
  perfil: UserProfile;
  situacao: UserStatus;
  dtInclusao: string;
};

export type ListUsersResponse = {
  users: UserItem[];
};

export type UpdateUserPayload = {
  id: string;
  nome: string;
  usuario: string;
  senha?: string | null;
  perfil: UserProfile;
  situacao: UserStatus;
};

export type CreateUserPayload = {
  nome: string;
  usuario: string;
  senha: string;
  perfil: UserProfile;
  situacao: UserStatus;
};

export function useUsers(perfil?: "admin" | "professor" | "aluno", onCloseModals?: () => void) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const listQuery = useQuery<UserItem[]>({
    queryKey: ["users", perfil],
    queryFn: async () => {
      const response = await api.get<ListUsersResponse>("/users");
      return response.data.users;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserPayload) => {
      const response = await api.post("/user", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        position: "top-right",
        description: data?.message ?? "Operação realizada com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (onCloseModals) onCloseModals();
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      if (onCloseModals) onCloseModals();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateUserPayload) => {
      const response = await api.put("/user", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        position: "top-right",
        description: data?.message ?? "Usuário atualizado com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (onCloseModals) onCloseModals();
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      if (onCloseModals) onCloseModals();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/user/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        position: "top-right",
        description: data?.message ?? "Operação realizada com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (onCloseModals) onCloseModals();
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      if (onCloseModals) onCloseModals();
    }
  });

  return {
    users: listQuery.data,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,

    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
