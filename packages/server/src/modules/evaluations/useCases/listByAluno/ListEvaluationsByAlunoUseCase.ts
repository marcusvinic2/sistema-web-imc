import { AppDataSource } from "../../../../database/data-source";
import { EvaluationIMC } from "../../../../entities/EvaluationIMC";

type Perfil = "admin" | "professor" | "aluno";

type Executor = {
  id: string;
  perfil: Perfil;
};

type ListEvaluationsDTO = {
  alunoId?: string;
  userAuthenticatedById: Executor;
};

export class ListEvaluationsByAlunoUseCase {
  async execute({ alunoId, userAuthenticatedById }: ListEvaluationsDTO) {
    const repo = AppDataSource.getRepository(EvaluationIMC);

    if (userAuthenticatedById.perfil === "aluno") {
      const lista = await repo.find({
        where: { aluno: { id: userAuthenticatedById.id } },
        relations: ["professor"],
        order: { dtInclusao: "DESC" },
      });

      return {
        statusCode: 200,
        body: {
          avaliacao: lista.map((a) => ({
            id: a.id,
            altura: a.altura,
            peso: a.peso,
            imc: a.imc,
            classificacao: a.classificacao,
            dtInclusao: a.dtInclusao.toISOString(),
            professorId: a.professor.id,
          })),
        },
      };
    }

    if (userAuthenticatedById.perfil === "professor") {
      const lista = await repo.find({
        where: { professor: { id: userAuthenticatedById.id } },
        relations: ["aluno"],
        order: { dtInclusao: "DESC" },
      });

      return {
        statusCode: 200,
        body: {
          avaliacao: lista.map((a) => ({
            id: a.id,
            altura: a.altura,
            peso: a.peso,
            imc: a.imc,
            classificacao: a.classificacao,
            dtInclusao: a.dtInclusao.toISOString(),
            professorId: userAuthenticatedById.id,
          })),
        },
      };
    }

    if (userAuthenticatedById.perfil === "admin") {
      const lista = await repo.find({
        relations: ["professor", "aluno"],
        order: { dtInclusao: "DESC" },
      });

      return {
        statusCode: 200,
        body: {
          avaliacao: lista.map((a) => ({
            id: a.id,
            altura: a.altura,
            peso: a.peso,
            imc: a.imc,
            classificacao: a.classificacao,
            dtInclusao: a.dtInclusao.toISOString(),
            professorId: a.professor.id,
          })),
        },
      };
    }

    return {
      statusCode: 400,
      body: { message: "Perfil inválido" },
    };
  }
}
