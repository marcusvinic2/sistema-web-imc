import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(() => console.log("Banco SQLite conectado!"))
  .catch((err) => console.error("Erro ao conectar ao SQLite:", err));
