import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  patientName: string;

  @Column()
  doctorId: string;

  @Column()
  doctorName: string;

  @Column()
  specialty: string;

  @Column()
  room: string;

  @Column()
  floor: string;

  @Column()
  time: string;

  @Column()
  date: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'arrived' | 'no_show' | 'rescheduled' | 'emergency';

  @Column({ default: false })
  isUrgency: boolean;

  @Column({ default: 0 })
  currentStepIndex: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
