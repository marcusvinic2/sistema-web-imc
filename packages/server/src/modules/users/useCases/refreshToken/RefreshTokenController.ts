import { Request, Response } from "express";
import { z } from "zod";
import { UserTokenRepository } from "../../infra/typeorm/repositories/UserTokenRepository";
import { UserRepository } from "../../infra/typeorm/repositories/UserRepository";
import { RefreshTokenUseCase } from "./RefreshTokenUseCase";
import { AppError } from "../../../../shared/errors/AppError";

export class RefreshTokenController {
  async handle(request: Request, response: Response) {
    const schema = z.object({
      refresh_token: z.string(),
    });

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        message: "Erro durante validação",
        errors: parsed.error.issues,
      });
    }

    try {
      const tokensRepo = new UserTokenRepository();
      const usersRepo = new UserRepository();
      const useCase = new RefreshTokenUseCase(tokensRepo, usersRepo);

      const result = await useCase.execute(parsed.data);

      return response.status(200).json(result);
    } catch (error) {
      const err = error as AppError;
      return response.status(err.statusCode ?? 500).json({
        message: err.message ?? "Erro ao gerar novo token.",
      });
    }
  }
}
