"use client";

import {
  Box,
  Flex,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  VStack,
  Text,
  useDisclosure,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { FiMenu, FiHome, FiUsers } from "react-icons/fi";
import Link from "next/link";
import type { Route } from "next";
import { SidebarUserProfile } from "./SidebarUserProfile";

const menuItems: Array<{
  label: string;
  icon: React.ElementType;
  href: Route;
}> = [
    { label: "Avaliações", icon: FiHome, href: "/dashboard" as Route },
    { label: "Usuários", icon: FiUsers, href: "/dashboard/users" as Route },
  ];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const SidebarContent = (
    <VStack
      align="stretch"
      p={{ base: 0, md: 4 }}
      w="250px"
      bg={{ base: "transparent", md: useColorModeValue("gray.100", "gray.900") }}
      h={{ base: "100%", md: "100vh" }}
      overflowY={{ base: "auto", md: "hidden" }}
      spacing={4}
    >
      <Image
        src="https://sooro.com.br/wp-content/uploads/2020/09/sooro-by-the-way.png"
        alt="IMC System Logo"
        height="48px"
        display={{ base: "none", md: "block" }}
        objectFit="contain"
      />

      <VStack align="stretch" spacing={2} px={{ base: 4, md: 0 }}>
        {menuItems.map((item) => (
          <Flex
            key={item.label}
            onClick={onClose}
            as={Link}
            href={item.href}
            align="center"
            gap={3}
            p={3}
            borderRadius="md"
            _hover={{ bg: "blue.500", color: "white" }}
            cursor="pointer"
          >
            <item.icon />
            <Text>{item.label}</Text>
          </Flex>
        ))}
      </VStack>

      <SidebarUserProfile />
    </VStack>
  );


  return (
    <>
      <Flex
        display={{ base: "flex", md: "none" }}
        p={4}
        bg="blue.600"
        color="white"
        justify="space-between"
        align="center"
      >
        <Image
          src="https://sooro.com.br/wp-content/uploads/2020/09/sooro-by-the-way.png"
          alt="IMC System Logo"
          height="32px"
          objectFit="contain"
        />
        <IconButton
          icon={<FiMenu />}
          aria-label="Open menu"
          onClick={onOpen}
          colorScheme="whiteAlpha"
        />
      </Flex>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>{SidebarContent}</DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box display={{ base: "none", md: "block" }} position="fixed" left="0">
        {SidebarContent}
      </Box>

      <Box ml={{ base: 0, md: "250px" }} p={6}>
        {children}
      </Box>
    </>
  );
}
