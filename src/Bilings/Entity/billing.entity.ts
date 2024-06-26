import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Billing {
  @Column({ primary: true, unique: true })
  username: string;

  @Column()
  CardNumber: string;

  @Column()
  CardHolder: string;

  @Column()
  ExpirationDate: string;

  @Column()
  CVC: string;
}
