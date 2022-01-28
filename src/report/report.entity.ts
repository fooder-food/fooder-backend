import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum  ReportStatus{
    PENDING = 'pending',
    ACCEPT = 'accept',
    REJECT = 'reject',
    COMPLETED ='completed',
}
 

@Entity('report')
export class Report extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @Column()
    content: string;

    @Column({ type: 'enum', enum:ReportStatus, default: ReportStatus.PENDING })
    status: ReportStatus;

    @Column()
    target: string;

    @Column()
    reportType: string;

    @Column()
    type: string;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({
        name: 'user_id'
    })
    reporter: User;

    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
      
}
