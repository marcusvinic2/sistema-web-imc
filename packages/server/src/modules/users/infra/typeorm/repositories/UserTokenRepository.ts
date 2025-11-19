import { AppDataSource } from "../../../../../database/data-source";
import { UserToken } from "../../../../../entities/UserToken";
import { IUserTokenRepository } from "../../../repositories/IUserTokenRepository";

export class UserTokenRepository implements IUserTokenRepository {
  private repo = AppDataSource.getRepository(UserToken);

  async create(data: {
    refreshToken: string;
    expiracaoToken: Date;
    idUsuario: string;
  }): Promise<UserToken> {
    const token = this.repo.create(data);
    return this.repo.save(token);
  }

  async findByRefreshToken(refreshToken: string): Promise<UserToken | null> {
    return this.repo.findOne({ where: { refreshToken } });
  }

  async deleteByRefreshToken(refreshToken: string): Promise<void> {
    await this.repo.delete({ refreshToken });
  }

  async save(token: UserToken): Promise<UserToken> {
    return this.repo.save(token);
  }
}
