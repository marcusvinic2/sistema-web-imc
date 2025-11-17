import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("usuario_token")
export class UserToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "refresh_token", length: 255 })
  refreshToken!: string;

  @Column({ name: "expiracao_token", type: "datetime" })
  expiracaoToken!: Date;

  @CreateDateColumn({ name: "dt_inclusao", type: "datetime" })
  dtInclusao!: Date;

  @Column({ name: "id_usuario", type: "uuid" })
  idUsuario!: string;

  @ManyToOne(() => User, (user) => user.tokens, {
    onDelete: "NO ACTION",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "id_usuario" })
  usuario!: User;
}
