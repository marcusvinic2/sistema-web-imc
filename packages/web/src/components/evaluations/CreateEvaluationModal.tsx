"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  Select,
} from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUserEvaluations } from "@/hooks/useUserEvaluations";
import { useLogin } from "@/hooks/useLogin";
import { useUsers } from "@/hooks/useUsers";

const createSchema = z.object({
  altura: z.string()
    .min(1, "Informe a altura")
    .transform(val => {
      const num = Number(val.replace(",", "."));
      if (isNaN(num)) throw new Error("Altura inválida (ex: 1,90)");
      return Number(num.toFixed(2));
    })
    .refine(n => n >= 0.3 && n <= 2.99, { message: "Altura inválida" }),
  peso: z
    .string()
    .regex(/^\d+(\,\d{1,2})?$/, "Use o formato: 80 ou 80,50")
    .transform((val) => parseFloat(val.replace(",", "."))),
  alunoId: z.string().uuid("ID inválido do aluno"),
});

type CreateFormData = z.infer<typeof createSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function CreateEvaluationModal({ isOpen, onClose, userId }: Props) {
  const { createEvaluation, isCreating } = useUserEvaluations(userId);
  const { users: students, isLoading: loadingStudents } = useUsers("aluno");
  const { user } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      alunoId: user?.perfil === "aluno" ? user.id : "",
    },
  });

  const submit = async (values: CreateFormData) => {
    await createEvaluation(values);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Criar Avaliação</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.altura}>
              <FormLabel>Altura (Ex: 1,70)</FormLabel>
              <Input placeholder="Ex: 1,70" type="text" step="0.01" {...register("altura")} />
              <FormErrorMessage>{errors.altura?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.peso}>
              <FormLabel>Peso (kg)</FormLabel>
              <Input placeholder="Ex: 69,2" type="text" step="0.01" {...register("peso")} />
              <FormErrorMessage>{errors.peso?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.alunoId}>
              <FormLabel>Aluno</FormLabel>

              {loadingStudents ? (
                <Select isDisabled placeholder="Carregando alunos..." />
              ) : (
                <Select
                  placeholder="Selecione um aluno"
                  {...register("alunoId")}
                  isDisabled={user?.perfil === "aluno"}
                >
                  {students?.filter((u) => u.perfil === "aluno")
                    ?.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.nome} ({aluno.usuario})
                      </option>
                    ))}
                </Select>
              )}

              <FormErrorMessage>{errors.alunoId?.message}</FormErrorMessage>
            </FormControl>

          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>

          <Button colorScheme="green" ml={3} onClick={handleSubmit(submit)} isLoading={isCreating}>
            Criar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
