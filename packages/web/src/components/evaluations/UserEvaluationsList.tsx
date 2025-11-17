"use client";

import {
  Box,
  Heading,
  Spinner,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Flex,
  Button,
  HStack,
  useDisclosure,
  TableContainer,
} from "@chakra-ui/react";

import { useState } from "react";

import {
  useUserEvaluations,
  type EvaluationItem,
  type EvaluationFilters,
} from "@/hooks/useUserEvaluations";

import { useLogin } from "@/hooks/useLogin";

import { EditEvaluationModal } from "./EditEvaluationModal";
import { DeleteEvaluationModal } from "./DeleteEvaluationModal";
import { CreateEvaluationModal } from "./CreateEvaluationModal";

import {
  EvaluationsFilterDrawer,
  type EvaluationFilterData,
} from "./EvaluationsFilterDrawer";

export function UserEvaluationsList(): JSX.Element {
  const { user } = useLogin();

  const isAdmin = user?.perfil === "admin";
  const isProfessor = user?.perfil === "professor";
  const isAluno = user?.perfil === "aluno";

  const [filters, setFilters] = useState<EvaluationFilterData>({
    alunoId: undefined,
    professorId: undefined,
  });

  const filterDrawer = useDisclosure();

  const userById =
    isAluno ? user?.id ?? null : filters.alunoId || user?.id || null;

  const {
    data,
    isLoading,
    isError,
    deleteEvaluation,
    isDeleting,
  } = useUserEvaluations(userById, filters as EvaluationFilters);

  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [selected, setSelected] = useState<EvaluationItem | null>(null);

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
        Ocorreu um erro ao carregar as avaliações.
      </Alert>
    );
  }

  const listShow = data ?? [];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Avaliações IMC</Heading>

        {(isAdmin || isProfessor) && (
          <Flex
            justify="space-between"
            gap={4}
            direction={{ base: "column", md: "row" }}
          >
            <Button variant="outline" colorScheme="blue" onClick={filterDrawer.onOpen}>
              Filtros
            </Button>

            <Button colorScheme="green" onClick={createModal.onOpen}>
              Criar Avaliação
            </Button>
          </Flex>
        )}
      </Flex>

      {listShow.length === 0 && (
        <Alert status="info">
          <AlertIcon />
          Nenhuma avaliação encontrada.
        </Alert>
      )}

      {listShow.length > 0 && (
        <TableContainer
          w="100%"
          overflowX="auto"
          display={{ base: "none", md: "block" }}
          bg="gray.200"
          rounded="md"
          shadow="sm"
        >
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th>Altura</Th>
                <Th>Peso (kg)</Th>
                <Th>IMC</Th>
                <Th>Classificação</Th>
                {(isAdmin || isProfessor) && <Th>Ações</Th>}
              </Tr>
            </Thead>

            <Tbody>
              {listShow.map((item) => {
                const canEdit =
                  isAdmin || (isProfessor && item.professorId === user?.id);
                const canDelete = isAdmin;

                return (
                  <Tr key={item.id}>
                    <Td>{new Date(item.dtInclusao).toLocaleDateString("pt-BR")}</Td>
                    <Td>{Number(item.altura).toFixed(2)}</Td>
                    <Td>{item.peso}</Td>
                    <Td>{item.imc.toFixed(2)}</Td>
                    <Td>
                      <Text fontWeight="bold">{item.classificacao}</Text>
                    </Td>

                    {(isAdmin || isProfessor) && (
                      <Td>
                        <HStack spacing={3}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            isDisabled={!canEdit}
                            onClick={() => {
                              setSelected(item);
                              editModal.onOpen();
                            }}
                          >
                            Editar
                          </Button>

                          {canDelete && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              isLoading={isDeleting}
                              onClick={() => {
                                setSelected(item);
                                deleteModal.onOpen();
                              }}
                            >
                              Excluir
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {listShow.length > 0 && (
        <Flex
          direction="column"
          gap={4}
          display={{ base: "flex", md: "none" }}
        >
          {listShow.map((item) => {
            const canEdit =
              isAdmin || (isProfessor && item.professorId === user?.id);
            const canDelete = isAdmin;

            return (
              <Box
                key={item.id}
                p={4}
                borderWidth="1px"
                rounded="md"
                bg="white"
                shadow="sm"
              >
                <Text><b>Data:</b> {new Date(item.dtInclusao).toLocaleDateString("pt-BR")}</Text>
                <Text><b>Altura:</b> {Number(item.altura).toFixed(2)}</Text>
                <Text><b>Peso:</b> {item.peso}</Text>
                <Text><b>IMC:</b> {item.imc.toFixed(2)}</Text>
                <Text><b>Classificação:</b> {item.classificacao}</Text>

                {(isAdmin || isProfessor) && (
                  <HStack mt={3}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      isDisabled={!canEdit}
                      onClick={() => {
                        setSelected(item);
                        editModal.onOpen();
                      }}
                    >
                      Editar
                    </Button>

                    {canDelete && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        isLoading={isDeleting}
                        onClick={() => {
                          setSelected(item);
                          deleteModal.onOpen();
                        }}
                      >
                        Excluir
                      </Button>
                    )}
                  </HStack>
                )}
              </Box>
            );
          })}
        </Flex>
      )}

      <EvaluationsFilterDrawer
        isOpen={filterDrawer.isOpen}
        onClose={filterDrawer.onClose}
        filters={filters}
        onFilter={setFilters}
      />

      <CreateEvaluationModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        userId={userById!}
      />

      <EditEvaluationModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        evaluation={selected}
        userId={userById!}
      />

      <DeleteEvaluationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        userId={userById!}
        onConfirm={async () => {
          if (selected) await deleteEvaluation(selected.id);
          deleteModal.onClose();
        }}
      />
    </Box>
  );
}
