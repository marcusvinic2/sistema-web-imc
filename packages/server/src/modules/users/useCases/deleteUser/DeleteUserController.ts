import { Request, Response } from "express";
import { UserRepository } from "../../infra/typeorm/repositories/UserRepository";
import { DeleteUserUseCase } from "./DeleteUserUseCase";
import { AppError } from "../../../../shared/errors/AppError";
import { EvaluationRepository } from "../../../evaluations/infra/typeorm/repositories/EvaluationRepository";

export class DeleteUserController {
  async handle(request: Request, response: Response) {
    const { id } = request.params;

    try {
      const userRepository = new UserRepository();
      const evaluationRepository = new EvaluationRepository();

      const useCase = new DeleteUserUseCase(userRepository, evaluationRepository);

      const result = await useCase.execute(id);

      return response.status(200).json(result);

    } catch (error) {
      const err = error as AppError;

      return response.status(err.statusCode ?? 500).json({
        message: err.message ?? "Erro ao excluir usuário.",
      });
    }
  }
}
