import { Request, Response } from "express";
import { z } from "zod";
import { FilterEvaluationsUseCase } from "./FilterEvaluationsUseCase";

export class FilterEvaluationsController {
  private useCase: FilterEvaluationsUseCase;

  constructor() {
    this.useCase = new FilterEvaluationsUseCase();
  }

  async handle(request: Request, response: Response) {
    const schema = {
      body: z.object({
        alunoId: z.string().optional().nullable(),
        professorId: z.string().optional().nullable(),
      }),
      response: {
        200: z.object({
          avaliacao: z.array(
            z.object({
              id: z.string(),
              altura: z.number(),
              peso: z.number(),
              imc: z.number(),
              classificacao: z.string(),
              dtInclusao: z.string(),
              professorId: z.string(),
            })
          ),
        }),
      },
    };

    const parsed = schema.body.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        message: "Erro na validação",
        errors: parsed.error.issues,
      });
    }

    const userAuthenticatedById = request.user;
    if (!userAuthenticatedById) {
      return response.status(401).json({ message: "Não autenticado" });
    }

    const { alunoId, professorId } = parsed.data;

    const result = await this.useCase.execute({
      alunoId,
      professorId,
      userAuthenticatedById,
    });

    if (result.statusCode >= 400) {
      return response.status(result.statusCode).json(result.body);
    }

    const safeOutput = schema.response[200].parse(result.body);

    return response.status(200).json(safeOutput);
  }
}
