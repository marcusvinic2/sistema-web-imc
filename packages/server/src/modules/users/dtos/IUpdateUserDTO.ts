import { Perfil, Situacao } from "../../../types/user.types";

export interface IUpdateUserDTO {
  id: string;
  nome: string;
  usuario: string;
  perfil: Perfil;
  situacao: Situacao;
  senha?: string | null;
}
