import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { UserToken } from "./UserToken";
import { EvaluationIMC } from "./EvaluationIMC";

export type Perfil = "admin" | "aluno" | "professor";
export type Situacao = "ativo" | "inativo";

@Entity("usuario")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 60 })
  nome!: string;

  @Column({ unique: true, length: 60 })
  usuario!: string;

  @Column({ length: 255 })
  senha!: string;

  @Column({ type: "text" })
  perfil!: Perfil;

  @Column({ type: "text" })
  situacao!: Situacao;

  @CreateDateColumn({ name: "dt_inclusao" })
  dtInclusao!: Date;

  @OneToMany(() => UserToken, (token) => token.usuario)
  tokens!: UserToken[];

  @OneToMany(() => EvaluationIMC, (av) => av.professor)
  avaliacoesFeitas!: EvaluationIMC[];

  @OneToMany(() => EvaluationIMC, (av) => av.aluno)
  avaliacoesRecebidas!: EvaluationIMC[];
}
