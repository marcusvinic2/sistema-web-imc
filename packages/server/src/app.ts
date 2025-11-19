import "reflect-metadata";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { routes } from "./routes";
import { AppDataSource } from "./database/data-source";
class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.app.use(cors());
    this.middlewares();
    this.routes();

    AppDataSource.initialize()
      .then(() => {
        console.log("Banco de dados conectado");
      })
      .catch((err: unknown) => {
        console.error("Erro ao conectar no banco:", err);
      });
  }

  middlewares() {
    this.app.use(express.json({ limit: "8mb" }));
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  routes() {
    this.app.use(routes);
  }
}

export default new App().app;
