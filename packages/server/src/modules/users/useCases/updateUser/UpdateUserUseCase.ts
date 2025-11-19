import { IUserRepository } from "../../repositories/IUserRepository";
import { IUpdateUserDTO } from "../../dtos/IUpdateUserDTO";
import { AppError } from "../../../../shared/errors/AppError";
import { hash } from "bcrypt";

export class UpdateUserUseCase {
  constructor(private usersRepository: IUserRepository) { }

  async execute(data: IUpdateUserDTO) {
    const user = await this.usersRepository.findById(data.id);

    if (!user) throw new AppError("Usuário não encontrado.", 404);

    const existingUsername = await this.usersRepository.findByUsername(data.usuario);
    if (existingUsername && existingUsername.id !== user.id) {
      throw new AppError("Já existe um usuário com este nome de usuário.", 400);
    }

    user.nome = data.nome;
    user.usuario = data.usuario;
    user.perfil = data.perfil;
    user.situacao = data.situacao;

    if (data.senha && data.senha.trim() !== "") {
      user.senha = await hash(data.senha, 10);
    }

    const updated = await this.usersRepository.update(user);

    return {
      id: updated.id,
      nome: updated.nome,
      usuario: updated.usuario,
      perfil: updated.perfil,
      situacao: updated.situacao,
      dtInclusao: updated.dtInclusao.toISOString(),
    };
  }
}
