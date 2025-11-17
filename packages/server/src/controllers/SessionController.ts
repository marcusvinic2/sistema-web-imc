import { Request, Response } from "express";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import jwt from 'jsonwebtoken'
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import authConfig from "../config/auth";
import { z } from "zod";
import crypto from "crypto";
import { UserToken } from "../entities/UserToken";

export class SessionController {
  static async login(request: Request, response: Response) {
    const schema = {
      summary: "Realizar login",
      tags: ["Auth"],
      body: z.object({
        usuario: z.string(),
        senha: z.string(),
      }),

      response: {
        200: z.object({
          user: z.object({
            id: z.string(),
            nome: z.string(),
            usuario: z.string(),
            perfil: z.enum(["admin", "professor", "aluno"]),
            situacao: z.enum(["ativo", "inativo"]),
          }),
          token: z.string(),
          refresh_token: z.string(),
        }),
      },
    };

    const parseDataata = schema.body.safeParse(request.body);

    if (!parseDataata.success) {
      return response.status(400).json({
        message: "Erro durante validação",
        errors: parseDataata.error.issues,
      });
    }

    const { usuario, senha } = parseDataata.data;

    try {
      const repo = AppDataSource.getRepository(User);
      const tokenRepo = AppDataSource.getRepository(UserToken);

      const user = await repo.findOne({ where: { usuario } });

      if (!user) {
        return response.status(403).json({ message: "Usuário ou senha inválidos" });
      }

      if (user.situacao === "inativo") {
        return response.status(403).json({ message: "Usuário inativo" });
      }

      const password = await compare(senha, user.senha);

      if (!password) {
        return response.status(403).json({ message: "Usuário ou senha inválidos" });
      }

      const token = sign(
        { id: user.id, perfil: user.perfil },
        authConfig.jwt.secret,
        { expiresIn: "1d" }
      );

      const refreshToken = crypto.randomBytes(64).toString("hex");
      const expiracaoToken = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias de validade

      const newRefresh = tokenRepo.create({
        refreshToken,
        expiracaoToken,
        idUsuario: user.id,
      });

      await tokenRepo.save(newRefresh);

      const resultData = {
        user: {
          id: user.id,
          nome: user.nome,
          usuario: user.usuario,
          perfil: user.perfil,
          situacao: user.situacao,
        },
        token,
        refresh_token: refreshToken,
      };

      const response_sucess = schema.response[200].parse(resultData);

      return response.status(200).json(response_sucess);
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: "Ocorreu um erro ao realizar login.",
      });
    }
  }

  static async refresh(request: Request, response: Response) {
    const schema = {
      summary: "Gerar novo token utilizando refresh token",
      tags: ["Auth"],
      body: z.object({
        refresh_token: z.string(),
      }),

      response: {
        200: z.object({
          token: z.string(),
          refresh_token: z.string(),
        }),
      },
    };

    const parseData = schema.body.safeParse(request.body);

    if (!parseData.success) {
      return response.status(400).json({
        message: "Erro durante validação",
        errors: parseData.error.issues,
      });
    }

    const { refresh_token } = parseData.data;

    try {
      const tokenRepo = AppDataSource.getRepository(UserToken);
      const userRepo = AppDataSource.getRepository(User);

      const findToken = await tokenRepo.findOne({
        where: { refreshToken: refresh_token },
      });

      if (!findToken) {
        return response.status(401).json({ message: "Refresh token inválido" });
      }

      const date_now = new Date();

      if (date_now > findToken.expiracaoToken) {
        return response.status(401).json({ message: "Refresh token expirado" });
      }

      const user = await userRepo.findOne({
        where: { id: findToken.idUsuario },
      });

      if (!user) {
        return response.status(401).json({ message: "Usuário não encontrado" });
      }

      if (user.situacao === "inativo") {
        return response.status(403).json({ message: "Usuário inativo" });
      }

      const newAccessToken = sign(
        { id: user.id, perfil: user.perfil },
        authConfig.jwt.secret,
        { expiresIn: "1d" }
      );

      const newRefreshToken = crypto.randomBytes(64).toString("hex");

      const newRefreshExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias de validade

      findToken.refreshToken = newRefreshToken;
      findToken.expiracaoToken = newRefreshExpiration;

      await tokenRepo.save(findToken);

      const resultData = {
        token: newAccessToken,
        refresh_token: newRefreshToken,
      };

      const response_sucess = schema.response[200].parse(resultData);

      return response.status(200).json(response_sucess);

    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: "Erro ao gerar novo token.",
      });
    }
  }

  static async logout(request: Request, response: Response) {
    const schema = {
      summary: "Encerrar sessão do usuário",
      tags: ["Auth"],
      body: z.object({
        refresh_token: z.string(),
      }),

      response: {
        200: z.object({
          message: z.string(),
        }),
      },
    };

    const parseData = schema.body.safeParse(request.body);

    if (!parseData.success) {
      return response.status(400).json({
        message: "Erro durante validação",
        errors: parseData.error.issues,
      });
    }

    const { refresh_token } = parseData.data;

    try {
      const tokenRepo = AppDataSource.getRepository(UserToken);

      await tokenRepo.delete({
        refreshToken: refresh_token,
      });

      const resultData = {
        message: "Logout realizado com sucesso.",
      };

      const response_sucess = schema.response[200].parse(resultData);

      return response.status(200).json(response_sucess);
    } catch (error) {
      return response.status(500).json({
        message: "Erro ao realizar logout.",
      });
    }
  }
}
