import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appointmentId: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column()
  doctorName: string;

  @Column()
  date: string;

  @Column()
  stage: string;

  @Column({ nullable: true })
  diagnosis: string;

  @Column({ type: 'text' })
  notes: string;

  @Column('simple-json', { nullable: true })
  vitals: {
    bloodPressure: string;
    temperature: string;
    weight: string;
    height: string;
    heartRate: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
