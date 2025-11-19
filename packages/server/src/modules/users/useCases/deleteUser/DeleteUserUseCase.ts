import { IUserRepository } from "../../repositories/IUserRepository";
import { AppError } from "../../../../shared/errors/AppError";
import { IEvaluationRepository } from "../../../evaluations/repositories/IEvaluationRepository";

export class DeleteUserUseCase {
  constructor(
    private usersRepository: IUserRepository,
    private evaluationsRepository: IEvaluationRepository,
  ) { }

  async execute(id: string) {
    const user = await this.usersRepository.findById(id);
    const evaluations = await this.evaluationsRepository.findEvaluationByUserId(id);

    if (!user) throw new AppError("Usuário não encontrado.", 404);

    if (user.perfil === "admin") {
      throw new AppError("Não é permitido excluir um usuário administrador.", 403);
    }



    if (evaluations.length > 0) {
      throw new AppError("Usuário possui avaliações vinculadas.", 400);
    }

    await this.usersRepository.delete(id);

    return {
      message: "Usuário excluído com sucesso.",
    };
  }
}
