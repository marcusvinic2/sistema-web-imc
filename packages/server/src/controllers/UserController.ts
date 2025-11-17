import { Request, Response } from "express";
import { hash, compare } from "bcrypt";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import { z } from "zod";
import { EvaluationIMC } from "../entities/EvaluationIMC";

export class UserController {
  static async create(request: Request, response: Response) {
    const schema = {
      summary: "Criar novo usuário",
      tags: ["User"],
      body: z.object({
        nome: z.string().min(3),
        usuario: z.string().min(3),
        senha: z.string().min(6),
        perfil: z.enum(["admin", "professor", "aluno"]),
        situacao: z.enum(["ativo", "inativo"]).default("ativo"),
      }),

      response: {
        201: z.object({
          user: z.object({
            id: z.string(),
            nome: z.string(),
            usuario: z.string(),
            perfil: z.enum(["admin", "professor", "aluno"]),
            situacao: z.enum(["ativo", "inativo"]),
            dtInclusao: z.string(),
          }),
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

    const { nome, usuario, senha, perfil, situacao } = parseDataata.data;

    try {
      const repo = AppDataSource.getRepository(User);

      const existingUser = await repo.findOne({ where: { usuario } });

      if (existingUser) {
        return response.status(400).json({
          message: "Usuário já existe",
        });
      }

      const hashedPassword = await hash(senha, 10);

      const newUser = repo.create({
        nome,
        usuario,
        senha: hashedPassword,
        perfil,
        situacao,
      });

      await repo.save(newUser);

      const resultData = {
        user: {
          id: newUser.id,
          nome: newUser.nome,
          usuario: newUser.usuario,
          perfil: newUser.perfil,
          situacao: newUser.situacao,
          dtInclusao: newUser.dtInclusao.toISOString(),
        },
      };

      const response_sucess = schema.response[201].parse(resultData);

      return response.status(201).json(response_sucess);
    } catch (error) {
      return response.status(500).json({
        message: "Ocorreu um erro ao criar usuário.",
      });
    }
  }

  static async update(request: Request, response: Response) {
    const schema = {
      summary: "Editar usuário",
      tags: ["User"],

      body: z.object({
        id: z.string(),
        nome: z.string().min(3),
        usuario: z.string().min(3),
        senha: z.string().min(6).optional().nullable(),
        perfil: z.enum(["admin", "professor", "aluno"]),
        situacao: z.enum(["ativo", "inativo"]),
      }),

      response: {
        200: z.object({
          user: z.object({
            id: z.string(),
            nome: z.string(),
            usuario: z.string(),
            perfil: z.enum(["admin", "professor", "aluno"]),
            situacao: z.enum(["ativo", "inativo"]),
            dtInclusao: z.string(),
          }),
        }),
      },
    };

    const parseData = schema.body.safeParse(request.body);

    if (!parseData.success) {
      return response.status(400).json({
        message: "Erro na validação",
        errors: parseData.error.issues,
      });
    }

    const userAuthenticated = request.user;

    if (!userAuthenticated) return response.status(401).json({ message: "Não autenticado" });

    const { id, nome, usuario, perfil, situacao, senha } = parseData.data;

    try {
      const repo = AppDataSource.getRepository(User);

      const user = await repo.findOne({ where: { id } });

      if (!user) {
        return response.status(404).json({ message: "Usuário não encontrado" });
      }

      const existingUser = await repo.findOne({ where: { usuario } });

      if (existingUser && existingUser.id !== id) {
        return response.status(400).json({ message: "Nome de usuário já está em uso" });
      }

      if (userAuthenticated.perfil === "aluno") {
        return response.status(403).json({ message: "Você não tem permissão" });
      }

      if (userAuthenticated.perfil === "professor" && user.perfil !== "aluno") {
        return response.status(403).json({ message: "Professores só podem editar alunos" });
      }

      if (userAuthenticated.perfil === "professor" && perfil !== "aluno") {
        return response.status(403).json({ message: "Professores não podem alterar o perfil de usuários" });
      }

      if (senha) {
        user.senha = await hash(senha, 10);
      }

      user.nome = nome;
      user.usuario = usuario;
      user.perfil = perfil;
      user.situacao = situacao;

      await repo.save(user);

      const resultData = {
        user: {
          id: user.id,
          nome: user.nome,
          usuario: user.usuario,
          perfil: user.perfil,
          situacao: user.situacao,
          dtInclusao: user.dtInclusao.toISOString(),
        },
      };

      const response_sucess = schema.response[200].parse(resultData);

      return response.status(200).json(response_sucess);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  }

  static async delete(request: Request, response: Response) {
    const schema = {
      summary: "Deletar usuário",
      tags: ["User"],
      params: z.object({
        id: z.string(),
      }),

      response: {
        200: z.object({
          message: z.string(),
        }),
      },
    };

    const parseData = schema.params.safeParse(request.params);

    if (!parseData.success) {
      return response.status(400).json({
        message: "Erro na validação",
        errors: parseData.error.issues,
      });
    }

    const userAuthenticated = request.user;
    if (!userAuthenticated) return response.status(401).json({ message: "Não autenticado" });

    const { id } = parseData.data;

    try {
      const repo = AppDataSource.getRepository(User);
      const imcRepo = AppDataSource.getRepository(EvaluationIMC);

      const user = await repo.findOne({ where: { id } });

      if (!user) {
        return response.status(404).json({ message: "Usuário não encontrado" });
      }

      if (userAuthenticated.perfil === "aluno") {
        return response.status(403).json({ message: "Você não tem permissão" });
      }

      if (userAuthenticated.perfil === "professor") {
        return response.status(403).json({ message: "Professores não podem excluir usuários" });
      }

      const evaluationsCount = await imcRepo.count({
        where: [
          { aluno: { id: user.id } },
          { professor: { id: user.id } },
        ],
      });

      if (evaluationsCount > 0) {
        return response.status(400).json({
          message: "Não é possível excluir este usuário pois existem avaliações vinculadas",
        });
      }

      await repo.remove(user);

      const response_sucess = schema.response[200].parse({
        message: "Usuário excluído com sucesso",
      });

      return response.status(200).json(response_sucess);
    } catch (error) {
      return response.status(500).json({ message: "Erro ao excluir usuário" });
    }
  }

  static async list(request: Request, response: Response) {
    const schema = {
      summary: "Listar usuários",
      tags: ["User"],
      response: {
        200: z.object({
          users: z.array(
            z.object({
              id: z.string(),
              nome: z.string(),
              usuario: z.string(),
              perfil: z.enum(["admin", "professor", "aluno"]),
              situacao: z.enum(["ativo", "inativo"]),
              dtInclusao: z.string(),
            })
          ),
        }),
      },
    };

    const userAuthenticated = request.user;

    if (!userAuthenticated) {
      return response.status(401).json({ message: "Não autenticado" });
    }

    try {
      const repo = AppDataSource.getRepository(User);

      let users: User[] = [];

      if (userAuthenticated.perfil === "admin") {
        users = await repo.find();
      }
      else if (userAuthenticated.perfil === "professor") {
        users = await repo.find({
          where: { perfil: "aluno" },
        });
      }
      else {
        return response.status(403).json({
          message: "Você não tem permissão para listar usuários",
        });
      }

      const resultData = {
        users: users.map((u) => ({
          id: u.id,
          nome: u.nome,
          usuario: u.usuario,
          perfil: u.perfil,
          situacao: u.situacao,
          dtInclusao: u.dtInclusao.toISOString(),
        })),
      };

      const response_sucess = schema.response[200].parse(resultData);

      return response.status(200).json(response_sucess);
    } catch (error) {
      return response.status(500).json({
        message: "Erro ao listar usuários",
      });
    }
  }
}
