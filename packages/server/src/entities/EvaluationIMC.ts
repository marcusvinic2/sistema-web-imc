import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity("avaliacao_imc")
export class EvaluationIMC {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "decimal" })
  altura!: number;

  @Column({ type: "decimal" })
  peso!: number;

  @Column({ type: "decimal" })
  imc!: number;

  @Column({ length: 30 })
  classificacao!: string;

  @Column({ name: "dt_inclusao", type: "datetime" })
  dtInclusao!: Date;

  @ManyToOne(() => User, (user) => user.avaliacoesFeitas, {
    onDelete: "NO ACTION",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "id_usuario_avaliacao" })
  professor!: User;

  @ManyToOne(() => User, (user) => user.avaliacoesRecebidas, {
    onDelete: "NO ACTION",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "id_usuario_aluno" })
  aluno!: User;
}
