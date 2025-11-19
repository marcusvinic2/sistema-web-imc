import { Request, Response } from "express";
import { z } from "zod";
import { LogoutUseCase } from "./LogoutUseCase";
import { UserTokenRepository } from "../../infra/typeorm/repositories/UserTokenRepository";

export class LogoutController {
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

    const tokensRepo = new UserTokenRepository();
    const useCase = new LogoutUseCase(tokensRepo);

    const result = await useCase.execute(parsed.data);

    return response.status(200).json(result);
  }
}
