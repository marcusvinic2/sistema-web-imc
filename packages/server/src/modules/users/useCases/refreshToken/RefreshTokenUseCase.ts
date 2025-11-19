import { IUserTokenRepository } from "../../repositories/IUserTokenRepository";
import { IUserRepository } from "../../repositories/IUserRepository";
import { AppError } from "../../../../shared/errors/AppError";
import { sign } from "jsonwebtoken";
import authConfig from "../../../../config/auth";
import crypto from "crypto";

type RefreshRequest = {
  refresh_token: string;
};

export class RefreshTokenUseCase {
  constructor(
    private tokensRepository: IUserTokenRepository,
    private usersRepository: IUserRepository,
  ) { }

  async execute({ refresh_token }: RefreshRequest) {
    const token = await this.tokensRepository.findByRefreshToken(refresh_token);

    if (!token) throw new AppError("Refresh token inválido", 401);

    const now = new Date();
    if (now > token.expiracaoToken)
      throw new AppError("Refresh token expirado", 401);

    const user = await this.usersRepository.findById(token.idUsuario);
    if (!user) throw new AppError("Usuário não encontrado", 401);
    if (user.situacao === "inativo") throw new AppError("Usuário inativo", 403);

    const newAccessToken = sign(
      { id: user.id, perfil: user.perfil },
      authConfig.jwt.secret,
      { expiresIn: "1d" },
    );

    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    const newExpiration = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    token.refreshToken = newRefreshToken;
    token.expiracaoToken = newExpiration;

    await this.tokensRepository.save(token);

    return {
      token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }
}
