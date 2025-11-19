import { FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../../../database/data-source";
import { EvaluationIMC } from "../../../../entities/EvaluationIMC";

type Perfil = "admin" | "professor" | "aluno";

type Executor = {
  id: string;
  perfil: Perfil;
};

type FilterEvaluationsDTO = {
  alunoId?: string | null;
  professorId?: string | null;
  userAuthenticatedById: Executor;
};

export class FilterEvaluationsUseCase {
  async execute({ alunoId, professorId, userAuthenticatedById }: FilterEvaluationsDTO) {
    const repo = AppDataSource.getRepository(EvaluationIMC);

    if (userAuthenticatedById.perfil === "aluno") {
      const lista = await repo.find({
        where: { aluno: { id: userAuthenticatedById.id } },
        relations: ["professor", "aluno"],
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

    let where: FindOptionsWhere<EvaluationIMC> = {};

    if (alunoId) {
      where.aluno = { id: alunoId };
    }

    if (professorId) {
      where.professor = { id: professorId };
    }

    if (userAuthenticatedById.perfil === "professor") {
      // professor ver apenas avaliações de seus alunos
      where.professor = { id: userAuthenticatedById.id };
    }

    const lista = await repo.find({
      where,
      relations: ["professor", "aluno"],
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
}
