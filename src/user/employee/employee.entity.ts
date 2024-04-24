import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstname: string;

    @Column()
    lastnaem: string;

    @Column()
    age: number;

    @Column()
    salary: number;

    @Column()
    password: string;
}