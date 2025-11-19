import { EvaluationIMC } from "../../../entities/EvaluationIMC";

export interface IEvaluationRepository {
  create(data: {
    altura: number;
    peso: number;
    imc: number;
    classificacao: string;
    professorId: string;
    alunoId: string;
  }): Promise<EvaluationIMC>;

  save(evaluation: EvaluationIMC): Promise<EvaluationIMC>;
  deleteById(id: string): Promise<void>;

  findById(id: string): Promise<EvaluationIMC | null>;
  findEvaluationByUserId(userId: string): Promise<EvaluationIMC[]>;

  listByAluno(alunoId: string): Promise<EvaluationIMC[]>;
  listByProfessor(professorId: string): Promise<EvaluationIMC[]>;
  listAll(): Promise<EvaluationIMC[]>;

  filter(params: {
    alunoId?: string | null;
    professorId?: string | null;
  }): Promise<EvaluationIMC[]>;
}
