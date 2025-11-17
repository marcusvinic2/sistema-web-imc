"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  FormErrorMessage,
  VStack,
} from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUsers } from "@/hooks/useUsers";
import { useLogin } from "@/hooks/useLogin";

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const schema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  usuario: z.string().min(3, "Usuário obrigatório"),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  perfil: z.enum(["admin", "professor", "aluno"]),
  situacao: z.enum(["ativo", "inativo"]).default("ativo"),
});

type FormData = z.infer<typeof schema>;

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const { user } = useLogin();
  const { createUser, isCreating } = useUsers();

  const isAdmin = user?.perfil === "admin";
  const isProfessor = user?.perfil === "professor";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      situacao: "ativo",
    },
  });

  const onSubmit = async (values: FormData) => {
    await createUser(values);
    reset();
    onClose();
  };

  if (!user || (!isAdmin && !isProfessor)) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar Usuário</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.nome}>
              <FormLabel>Nome</FormLabel>
              <Input placeholder="Digite o nome" {...register("nome")} />
              <FormErrorMessage>{errors.nome?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.usuario}>
              <FormLabel>Usuário</FormLabel>
              <Input placeholder="Usuário" {...register("usuario")} />
              <FormErrorMessage>{errors.usuario?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.senha}>
              <FormLabel>Senha</FormLabel>
              <Input
                type="password"
                placeholder="Senha"
                {...register("senha")}
              />
              <FormErrorMessage>{errors.senha?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.perfil}>
              <FormLabel>Perfil</FormLabel>

              <Select {...register("perfil")}>
                {isAdmin && (
                  <>
                    <option value="admin">Administrador</option>
                    <option value="professor">Professor</option>
                    <option value="aluno">Aluno</option>
                  </>
                )}

                {isProfessor && (
                  <>
                    <option value="aluno">Aluno</option>
                  </>
                )}
              </Select>

              <FormErrorMessage>{errors.perfil?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.situacao}>
              <FormLabel>Situação</FormLabel>
              <Select {...register("situacao")}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Select>
              <FormErrorMessage>{errors.situacao?.message}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting || isCreating}
          >
            Criar Usuário
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
