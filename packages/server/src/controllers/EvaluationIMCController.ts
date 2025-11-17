import { Request, Response } from "express";
import { z } from "zod";
import { AppDataSource } from "../database/data-source";
import { EvaluationIMC } from "../entities/EvaluationIMC";
import { User } from "../entities/User";
import { calculateIMC } from "../helpers/calculate-imc";
import { FindOptionsWhere } from "typeorm";

export class EvaluationIMCController {
  static async create(request: Request, response: Response) {
    const schema = {
      summary: "Criar nova avaliação de IMC",
      tags: ["Avaliações"],
      body: z.object({
        alunoId: z.string(),
        peso: z.number().positive(),
        altura: z.number().positive(),
      }),
      response: {
        201: z.object({
          avaliacao: z.object({
            id: z.string(),
            altura: z.number(),
            peso: z.number(),
            imc: z.number(),
            classificacao: z.string(),
            dtInclusao: z.string(),
            professorId: z.string(),
            alunoId: z.string(),
          }),
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

    const { alunoId, peso, altura } = parseData.data;

    try {
      const authUser = request.user as {
        id: string;
        perfil: "admin" | "professor" | "aluno";
      } | undefined;

      if (!authUser) {
        return response.status(401).json({ message: "Não autenticado." });
      }

      if (!["admin", "professor"].includes(authUser.perfil)) {
        return response
          .status(403)
          .json({ message: "Somente admin ou professor podem criar avaliações." });
      }

      const userRepo = AppDataSource.getRepository(User);

      const professor = await userRepo.findOne({
        where: { id: authUser.id },
      });

      if (!professor) {
        return response
          .status(404)
          .json({ message: "Professor responsável não encontrado." });
      }

      if (professor.situacao === "inativo") {
        return response
          .status(400)
          .json({ message: "Professor inativo não pode criar avaliações." });
      }

      const aluno = await userRepo.findOne({
        where: { id: alunoId },
      });

      if (!aluno) {
        return response
          .status(404)
          .json({ message: "Aluno não encontrado." });
      }

      if (aluno.situacao === "inativo") {
        return response
          .status(400)
          .json({ message: "Não é possível avaliar um aluno inativo." });
      }

      if (aluno.perfil !== "aluno") {
        return response
          .status(400)
          .json({ message: "Somente usuários com perfil 'aluno' podem ser avaliados." });
      }

      const resultIMC = calculateIMC(altura, peso);
      const evalRepo = AppDataSource.getRepository(EvaluationIMC);

      const avaliacao = evalRepo.create({
        altura,
        peso,
        imc: resultIMC.imc,
        classificacao: resultIMC.classificacao,
        dtInclusao: new Date(),
        professor,
        aluno,
      });

      await evalRepo.save(avaliacao);

      const resultData = {
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

      const response_sucess = schema.response[201].parse(resultData);

      return response.status(201).json(response_sucess);
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: "Ocorreu um erro ao criar avaliação de IMC.",
      });
    }
  }

  static async update(request: Request, response: Response) {
    const schema = {
      summary: "Atualizar avaliação de IMC",
      tags: ["Avaliações"],
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        peso: z.number().positive(),
        altura: z.number().positive(),
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
      },
    };

    const parseParams = schema.params.safeParse(request.params);
    if (!parseParams.success)
      return response.status(400).json({ errors: parseParams.error.issues });

    const parseBody = schema.body.safeParse(request.body);
    if (!parseBody.success)
      return response.status(400).json({ errors: parseBody.error.issues });

    const { id } = parseParams.data;
    const { peso, altura } = parseBody.data;

    const userAuthenticated = request.user;
    if (!userAuthenticated) return response.status(401).json({ message: "Não autenticado" });

    const repo = AppDataSource.getRepository(EvaluationIMC);
    const avaliacao = await repo.findOne({
      where: { id },
      relations: ["aluno", "professor"],
    });

    if (!avaliacao)
      return response.status(404).json({ message: "Avaliação não encontrada" });

    if (userAuthenticated.perfil === "aluno")
      return response.status(403).json({ message: "Alunos não podem editar avaliações." });

    if (userAuthenticated.perfil === "professor" && avaliacao.professor.id !== userAuthenticated.id)
      return response.status(403).json({
        message: "Professor só pode editar avaliações que ele criou",
      });

    const resultIMC = calculateIMC(altura, peso);

    avaliacao.peso = peso;
    avaliacao.altura = altura;
    avaliacao.imc = resultIMC.imc;
    avaliacao.classificacao = resultIMC.classificacao;

    await repo.save(avaliacao);

    return response.status(200).json(
      schema.response[200].parse({ message: "Avaliação atualizada com sucesso" })
    );
  }

  static async delete(request: Request, response: Response) {
    const schema = {
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          message: z.string(),
        }),
      },
    };

    const parseParams = schema.params.safeParse(request.params);
    if (!parseParams.success)
      return response.status(400).json({ errors: parseParams.error.issues });

    const { id } = parseParams.data;

    const userAuthenticated = request.user;
    if (!userAuthenticated) return response.status(401).json({ message: "Não autenticado" });

    if (userAuthenticated.perfil !== "admin")
      return response.status(403).json({ message: "Somente admin pode excluir avaliações" });

