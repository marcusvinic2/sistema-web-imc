import { IUserRepository } from "../../repositories/IUserRepository";
import { ICreateUserDTO } from "../../dtos/ICreateUserDTO";
import { AppError } from "../../../../shared/errors/AppError";
import { hash } from "bcrypt";

export class CreateUserUseCase {
  constructor(private usersRepository: IUserRepository) { }

  async execute(data: ICreateUserDTO) {
    const existing = await this.usersRepository.findByUsername(data.usuario);

    if (existing) throw new AppError("Nome de usuário já existe", 400);

    if (data.usuario.includes(" ")) throw new AppError("Nome de usuário não deve conter espaços.", 400);

    const passwordHash = await hash(data.senha, 10);

    const user = await this.usersRepository.create({
      ...data,
      senha: passwordHash,
    });

    return {
      id: user.id,
      nome: user.nome,
      usuario: user.usuario,
      perfil: user.perfil,
      situacao: user.situacao,
      dtInclusao: user.dtInclusao.toISOString(),
    };
  }
}
