import { User } from "../../../entities/User";
import { ICreateUserDTO } from "../dtos/ICreateUserDTO";

export interface IUserRepository {
  create(data: ICreateUserDTO): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;

  list(): Promise<User[]>;

  findById(id: string): Promise<User | null>;
  findByUsername(usuario: string): Promise<User | null>;
}
