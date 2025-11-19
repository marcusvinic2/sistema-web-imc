import { AppDataSource } from "../../../../../database/data-source";
import { User } from "../../../../../entities/User";
import { IUserRepository } from "../../../repositories/IUserRepository";
import { ICreateUserDTO } from "../../../dtos/ICreateUserDTO";

export class UserRepository implements IUserRepository {
  private repo = AppDataSource.getRepository(User);

  async create(data: ICreateUserDTO): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(user: User): Promise<User> {
    return this.repo.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async list(): Promise<User[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUsername(usuario: string): Promise<User | null> {
    return this.repo.findOne({ where: { usuario } });
  }
}
