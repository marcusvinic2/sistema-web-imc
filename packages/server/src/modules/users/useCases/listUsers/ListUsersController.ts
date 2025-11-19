import { Request, Response } from "express";
import { UserRepository } from "../../infra/typeorm/repositories/UserRepository";
import { ListUsersUseCase } from "./ListUsersUseCase";

export class ListUsersController {
  async handle(request: Request, response: Response) {
    const usersRepo = new UserRepository();
    const useCase = new ListUsersUseCase(usersRepo);

    const result = await useCase.execute();
    return response.status(200).json(result);
  }
}
