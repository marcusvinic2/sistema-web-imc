import { Router } from "express";
import { SessionController } from "../controllers/SessionController";
import { UserController } from "../controllers/UserController";
import { EvaluationIMCController } from "../controllers/EvaluationIMCController";
import { ensureAuthenticated } from "../middlewares/auth";

const routes = Router();
routes.post("/session", SessionController.login);
routes.post("/session/refresh", SessionController.refresh);
routes.post("/session/logout", SessionController.logout);

// rotas privadas
routes.use(ensureAuthenticated);
routes.post("/user", UserController.create);
routes.put("/user", UserController.update);
routes.delete("/user/:id", UserController.delete);
routes.get("/users", UserController.list);

routes.post("/avaliation-imc", EvaluationIMCController.create);
routes.put("/avaliation-imc/:id", EvaluationIMCController.update);
routes.delete("/avaliation-imc/:id", EvaluationIMCController.delete);
routes.get("/avaliation-imc/:alunoId", EvaluationIMCController.list);

routes.post("/avaliation-imc/filter", EvaluationIMCController.filter);

export default routes;
