import { Perfil, Situacao } from "../../../types/user.types";

export interface ICreateUserDTO {
  nome: string;
  usuario: string;
  senha: string;
  perfil: Perfil;
  situacao: Situacao;
}
