"use client";

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Button,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";

import { useUsers } from "@/hooks/useUsers";
import { useLogin } from "@/hooks/useLogin";
import { useUserEvaluations } from "@/hooks/useUserEvaluations";

export type EvaluationFilterData = {
  alunoId?: string;
  professorId?: string;
};

type EvaluationsFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: EvaluationFilterData;
  onFilter: (filters: EvaluationFilterData) => void;
};

export function EvaluationsFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilter,
}: EvaluationsFilterDrawerProps): JSX.Element {
  const { user } = useLogin();
  const { users } = useUsers();
  const { data: evaluations } = useUserEvaluations(user?.id ?? null);

  const [localFilters, setLocalFilters] = useState<EvaluationFilterData>({
    alunoId: "",
    professorId: "",
  });

  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        alunoId: filters.alunoId ?? "",
        professorId: filters.professorId ?? "",
      });
    }
  }, [isOpen, filters]);

  if (!users || !user) return <></>;

  const isAdmin = user.perfil === "admin";
  const isProfessor = user.perfil === "professor";

  const alunos = users.filter((u) => u.perfil === "aluno");

  const alunosDoProfessor = isProfessor
    ? alunos.filter((a) =>
      evaluations?.some((ev) => ev.professorId === user.id)
    )
    : alunos;

  const professores = users.filter((u) => u.perfil === "professor");

  const updateLocal = (filtered: keyof EvaluationFilterData, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filtered]: value,
    }));
  };

  const handleApply = () => {
    onFilter({
      alunoId: localFilters.alunoId || undefined,
      professorId: localFilters.professorId || undefined,
    });
    onClose();
  };

  const handleClear = () => {
    onFilter({});
    onClose();
  };

  return (
    <Drawer placement="right" onClose={onClose} isOpen={isOpen} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Filtros das Avaliações
        </DrawerHeader>

        <DrawerBody>
          <Flex direction="column" gap={6} mt={4}>
            {(isAdmin || isProfessor) && (
              <FormControl>
                <FormLabel>Aluno</FormLabel>
                <Select
                  value={localFilters.alunoId}
                  onChange={(e) => updateLocal("alunoId", e.target.value)}
                  placeholder="Selecione um aluno"
                >
                  {(isProfessor ? alunosDoProfessor : alunos).map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome} ({aluno.usuario})
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {isAdmin && (
              <FormControl>
                <FormLabel>Professor</FormLabel>
                <Select
                  value={localFilters.professorId}
                  onChange={(e) =>
                    updateLocal("professorId", e.target.value)
                  }
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
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" gap={3}>
          <Button variant="outline" w="100%" onClick={handleClear}>
            Limpar
          </Button>

          <Button colorScheme="blue" w="100%" onClick={handleApply}>
            Aplicar Filtro
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
