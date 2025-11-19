import { Request, Response } from "express";
import { z } from "zod";
import { UpdateEvaluationUseCase } from "./UpdateEvaluationUseCase";

export class UpdateEvaluationController {
  private useCase: UpdateEvaluationUseCase;

  constructor() {
    this.useCase = new UpdateEvaluationUseCase();
  }

  async handle(request: Request, response: Response) {
    const schema = {
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        peso: z.number().positive(),
        altura: z.number().positive(),
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
      },
    };

    const parsedParams = schema.params.safeParse(request.params);
    if (!parsedParams.success) {
      return response.status(400).json({ errors: parsedParams.error.issues });
    }

    const parsedBody = schema.body.safeParse(request.body);
    if (!parsedBody.success) {
      return response.status(400).json({ errors: parsedBody.error.issues });
    }

    const { id } = parsedParams.data;
    const { peso, altura } = parsedBody.data;

    const userAuthenticatedById = request.user;
    if (!userAuthenticatedById) {
      return response.status(401).json({ message: "Não autenticado" });
    }

    const result = await this.useCase.execute({
      id,
      peso,
      altura,
      userAuthenticatedById,
    });

    if (result.statusCode >= 400) {
      return response.status(result.statusCode).json(result.body);
    }

    const safeOutput = schema.response[200].parse(result.body);

    return response.status(200).json(safeOutput);
  }
}
