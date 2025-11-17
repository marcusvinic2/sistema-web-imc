"use client";

import {
  Flex,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
} from "@chakra-ui/react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { useLogin } from "@/hooks/useLogin";

export function DashboardHeader() {
  const { user } = useLogin();

  if (!user) return null;

  return (
    <Flex
      h="64px"
      align="center"
      justify="flex-end"
      px={8}
      bg="white"
      borderBottom="1px solid #E2E8F0"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Menu>
        <MenuButton as={Flex} align="center" gap={3} cursor="pointer">
          <Avatar size="sm" name={user.nome} icon={<FiUser />} />

          <Box textAlign="left">
            <Text fontWeight="bold" fontSize="sm">
              {user.nome}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {user.perfil}
            </Text>
          </Box>

          <FiChevronDown />
        </MenuButton>

        <MenuList>
          <MenuItem icon={<FiLogOut />}>
            Sair
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}
