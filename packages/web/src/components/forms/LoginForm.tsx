"use client";

import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
  Image,
  Flex,
  useToast,
} from "@chakra-ui/react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useLogin } from "@/hooks/useLogin";
import { AxiosError } from "axios";
import { useRouter } from 'next/navigation'

const loginSchema = z.object({
  usuario: z.string().min(3, "Informe o usuário"),
  senha: z.string().min(3, "Informe a senha"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type ApiErrorResponse = {
  message: string;
};

export function LoginForm() {
  const toast = useToast();
  const router = useRouter();
  const { login, isLoading } = useLogin();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      await login(values);

      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao sistema.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      router.push("/dashboard")
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;

      const backendMessage =
        axiosErr.response?.data?.message ??
        "Não foi possível autenticar. Tente novamente.";

      toast({
        title: "Erro no login",
        description: backendMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      bg="gray.50"
      px={4}
    >
      <Box
        w="100%"
        maxW="md"
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        borderWidth="1px"
      >

        <Flex direction="column" align="center" mb={6}>
          <Image
            src="https://sooro.com.br/wp-content/uploads/2020/09/sooro-by-the-way.png"
            alt="Logo do Sistema"
            height="60%"
            width="60%"
            mb={3}
          />
          <Heading size="lg" color="blue.600">
            Sistema IMC
          </Heading>
        </Flex>

        <VStack as="form" spacing={5} onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!errors.usuario}>
            <FormLabel>Usuário</FormLabel>
            <Input placeholder="Digite seu usuário" {...register("usuario")} />
            <FormErrorMessage>{errors.usuario?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.senha}>
            <FormLabel>Senha</FormLabel>
            <Input
              type="password"
              placeholder="Digite sua senha"
              {...register("senha")}
            />
            <FormErrorMessage>{errors.senha?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            size="lg"
            isLoading={isLoading}
          >
            Entrar
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
