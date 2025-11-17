"use client";
import { UserEvaluationsList } from "@/components/evaluations/UserEvaluationsList";
import { Box } from "@chakra-ui/react";

export default function HomePage() {
  return (
    <Box p={1}>
      <UserEvaluationsList />
    </Box>
  );
}
