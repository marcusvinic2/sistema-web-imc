import { Router } from "express";
import { userAuthenticated } from "../shared/middlewares/userAuthenticated";

import { CreateEvaluationController } from "../modules/evaluations/useCases/createEvaluation/CreateEvaluationController";
import { UpdateEvaluationController } from "../modules/evaluations/useCases/updateEvaluation/UpdateEvaluationController";
import { DeleteEvaluationController } from "../modules/evaluations/useCases/deleteEvaluation/DeleteEvaluationController";
import { ListEvaluationsByAlunoController } from "../modules/evaluations/useCases/listByAluno/ListEvaluationsByAlunoController";
import { FilterEvaluationsController } from "../modules/evaluations/useCases/filterEvaluations/FilterEvaluationsController";

const evaluationsRoutes = Router();

const createEvaluationController = new CreateEvaluationController();
const updateEvaluationController = new UpdateEvaluationController();
const deleteEvaluationController = new DeleteEvaluationController();
const listEvaluationsByAlunoController = new ListEvaluationsByAlunoController();
const filterEvaluationsController = new FilterEvaluationsController();

evaluationsRoutes.use(userAuthenticated);
evaluationsRoutes.post("/avaliation-imc", (req, res) => createEvaluationController.handle(req, res));
evaluationsRoutes.put("/avaliation-imc/:id", (req, res) => updateEvaluationController.handle(req, res));
evaluationsRoutes.delete("/avaliation-imc/:id", (req, res) => deleteEvaluationController.handle(req, res));
evaluationsRoutes.get("/avaliation-imc/:alunoId", (req, res) => listEvaluationsByAlunoController.handle(req, res));
evaluationsRoutes.post("/avaliation-imc/filter", (req, res) => filterEvaluationsController.handle(req, res));

export { evaluationsRoutes };
