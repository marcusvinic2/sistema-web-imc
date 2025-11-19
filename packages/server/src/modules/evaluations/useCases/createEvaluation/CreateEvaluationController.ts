import { Request, Response } from "express";
import { z } from "zod";

import { EvaluationRepository } from "../../infra/typeorm/repositories/EvaluationRepository";
import { UserRepository } from "../../../users/infra/typeorm/repositories/UserRepository";
import { CreateEvaluationUseCase } from "./CreateEvaluationUseCase";

export class CreateEvaluationController {
  async handle(request: Request, response: Response) {
    const schema = z.object({
      altura: z.number().min(0.3).max(3),
      peso: z.number().min(1),
      alunoId: z.string(),
    });

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        message: "Erro na validação dos dados",
        errors: parsed.error.issues,
      });
    }

    try {
      const { alunoId, altura, peso } = parsed.data;

      const requestUserId = request.user?.id;
      const requestProfileId = request.user?.perfil;

      if (!requestUserId || !requestProfileId) {
        return response.status(403).json({
          message: "Usuário não autenticado.",
        });
      }

      const usersRepository = new UserRepository();
      const evaluationsRepository = new EvaluationRepository();

      const useCase = new CreateEvaluationUseCase(
        usersRepository,
        evaluationsRepository
      );

      const result = await useCase.execute({
        alunoId,
        altura,
        peso,
        requestUserId,
        requestProfileId,
      });

      return response.status(201).json({
        message: "Avaliação criada com sucesso.",
        ...result,
      });

    } catch (error) {
      const err = error as Error;

      return response.status(400).json({
        message: err.message ?? "Erro ao criar avaliação.",
      });
    }
  }
}
