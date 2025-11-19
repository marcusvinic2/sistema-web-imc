import { Request, Response } from "express";
import { z } from "zod";
import { UserRepository } from "../../infra/typeorm/repositories/UserRepository";
import { UserTokenRepository } from "../../infra/typeorm/repositories/UserTokenRepository";
import { LoginUseCase } from "./LoginUseCase";
import { AppError } from "../../../../shared/errors/AppError";

export class LoginController {
  async handle(request: Request, response: Response) {
    const schema = z.object({
      usuario: z.string(),
      senha: z.string(),
    });

    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        message: "Erro durante validação",
        errors: parsed.error.issues,
      });
    }

    try {
      const usersRepo = new UserRepository();
      const tokensRepo = new UserTokenRepository();
      const useCase = new LoginUseCase(usersRepo, tokensRepo);

      const result = await useCase.execute(parsed.data);

      return response.status(200).json(result);
    } catch (error) {
      const err = error as AppError;
      return response.status(err.statusCode ?? 500).json({
        message: err.message ?? "Erro ao realizar login.",
      });
    }
  }
}
