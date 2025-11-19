import { AppDataSource } from "../../../../../database/data-source";
import { EvaluationIMC } from "../../../../../entities/EvaluationIMC";
import { IEvaluationRepository } from "../../../repositories/IEvaluationRepository";
import { FindOptionsWhere } from "typeorm";

export class EvaluationRepository implements IEvaluationRepository {
  private repo = AppDataSource.getRepository(EvaluationIMC);

  async create(data: {
    altura: number;
    peso: number;
    imc: number;
    classificacao: string;
    professorId: string;
    alunoId: string;
  }): Promise<EvaluationIMC> {
    const avaliacao = this.repo.create({
      altura: data.altura,
      peso: data.peso,
      imc: data.imc,
      classificacao: data.classificacao,
      dtInclusao: new Date(),
      professor: { id: data.professorId } as any,
      aluno: { id: data.alunoId } as any,
    });

    return this.repo.save(avaliacao);
  }

  async save(evaluation: EvaluationIMC): Promise<EvaluationIMC> {
    return this.repo.save(evaluation);
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async findEvaluationByUserId(userId: string) {
    return await this.repo.find({
      where: [
        { aluno: { id: userId } },
        { professor: { id: userId } },
      ]
    });
  }

  async findById(id: string): Promise<EvaluationIMC | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["aluno", "professor"],
    });
  }

  async listByAluno(alunoId: string): Promise<EvaluationIMC[]> {
    return this.repo.find({
      where: { aluno: { id: alunoId } },
      relations: ["professor"],
      order: { dtInclusao: "DESC" },
    });
  }

  async listByProfessor(professorId: string): Promise<EvaluationIMC[]> {
    return this.repo.find({
      where: { professor: { id: professorId } },
      relations: ["aluno"],
      order: { dtInclusao: "DESC" },
    });
  }

  async listAll(): Promise<EvaluationIMC[]> {
    return this.repo.find({
      relations: ["professor", "aluno"],
      order: { dtInclusao: "DESC" },
    });
  }

  async filter(params: {
    alunoId?: string | null;
    professorId?: string | null;
  }): Promise<EvaluationIMC[]> {
    const where: FindOptionsWhere<EvaluationIMC> = {};

    if (params.alunoId) {
      where.aluno = { id: params.alunoId } as any;
    }

    if (params.professorId) {
      where.professor = { id: params.professorId } as any;
    }

    return this.repo.find({
      where,
      relations: ["professor", "aluno"],
      order: { dtInclusao: "DESC" },
    });
  }
}
