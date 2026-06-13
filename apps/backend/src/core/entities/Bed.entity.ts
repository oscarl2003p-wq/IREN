import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  room: string;

  @Column()
  number: string;

  @Column()
  status: 'Disponible' | 'Ocupada' | 'Mantenimiento';

  @Column({ nullable: true })
  patientId: string;

  @Column({ nullable: true })
  patientName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
