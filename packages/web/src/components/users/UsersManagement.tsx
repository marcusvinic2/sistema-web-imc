"use client";

import React, { useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  Button,
  HStack,
  Tag,
  TagLabel,
  useDisclosure,
  Text,
  TableContainer
} from "@chakra-ui/react";

import { useUsers } from "@/hooks/useUsers";
import { useLogin } from "@/hooks/useLogin";
import { EditUserModal } from "./EditUserModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { CreateUserModal } from "./CreateUserModal";
import { UserProfile, UserStatus } from "@/types/user.types";

export type UserItem = {
  id: string;
  nome: string;
  usuario: string;
  perfil: UserProfile;
  situacao: UserStatus;
  dtInclusao: string;
};

export function UsersManagement(): JSX.Element {
  const { user } = useLogin();

  const isAdmin = user?.perfil === "admin";
  const isProfessor = user?.perfil === "professor";

  const filterProfile = isProfessor ? "aluno" : undefined;

  const handleCloseModals = () => {
    editModal.onClose();
    deleteModal.onClose();
    createModal.onClose();
  };

  const {
    users,
    isLoading,
    isError,
    deleteUser,
    isDeleting
  } = useUsers(filterProfile, handleCloseModals);

  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const createModal = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const handleEdit = (u: UserItem): void => {
    setSelectedUser(u);
    editModal.onOpen();
  };

  const handleDelete = (u: UserItem): void => {
    setSelectedUser(u);
    deleteModal.onOpen();
  };

  if (isLoading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        Erro ao carregar usuários.
      </Alert>
    );
  }

  return (
    <>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Usuários</Heading>

          {(isAdmin || isProfessor) && (
            <Flex justify="flex-end">
              <Button colorScheme="green" onClick={createModal.onOpen}>
                Novo Usuário
              </Button>
            </Flex>
          )}
        </Flex>

        <TableContainer
          w="100%"
          overflowX="auto"
          display={{ base: "none", md: "block" }}
          bg="gray.200"
          rounded="md"
          shadow="sm"
        >
          <Table
            variant="striped"
            colorScheme="gray"
            display={{ base: "none", md: "table" }}
          >
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Usuário</Th>
                <Th>Perfil</Th>
                <Th>Situação</Th>
                <Th>Data</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>

            <Tbody>
              {users?.map((u: UserItem) => {
                const canEdit = isAdmin || (isProfessor && u.perfil === "aluno");
                const canDelete = isAdmin && u.perfil !== "admin";

                return (
                  <Tr key={u.id}>
                    <Td>{u.nome}</Td>
                    <Td>{u.usuario}</Td>

                    <Td>
                      <Tag colorScheme="blue">
                        <TagLabel>{u.perfil}</TagLabel>
                      </Tag>
                    </Td>

                    <Td>
                      <Tag colorScheme={u.situacao === "ativo" ? "green" : "red"}>
                        <TagLabel>{u.situacao}</TagLabel>
                      </Tag>
                    </Td>

                    <Td>
                      {new Date(u.dtInclusao).toLocaleDateString("pt-BR")}
                    </Td>

                    <Td>
                      <HStack>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          isDisabled={!canEdit}
                          onClick={() => handleEdit(u)}
                        >
                          Editar
                        </Button>

                        {canDelete && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            isLoading={isDeleting}
                            onClick={() => handleDelete(u)}
                          >
                            Excluir
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex
          direction="column"
          gap={4}
          display={{ base: "flex", md: "none" }}
        >
          {users?.map((u: UserItem) => {
            const canEdit = isAdmin || (isProfessor && u.perfil === "aluno");
            const canDelete = isAdmin && u.perfil !== "admin";

            return (
              <Box
                key={u.id}
                p={4}
                bg="white"
                borderWidth="1px"
                rounded="md"
                shadow="sm"
              >
                <Text><b>Nome:</b> {u.nome}</Text>
                <Text><b>Usuário:</b> {u.usuario}</Text>

                <Text mt={1}>
                  <b>Perfil:</b>{" "}
                  <Tag colorScheme="blue" ml={2}>
                    <TagLabel>{u.perfil}</TagLabel>
                  </Tag>
                </Text>

                <Text mt={1}>
                  <b>Situação:</b>{" "}
                  <Tag
                    ml={2}
                    colorScheme={u.situacao === "ativo" ? "green" : "red"}
                  >
                    <TagLabel>{u.situacao}</TagLabel>
                  </Tag>
                </Text>

                <Text mt={1}>
                  <b>Data:</b> {new Date(u.dtInclusao).toLocaleDateString("pt-BR")}
                </Text>

                <HStack mt={4}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    isDisabled={!canEdit}
                    onClick={() => handleEdit(u)}
                  >
                    Editar
                  </Button>

                  {canDelete && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      isLoading={isDeleting}
                      onClick={() => handleDelete(u)}
                    >
                      Excluir
                    </Button>
                  )}
                </HStack>
              </Box>
            );
          })}
        </Flex>
      </Box>

      {selectedUser && (
        <EditUserModal
          isOpen={editModal.isOpen}
          onClose={editModal.onClose}
          user={selectedUser}
        />
      )}

      <CreateUserModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
      />

      {selectedUser && (
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
          onConfirm={() => deleteUser(selectedUser.id)}
          title="Excluir Usuário"
          message={`Tem certeza que deseja excluir o usuário ${selectedUser.nome}?`}
        />
      )}
    </>
  );
}
