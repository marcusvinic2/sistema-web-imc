import { AppDataSource } from "../data-source";
import { User } from "../../entities/User";
import { hash } from "bcrypt";

async function seedAdmin() {
  try {
    console.log("Iniciando seed...");

    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);

    const existingAdmin = await userRepo.findOne({
      where: { usuario: "admin" },
    });

    if (existingAdmin) {
      console.log("Admin já existe. Nenhuma ação necessária.");
      process.exit(0);
    }

    const passwordHash = await hash("123456", 10);

    const admin = userRepo.create({
      nome: "Administrador",
      usuario: "admin",
      senha: passwordHash,
      perfil: "admin",
      situacao: "ativo",
    });

    await userRepo.save(admin);

    console.log("Admin criado com sucesso!");
    console.log("Usuário: admin");
    console.log("Senha: 123456");

    process.exit(0);
  } catch (error) {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  }
}

seedAdmin();
