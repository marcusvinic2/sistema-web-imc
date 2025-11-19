import { IUserRepository } from "../../repositories/IUserRepository";

export class ListUsersUseCase {
  constructor(private usersRepository: IUserRepository) { }

  async execute() {
    const users = await this.usersRepository.list();

    return {
      users: users.map((u) => ({
        id: u.id,
        nome: u.nome,
        usuario: u.usuario,
        perfil: u.perfil,
        situacao: u.situacao,
        dtInclusao: u.dtInclusao.toISOString(),
      })),
    };
  }
}
