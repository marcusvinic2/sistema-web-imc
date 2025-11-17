import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";

export function ManageUser() {
  return async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    const userAuthenticated = request.user;

    if (!userAuthenticated) {
      return response.status(401).json({ message: "Não autenticado" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      return response.status(404).json({ message: "Usuário não encontrado" });
    }

    if (userAuthenticated.perfil === "admin") {
      return next();
    }

    if (userAuthenticated.perfil === "professor" && user.perfil === "aluno") {
      return next();
    }

    return response.status(403).json({
      message: "Você não tem permissão para realizar esta ação.",
    });
  };
}
