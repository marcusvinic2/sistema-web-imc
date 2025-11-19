import { AppDataSource } from "../../../../database/data-source";
import { EvaluationIMC } from "../../../../entities/EvaluationIMC";

type Perfil = "admin" | "professor" | "aluno";

type Executor = {
  id: string;
  perfil: Perfil;
};

type DeleteEvaluationDTO = {
  id: string;
  userAuthenticatedById: Executor;
};

export class DeleteEvaluationUseCase {
  async execute({ id, userAuthenticatedById }: DeleteEvaluationDTO) {
    if (userAuthenticatedById.perfil !== "admin") {
      return {
        statusCode: 403,
        body: { message: "Somente admin pode excluir avaliações" },
      };
    }

    const repo = AppDataSource.getRepository(EvaluationIMC);

    const avaliacao = await repo.findOne({ where: { id } });

    if (!avaliacao) {
      return {
        statusCode: 404,
        body: { message: "Avaliação não encontrada" },
      };
    }

    await repo.remove(avaliacao);

    return {
      statusCode: 200,
      body: { message: "Avaliação removida com sucesso" },
    };
  }
}
