import { UserToken } from "../../../entities/UserToken";

export interface IUserTokenRepository {
  create(data: {
    refreshToken: string;
    expiracaoToken: Date;
    idUsuario: string;
  }): Promise<UserToken>;

  findByRefreshToken(refreshToken: string): Promise<UserToken | null>;
  deleteByRefreshToken(refreshToken: string): Promise<void>;
  save(token: UserToken): Promise<UserToken>;
}
