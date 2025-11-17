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
} from "@chakra-ui/react";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { EvaluationItem, useUserEvaluations } from "@/hooks/useUserEvaluations";

const editSchema = z.object({
  altura: z
    .string()
    .min(1, "Informe a altura")
    .refine((v) => {
      const n = Number(v.replace(",", "."));
      return !isNaN(n) && n >= 0.3 && n <= 2.99;
    }, { message: "Altura inválida, use: (ex: 1,90)" }),

  peso: z
    .string()
    .regex(/^\d+(\,\d{1,2})?$/, "Use o formato: 80 ou 80,50"),
});

type EditFormData = z.infer<typeof editSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationItem | null;
  userId: string;
}

export function EditEvaluationModal({
  isOpen,
  onClose,
  evaluation,
  userId,
}: Props) {
  const { updateEvaluation, isUpdating } = useUserEvaluations(userId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (isOpen && evaluation) {
      reset({
        altura: evaluation.altura.toFixed(2).replace(".", ","),
        peso: evaluation.peso.toFixed(2).replace(".", ","),
      });
    }
  }, [isOpen, evaluation, reset]);

  const submit = async (values: EditFormData) => {
    if (!evaluation) return;

    const alturaNum = Number(values.altura.replace(",", "."));
    const pesoNum = Number(values.peso.replace(",", "."));

    await updateEvaluation({
      id: evaluation.id,
      altura: alturaNum,
      peso: pesoNum,
    });

    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Editar Avaliação</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.altura}>
              <FormLabel>Altura (Ex: 1,70)</FormLabel>
              <Input placeholder="Ex: 1,70" {...register("altura")} />
              <FormErrorMessage>{errors.altura?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.peso}>
              <FormLabel>Peso (kg)</FormLabel>
              <Input placeholder="Ex: 80,50" {...register("peso")} />
              <FormErrorMessage>{errors.peso?.message}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleSubmit(submit)}
            isLoading={isUpdating}
          >
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
