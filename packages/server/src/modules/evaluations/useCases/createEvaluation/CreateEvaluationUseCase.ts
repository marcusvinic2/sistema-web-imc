import { IUserRepository } from "../../../users/repositories/IUserRepository";
import { IEvaluationRepository } from "../../repositories/IEvaluationRepository";
import { AppError } from "../../../../shared/errors/AppError";
import { CalculateIMCService } from "../../../../shared/helpers/CalculateIMCService";

type CreateEvaluationRequest = {
  alunoId: string;
  peso: number;
  altura: number;
  requestUserId: string;
  requestProfileId: "admin" | "professor" | "aluno";
};

export class CreateEvaluationUseCase {
  constructor(
    private usersRepository: IUserRepository,
    private evaluationsRepository: IEvaluationRepository,
  ) { }

  async execute({
    alunoId,
    peso,
    altura,
    requestUserId,
    requestProfileId,
  }: CreateEvaluationRequest) {
    if (!["admin", "professor"].includes(requestProfileId)) {
      throw new AppError(
        "Somente admin ou professor podem criar avaliações.",
        403,
      );
    }

    const professor = await this.usersRepository.findById(requestUserId);
    if (!professor) throw new AppError("Professor responsável não encontrado.", 404);
    if (professor.situacao === "inativo")
      throw new AppError("Professor inativo não pode criar avaliações.", 400);

    const aluno = await this.usersRepository.findById(alunoId);

    if (!aluno) throw new AppError("Aluno não encontrado.", 404);

    if (aluno.situacao === "inativo")
      throw new AppError("Não é possível avaliar um aluno inativo.", 400);

    if (aluno.perfil !== "aluno")
      throw new AppError("Somente usuários com perfil 'aluno' podem ser avaliados.", 400);

    const imcResult = CalculateIMCService.execute(altura, peso);

    const avaliacao = await this.evaluationsRepository.create({
      altura,
      peso,
      imc: imcResult.imc,
      classificacao: imcResult.classificacao,
      professorId: professor.id,
      alunoId: aluno.id,
    });

    return {
      avaliacao: {
        id: avaliacao.id,
        altura: avaliacao.altura,
        peso: avaliacao.peso,
        imc: avaliacao.imc,
        classificacao: avaliacao.classificacao,
        dtInclusao: avaliacao.dtInclusao.toISOString(),
        professorId: professor.id,
        alunoId: aluno.id,
      },
    };
  }
}
