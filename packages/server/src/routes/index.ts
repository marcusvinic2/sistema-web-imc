import { Router } from "express";
import { sessionsRoutes } from "./sessions.routes";
import { usersRoutes } from "./users.routes";
import { evaluationsRoutes } from "./evaluations.routes";

const routes = Router();

routes.use(sessionsRoutes);
routes.use(usersRoutes);
routes.use(evaluationsRoutes);

export { routes };
