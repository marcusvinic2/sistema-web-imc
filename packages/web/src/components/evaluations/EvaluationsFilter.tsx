"use client";

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";

import { useUsers } from "@/hooks/useUsers";
import { useLogin } from "@/hooks/useLogin";

export type EvaluationFilterData = {
  alunoId?: string;
  professorId?: string;
};

type Props = {
  filters: EvaluationFilterData;
  onFilter: (filters: EvaluationFilterData) => void;
};

export function EvaluationsFilter({ filters, onFilter }: Props) {
  const { user } = useLogin();
  const { users } = useUsers();

  if (!users || !user) return <></>;

  const isAdmin = user.perfil === "admin";
  const isProfessor = user.perfil === "professor";

  const alunos = users.filter((u) => u.perfil === "aluno");
  const professores = users.filter((u) => u.perfil === "professor");

  const update = (filtered: keyof EvaluationFilterData, value: string) =>
    onFilter({ ...filters, [filtered]: value || undefined });

  return (
    <Box p={4} bg="gray.100" rounded="md" shadow="sm">
      <Flex gap={4} wrap="wrap">

        {(isAdmin || isProfessor) && (
          <FormControl w="240px">
            <FormLabel>Aluno</FormLabel>
            <Select
              value={filters.alunoId ?? ""}
              onChange={(e) => update("alunoId", e.target.value)}
              placeholder="Selecione um aluno"
            >
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} ({a.usuario})
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        {isAdmin && (
          <FormControl w="240px">
            <FormLabel>Professor</FormLabel>
            <Select
              value={filters.professorId ?? ""}
              onChange={(e) => update("professorId", e.target.value)}
              placeholder="Selecione um professor"
            >
              {professores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.usuario})
                </option>
              ))}
            </Select>
          </FormControl>
        )}

      </Flex>
    </Box>
  );
}
