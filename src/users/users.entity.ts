import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  uniqueId: string;

  @Column()
  username: string;

  @Column({unique: true})
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({select: false})
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createDate: string

  @UpdateDateColumn()
  updateDate: string

//   @BeforeInsert()
//   private hashPassword() {
//       if (this.password) {
//           this.password = hashSync(this.password);
//       }
//   }
}