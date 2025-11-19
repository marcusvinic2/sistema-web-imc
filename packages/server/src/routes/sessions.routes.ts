import { Router } from "express";
import { LoginController } from "../modules/users/useCases/login/LoginController";
import { RefreshTokenController } from "../modules/users/useCases/refreshToken/RefreshTokenController";
import { LogoutController } from "../modules/users/useCases/logout/LogoutController";

const sessionsRoutes = Router();

const loginController = new LoginController();
const refreshController = new RefreshTokenController();
const logoutController = new LogoutController();

sessionsRoutes.post("/session", (req, res) => loginController.handle(req, res));
sessionsRoutes.post("/session/refresh", (req, res) => refreshController.handle(req, res));
sessionsRoutes.post("/session/logout", (req, res) => logoutController.handle(req, res));

export { sessionsRoutes };
