import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  dni: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  role: 'admin' | 'doctor' | 'patient' | 'receptionist';

  @Column({ default: 'Activo' })
  status: string;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  password?: string; // Solo para admin o doctor con clave normal

  @Column({ nullable: true })
  pin?: string; // Para pacientes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
