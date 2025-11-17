"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button
} from "@chakra-ui/react";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
};

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: ConfirmDeleteModalProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>{message}</ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
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
