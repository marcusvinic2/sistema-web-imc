"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  FormErrorMessage
} from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUsers } from "@/hooks/useUsers";
import { useEffect } from "react";
import { UserProfile, UserStatus } from "@/types/user.types";

export type UserItem = {
  id: string;
  nome: string;
  usuario: string;
  perfil: UserProfile;
  situacao: UserStatus;
  dtInclusao: string;
};

type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem;
};


const editSchema = z.object({
  nome: z.string().min(3, "O nome deve ter ao menos 3 caracteres"),
  usuario: z.string().min(3, "O usuário deve ter ao menos 3 caracteres"),
  perfil: z.enum(["admin", "professor", "aluno"]),
  situacao: z.enum(["ativo", "inativo"]),
  senha: z
    .string()
    .min(6, "A senha deve ter ao menos 6 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.trim() !== "" ? v : null))
});

type EditFormValues = z.infer<typeof editSchema>;

export function EditUserModal({
  isOpen,
  onClose,
  user
}: EditUserModalProps): JSX.Element {
  const { updateUser, isUpdating } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        nome: user.nome,
        usuario: user.usuario,
        perfil: user.perfil,
        situacao: user.situacao,
        senha: ""
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (values: EditFormValues): Promise<void> => {
    await updateUser({
      id: user.id,
      nome: values.nome,
      usuario: values.usuario,
      perfil: values.perfil,
      situacao: values.situacao,
      senha: values.senha
    });

    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar Usuário</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <FormControl mb={3} isInvalid={!!errors.nome}>
            <FormLabel>Nome</FormLabel>
            <Input {...register("nome")} />
            <FormErrorMessage>{errors.nome?.message}</FormErrorMessage>
          </FormControl>

          <FormControl mb={3} isInvalid={!!errors.usuario}>
            <FormLabel>Usuário</FormLabel>
            <Input {...register("usuario")} />
            <FormErrorMessage>{errors.usuario?.message}</FormErrorMessage>
          </FormControl>

          <HStack>
            <FormControl isInvalid={!!errors.perfil}>
              <FormLabel>Perfil</FormLabel>
              <Select {...register("perfil")}>
                <option value="admin">Administrador</option>
                <option value="professor">Professor</option>
                <option value="aluno">Aluno</option>
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
          </HStack>

          <FormControl mt={4} isInvalid={!!errors.senha}>
            <FormLabel>Nova Senha (opcional)</FormLabel>
            <Input type="password" {...register("senha")} />
            <FormErrorMessage>{errors.senha?.message}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancelar
          </Button>

          <Button
            colorScheme="blue"
            isLoading={isUpdating}
            onClick={handleSubmit(onSubmit)}
          >
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
