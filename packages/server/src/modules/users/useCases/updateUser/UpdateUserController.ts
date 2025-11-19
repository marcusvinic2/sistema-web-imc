import { Request, Response } from "express";
import { z } from "zod";
import { UserRepository } from "../../infra/typeorm/repositories/UserRepository";
import { UpdateUserUseCase } from "./UpdateUserUseCase";
import { AppError } from "../../../../shared/errors/AppError";

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    const schema = z.object({
      id: z.string().uuid(),
      nome: z.string(),
      usuario: z.string(),
      senha: z.string().optional().nullable(),
      perfil: z.enum(["admin", "professor", "aluno"]),
      situacao: z.enum(["ativo", "inativo"]),
    });

    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        message: "Erro na validação dos dados.",
        errors: parsed.error.issues,
      });
    }

    try {
      const usersRepo = new UserRepository();
      const useCase = new UpdateUserUseCase(usersRepo);

      const result = await useCase.execute(parsed.data);

      return response.status(200).json({
        message: "Usuário atualizado com sucesso.",
        user: result,
      });

    } catch (error) {
      const err = error as AppError;

      return response.status(err.statusCode ?? 500).json({
        message: err.message ?? "Erro ao atualizar usuário.",
      });
    }
  }
}
