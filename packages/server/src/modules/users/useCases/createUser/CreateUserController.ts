import { Request, Response } from "express";
import { z } from "zod";

import { UserRepository } from "../../infra/typeorm/repositories/UserRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

export class CreateUserController {
  async handle(request: Request, response: Response) {
    const schema = z.object({
      nome: z.string().min(3),
      usuario: z.string().min(3),
      senha: z.string().min(6),
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
      const usersRepository = new UserRepository();
      const useCase = new CreateUserUseCase(usersRepository);

      const result = await useCase.execute(parsed.data);

      return response.status(201).json({
        message: "Usuário criado com sucesso.",
        user: result,
      });

    } catch (error) {
      const err = error as Error;

      return response.status(400).json({
        message: err.message || "Erro ao criar usuário.",
      });
    }
  }
}
