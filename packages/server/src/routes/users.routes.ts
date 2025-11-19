import { Router } from "express";
import { userAuthenticated } from "../shared/middlewares/userAuthenticated";

import { CreateUserController } from "../modules/users/useCases/createUser/CreateUserController";
import { UpdateUserController } from "../modules/users/useCases/updateUser/UpdateUserController";
import { DeleteUserController } from "../modules/users/useCases/deleteUser/DeleteUserController";
import { ListUsersController } from "../modules/users/useCases/listUsers/ListUsersController";

const usersRoutes = Router();

usersRoutes.use(userAuthenticated);
usersRoutes.post("/user", (req, res) => new CreateUserController().handle(req, res));
usersRoutes.put("/user", (req, res) => new UpdateUserController().handle(req, res));
usersRoutes.delete("/user/:id", (req, res) => new DeleteUserController().handle(req, res));
usersRoutes.get("/users", (req, res) => new ListUsersController().handle(req, res));

export { usersRoutes };
