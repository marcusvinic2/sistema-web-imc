"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";

import { EvaluationItem } from "@/hooks/useUserEvaluations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onConfirm: () => Promise<void>;
}

export function DeleteEvaluationModal({
  isOpen,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Excluir Avaliação</ModalHeader>

        <ModalBody>
          <Text>
            Tem certeza que deseja excluir esta avaliação?
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>

          <Button colorScheme="red" onClick={onConfirm}>
            Excluir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
