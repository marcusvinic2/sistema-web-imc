"use client";

import { Box, Flex, Text, Button, Avatar } from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import { useLogin } from "@/hooks/useLogin";

export function SidebarUserProfile() {
  const { user, logout } = useLogin();

  if (!user) return null;

  const profileLabel = {
    admin: "Administrador",
    professor: "Professor",
    aluno: "Aluno",
  }[user.perfil];

  return (
    <Box
      w="100%"
      borderTop="1px solid"
      borderColor="gray.200"
      p={4}
      mt="auto"
    >
      <Flex align="center" gap={3}>
        <Avatar name={user.nome} size="sm" bg="blue.500" />

        <Box flex="1">
          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
            {user.nome}
          </Text>
          <Text fontSize="xs" color="green.300">
            {profileLabel}
          </Text>
        </Box>

        <Button
          size="sm"
          variant="ghost"
          color="red.300"
          _hover={{ color: "red.500", bg: "whiteAlpha.100" }}
          onClick={logout}
        >
          <FiLogOut size={18} />
        </Button>
      </Flex>
    </Box>
  );
}
