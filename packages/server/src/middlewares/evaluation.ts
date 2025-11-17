import { Request, Response, NextFunction } from "express";
import { EvaluationIMC } from "../entities/EvaluationIMC";
import { AppDataSource } from "../database/data-source";

export function AccessEvaluation() {
  return async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    const userAuthenticated = request.user;

    if (!userAuthenticated) return response.status(401).json({ message: "Não autenticado" });

    const evalRepo = AppDataSource
      .getRepository(EvaluationIMC);

    const avaliacao = await evalRepo.findOne({
      where: { id },
      relations: ["aluno", "professor"],
    });

    if (!avaliacao) {
      return response.status(404).json({ message: "Avaliação não encontrada" });
    }

    if (userAuthenticated.perfil === "admin") return next();

    if (userAuthenticated.perfil === "aluno") {
      if (avaliacao.aluno.id === userAuthenticated.id) return next();

      return response.status(403).json({
        message: "Você não pode acessar avaliações de outros alunos.",
      });
    }

    if (userAuthenticated.perfil === "professor") {
      if (avaliacao.professor.id === userAuthenticated.id) return next();

      return response.status(403).json({
        message: "Você só pode acessar avaliações de seus alunos.",
      });
    }

    return response.status(403).json({ message: "Acesso negado" });
  };
}
