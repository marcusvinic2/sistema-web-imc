import { AppDataSource } from "../../../../database/data-source";
import { EvaluationIMC } from "../../../../entities/EvaluationIMC";
import { CalculateIMCService } from "../../../../shared/helpers/CalculateIMCService";

type Perfil = "admin" | "professor" | "aluno";

type Executor = {
  id: string;
  perfil: Perfil;
};

type UpdateEvaluationDTO = {
  id: string;
  altura: number;
  peso: number;
  userAuthenticatedById: Executor;
};

export class UpdateEvaluationUseCase {
  async execute({ id, altura, peso, userAuthenticatedById }: UpdateEvaluationDTO) {
    const repo = AppDataSource.getRepository(EvaluationIMC);

    const avaliacao = await repo.findOne({
      where: { id },
      relations: ["aluno", "professor"],
    });

    if (!avaliacao) {
      return {
        statusCode: 404,
        body: { message: "Avaliação não encontrada" },
      };
    }

    if (userAuthenticatedById.perfil === "aluno") {
      return {
        statusCode: 403,
        body: { message: "Alunos não podem editar avaliações." },
      };
    }

    if (
      userAuthenticatedById.perfil === "professor" &&
      avaliacao.professor.id !== userAuthenticatedById.id
    ) {
      return {
        statusCode: 403,
        body: { message: "Professor só pode editar avaliações que ele criou" },
      };
    }

    const resultIMC = CalculateIMCService.execute(altura, peso);

    avaliacao.peso = peso;
    avaliacao.altura = altura;
    avaliacao.imc = resultIMC.imc;
    avaliacao.classificacao = resultIMC.classificacao;

    await repo.save(avaliacao);

    return {
      statusCode: 200,
      body: { message: "Avaliação atualizada com sucesso" },
    };
  }
}
