import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Logs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user: string;

    @Column()
    type: string;

    @Column()
    description: string;

    @Column()
    status: string;

    @CreateDateColumn()
    time: Date;
}