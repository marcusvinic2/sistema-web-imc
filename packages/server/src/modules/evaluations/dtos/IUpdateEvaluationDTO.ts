export interface IUpdateEvaluationDTO {
  id: string;
  altura: number;
  peso: number;
  requestUserId: string;
  requestProfileId: "admin" | "professor" | "aluno";
}
