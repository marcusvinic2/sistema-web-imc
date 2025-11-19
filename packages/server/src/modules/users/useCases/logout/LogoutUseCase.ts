import { IUserTokenRepository } from "../../repositories/IUserTokenRepository";

type LogoutRequest = {
  refresh_token: string;
};

export class LogoutUseCase {
  constructor(private tokensRepository: IUserTokenRepository) { }

  async execute({ refresh_token }: LogoutRequest) {
    await this.tokensRepository.deleteByRefreshToken(refresh_token);

    return {
      message: "Logout realizado com sucesso.",
    };
  }
}
