import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Admin {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    fullname: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    created_by: string;
}