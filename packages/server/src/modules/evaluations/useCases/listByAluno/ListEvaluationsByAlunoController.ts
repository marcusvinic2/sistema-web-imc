
import { Request, Response } from "express";
import { z } from "zod";
import { ListEvaluationsByAlunoUseCase } from "./ListEvaluationsByAlunoUseCase";

export class ListEvaluationsByAlunoController {
  private useCase: ListEvaluationsByAlunoUseCase;

  constructor() {
    this.useCase = new ListEvaluationsByAlunoUseCase();
  }

  async handle(request: Request, response: Response) {
    const schema = {
      params: z.object({
        alunoId: z.string().optional(),
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

    const parsedParams = schema.params.safeParse(request.params);
    if (!parsedParams.success) {
      return response.status(400).json({ errors: parsedParams.error.issues });
    }

    const userAuthenticatedById = request.user;
    if (!userAuthenticatedById) {
      return response.status(401).json({ message: "Não autenticado" });
    }

    const { alunoId } = parsedParams.data;

    const result = await this.useCase.execute({
      alunoId,
      userAuthenticatedById,
    });

    if (result.statusCode >= 400) {
      return response.status(result.statusCode).json(result.body);
    }

    const safeOutput = schema.response[200].parse(result.body);

    return response.status(200).json(safeOutput);
  }
}
