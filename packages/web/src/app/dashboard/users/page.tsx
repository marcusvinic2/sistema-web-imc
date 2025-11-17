"use client";
import { UsersManagement } from "@/components/users/UsersManagement";
import { Box, Alert, AlertIcon } from "@chakra-ui/react";
import { useLogin } from "@/hooks/useLogin";

export default function UsersPage() {
  const { user } = useLogin();

  if (!user || user.perfil === "aluno") {
    return (
      <Alert status="warning" mt={4}>
        <AlertIcon />
        Você não tem permissão para acessar esta página.
      </Alert>
    );
  }

  return (
    <Box p={1}>
      <UsersManagement />
    </Box>
  );
}
