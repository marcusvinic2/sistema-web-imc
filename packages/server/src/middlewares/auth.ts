import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import { Perfil } from "../types/user.types";

type JwtPayload = {
  id: string;
  perfil: Perfil;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      perfil: Perfil;
    };
  }
}

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ message: "Token não informado" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const userRepo = AppDataSource.getRepository(User);
    const decoded = verify(token, authConfig.jwt.secret) as JwtPayload;
    const user = await userRepo.findOne({ where: { id: decoded.id } });

    if (!user) {
      return response.status(401).json({ message: "Usuário não encontrado" });
    }

    if (user.situacao !== "ativo") {
      return response.status(401).json({ message: "Usuário inativo" });
    }

    request.user = {
      id: decoded.id,
      perfil: user.perfil,
    };

    return next();
  } catch (err) {
    return response.status(401).json({ message: "Token inválido" });
  }
}

export function rules(
  roles: Array<Perfil>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!roles.includes(request.user.perfil)) {
      return response.status(403).json({ message: "Acesso negado" });
    }

    return next();
  };
}
