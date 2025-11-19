import { IUserRepository } from "../../repositories/IUserRepository";
import { IUserTokenRepository } from "../../repositories/IUserTokenRepository";
import { AppError } from "../../../../shared/errors/AppError";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import authConfig from "../../../../config/auth";
import crypto from "crypto";

type LoginRequest = {
  usuario: string;
  senha: string;
};

export class LoginUseCase {
  constructor(
    private usersRepository: IUserRepository,
    private tokensRepository: IUserTokenRepository,
  ) { }

  async execute({ usuario, senha }: LoginRequest) {
    const user = await this.usersRepository.findByUsername(usuario);

    if (!user) throw new AppError("Usuário ou senha inválidos", 403);
    if (user.situacao === "inativo") throw new AppError("Usuário inativo", 403);

    const passwordMatch = await compare(senha, user.senha);
    if (!passwordMatch) throw new AppError("Usuário ou senha inválidos", 403);

    const token = sign(
      { id: user.id, perfil: user.perfil },
      authConfig.jwt.secret,
      { expiresIn: "1d" },
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const expiracaoToken = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await this.tokensRepository.create({
      refreshToken,
      expiracaoToken,
      idUsuario: user.id,
    });

    return {
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
  }
}
