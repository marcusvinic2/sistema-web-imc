import { LoginForm } from "@/components/forms/LoginForm";
import { Box, Container } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <Container maxW="3xl">
      <Box py={8}>
        <LoginForm />
      </Box>
    </Container>
  );
}