    const repo = AppDataSource.getRepository(EvaluationIMC);
    const avaliacao = await repo.findOne({ where: { id } });

    if (!avaliacao)
      return response.status(404).json({ message: "Avaliação não encontrada" });

    await repo.remove(avaliacao);

    return response.status(200).json(
      schema.response[200].parse({
        message: "Avaliação removida com sucesso",
      })
    );
  }

  static async list(request: Request, response: Response) {
    const schema = {
      params: z.object({
        alunoId: z.string().optional(),
      }),
      response: {
        200: z.object({
          avaliacao: z.array(
            z.object({
              id: z.string(),
              altura: z.number(),
              peso: z.number(),
              imc: z.number(),
              classificacao: z.string(),
              dtInclusao: z.string(),
              professorId: z.string(),
            })
          ),
        }),
      },
    };

    const parseParams = schema.params.safeParse(request.params);
    if (!parseParams.success)
      return response.status(400).json({ errors: parseParams.error.issues });

    const userAuthenticated = request.user;
    if (!userAuthenticated)
      return response.status(401).json({ message: "Não autenticado" });

    const repo = AppDataSource.getRepository(EvaluationIMC);

    // alunos lista apenas suas proprias avaliações
    if (userAuthenticated.perfil === "aluno") {
      const lista = await repo.find({
        where: { aluno: { id: userAuthenticated.id } },
        relations: ["professor"],
        order: { dtInclusao: "DESC" },
      });

      return response.status(200).json({
        avaliacao: lista.map((a) => ({
          id: a.id,
          altura: a.altura,
          peso: a.peso,
          imc: a.imc,
          classificacao: a.classificacao,
          dtInclusao: a.dtInclusao.toISOString(),
          professorId: a.professor.id,
        })),
      });
    }

    // professor lista apenas as avaliações dos seus alunos
    if (userAuthenticated.perfil === "professor") {
      const lista = await repo.find({
        where: { professor: { id: userAuthenticated.id } },
        relations: ["aluno"],
        order: { dtInclusao: "DESC" },
      });

      return response.status(200).json({
        avaliacao: lista.map((a) => ({
          id: a.id,
          altura: a.altura,
          peso: a.peso,
          imc: a.imc,
          classificacao: a.classificacao,
          dtInclusao: a.dtInclusao.toISOString(),
          professorId: userAuthenticated.id,
        })),
      });
    }

    // admin lista todas as avaliações
    if (userAuthenticated.perfil === "admin") {
      const lista = await repo.find({
        relations: ["professor", "aluno"],
        order: { dtInclusao: "DESC" },
      });

      return response.status(200).json(
        schema.response[200].parse({
          avaliacao: lista.map((a) => ({
            id: a.id,
            altura: a.altura,
            peso: a.peso,
            imc: a.imc,
            classificacao: a.classificacao,
            dtInclusao: a.dtInclusao.toISOString(),
            professorId: a.professor.id,
          })),
        })
      );
    }

    return response.status(400).json({ message: "Perfil inválido" });
  }

  static async filter(request: Request, response: Response) {
    const schema = {
      body: z.object({
        alunoId: z.string().optional().nullable(),
        professorId: z.string().optional().nullable(),
      }),
      response: {
        200: z.object({
          avaliacao: z.array(
            z.object({
              id: z.string(),
              altura: z.number(),
              peso: z.number(),
              imc: z.number(),
              classificacao: z.string(),
              dtInclusao: z.string(),
              professorId: z.string(),
            })
          ),
        }),
      },
    };

    const parsed = schema.body.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        message: "Erro na validação",
        errors: parsed.error.issues,
      });
    }

    const { alunoId, professorId } = parsed.data;

    const userAuthenticated = request.user;
    if (!userAuthenticated)
      return response.status(401).json({ message: "Não autenticado" });

    const repo = AppDataSource.getRepository(EvaluationIMC);

    if (userAuthenticated.perfil === "aluno") {
      const lista = await repo.find({
        where: { aluno: { id: userAuthenticated.id } },
        relations: ["professor", "aluno"],
      });

      return response.json({
        avaliacao: lista.map((a) => ({
          id: a.id,
          altura: a.altura,
          peso: a.peso,
          imc: a.imc,
          classificacao: a.classificacao,
          dtInclusao: a.dtInclusao.toISOString(),
          professorId: a.professor.id,
        })),
      });
    }

    let where: FindOptionsWhere<EvaluationIMC> = {};

    if (alunoId) {
      where.aluno = { id: alunoId };
    }

    if (professorId) {
      where.professor = { id: professorId };
    }

    if (userAuthenticated.perfil === "professor") {
      where.professor = { id: userAuthenticated.id };
    }

    const lista = await repo.find({
      where,
      relations: ["professor", "aluno"],
    });

    const resultData = {
      avaliacao: lista.map((a) => ({
        id: a.id,
        altura: a.altura,
        peso: a.peso,
        imc: a.imc,
        classificacao: a.classificacao,
        dtInclusao: a.dtInclusao.toISOString(),
        professorId: a.professor.id,
      })),
    };

    return response.json(schema.response[200].parse(resultData));
  }
}
