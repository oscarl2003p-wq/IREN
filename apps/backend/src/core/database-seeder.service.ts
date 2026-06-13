import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/User.entity';
import { Appointment } from './entities/Appointment.entity';
import { PharmacyItem } from './entities/PharmacyItem.entity';
import { Bed } from './entities/Bed.entity';

// Mapa de consultorios reales por especialidad
export const SPECIALTY_ROOMS: Record<string, { room: string; floor: string }> = {
  'Oncología Ginecológica': { room: 'Consultorio 4', floor: 'Piso 2 - Ala Norte' },
  'Radioterapia': { room: 'Unidad de Radioterapia', floor: 'Piso 1 - Ala Sur' },
  'Cardiología': { room: 'Consultorio 5', floor: 'Piso 1 - Ala Norte' },
  'Anatomía Patológica': { room: 'Lab. Anatomía Patológica', floor: 'Piso 2 - Ala Este' },
  'Patología Clínica': { room: 'Laboratorio Central', floor: 'Piso 1 - Área Lab.' },
  'Centro Quirúrgico': { room: 'Centro Quirúrgico', floor: 'Piso 3 - Ala Central' },
  'Hospitalización Oncológica': { room: 'Hospitalización Piso 4', floor: 'Piso 4 - Medicina Oncológica' },
  'Cirugía Oncológica': { room: 'Sala de Operaciones I', floor: 'Piso 3 - Centro Quirúrgico' },
  'Consulta Externa': { room: 'Consultorios Externos', floor: 'Piso 1 - Ala Consultas' },
};

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Appointment) private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(PharmacyItem) private readonly pharmacyRepo: Repository<PharmacyItem>,
    @InjectRepository(Bed) private readonly bedRepo: Repository<Bed>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      this.logger.log('Base de datos ya tiene datos, saltando seed.');
      return;
    }

    this.logger.log('Base de datos vacía, sembrando datos iniciales...');

    // ---- PACIENTES ----
    const patient1 = this.userRepo.create({
      id: 'p1',
      dni: '78451236',
      firstName: 'Roberto',
      lastName: 'Gomez',
      role: 'patient',
      status: 'Activo',
      pin: '1234',
    });
    const patient2 = this.userRepo.create({
      id: 'p2',
      dni: '45678912',
      firstName: 'Maria',
      lastName: 'Lopez',
      role: 'patient',
      status: 'Activo',
      pin: '1234',
    });
    const patient3 = this.userRepo.create({
      id: 'p3',
      dni: '33445566',
      firstName: 'Ana',
      lastName: 'Torres',
      role: 'patient',
      status: 'Activo',
      pin: '1234',
    });

    // ---- DOCTORES / ESPECIALISTAS ----
    // Consultas y especialidades clásicas
    const doctor1 = this.userRepo.create({
      id: 'dr1',
      dni: '12345678',
      firstName: 'Rosa',
      lastName: 'Quispe',
      role: 'doctor',
      status: 'Activo',
      specialty: 'Oncología Ginecológica',
      password: 'password123',
    });
    const doctor2 = this.userRepo.create({
      id: 'dr2',
      dni: '87654321',
      firstName: 'Carlos',
      lastName: 'Mendoza',
      role: 'doctor',
      status: 'Activo',
      specialty: 'Radioterapia',
      password: 'password123',
    });
    const doctor3 = this.userRepo.create({
      id: 'dr3',
      dni: '44556677',
      firstName: 'Luis',
      lastName: 'Perez',
      role: 'doctor',
      status: 'Activo',
      specialty: 'Cardiología',
      password: 'password123',
    });
    // Anatomía Patológica
    const doctor4 = this.userRepo.create({
      id: 'dr4',
      dni: '55667788',
      firstName: 'Patricia',
      lastName: 'Huanca',
      role: 'doctor',
      status: 'Activo',
      specialty: 'Anatomía Patológica',
      password: 'password123',
    });
    // Patología Clínica / Laboratorio
    const doctor5 = this.userRepo.create({
      id: 'dr5',
      dni: '66778899',
      firstName: 'Jorge',
      lastName: 'Salinas',
      role: 'doctor',
      status: 'Activo',
      specialty: 'Patología Clínica',
      password: 'password123',
    });
    // Centro Quirúrgico
    const doctor6 = this.userRepo.create({
      id: 'dr6',
      dni: '77889900',
      firstName: 'Miguel',
      lastName: 'Ríos',
      role: 'doctor',
      status: 'Activo',
      specialty: 'Centro Quirúrgico',
      password: 'password123',
    });
    // Hospitalización Oncológica
    const doctor7 = this.userRepo.create({
      id: 'dr7',
      dni: '88990011',
      firstName: 'Carmen',
      lastName: 'Vargas',
      role: 'doctor',
      status: 'Activo',
      specialty: 'Hospitalización Oncológica',
      password: 'password123',
    });
    // Cirugía Oncológica
    const doctor8 = this.userRepo.create({
      id: 'dr8',
      dni: '99001122',
      firstName: 'Fernando',
      lastName: 'Castro',
      role: 'doctor',
      status: 'Activo',
      specialty: 'Cirugía Oncológica',
      password: 'password123',
    });

    // ---- ADMIN & RECEPTIONIST ----
    const admin = this.userRepo.create({
      id: 'admin1',
      dni: '00000000',
      firstName: 'Administrador',
      lastName: 'IREN',
      role: 'admin',
      status: 'Activo',
      password: 'admin',
    });

    const receptionist = this.userRepo.create({
      id: 'rec1',
      dni: '11111111',
      firstName: 'Recepcionista',
      lastName: 'Principal',
      role: 'receptionist',
      status: 'Activo',
      password: 'admin',
    });

    await this.userRepo.save([
      patient1, patient2, patient3,
      doctor1, doctor2, doctor3, doctor4, doctor5, doctor6, doctor7, doctor8,
      admin, receptionist,
    ]);
    this.logger.log('✅ Usuarios sembrados (3 pacientes, 8 especialistas, 1 admin, 1 recepcionista)');
    this.logger.log('📋 Sin citas pre-cargadas — sistema listo para flujo desde cero');

    // ---- FARMACIA ----
    const meds = [
      this.pharmacyRepo.create({ name: 'Paracetamol 500mg', stock: 1250, status: 'Óptimo' }),
      this.pharmacyRepo.create({ name: 'Paclitaxel 30mg', stock: 15, status: 'Crítico' }),
      this.pharmacyRepo.create({ name: 'Ondansetrón 8mg', stock: 120, status: 'Bajo' }),
      this.pharmacyRepo.create({ name: 'Ibuprofeno 400mg', stock: 800, status: 'Óptimo' }),
      this.pharmacyRepo.create({ name: 'Tramadol 50mg', stock: 45, status: 'Bajo' }),
      this.pharmacyRepo.create({ name: 'Cisplatino 50mg', stock: 8, status: 'Crítico' }),
    ];
    await this.pharmacyRepo.save(meds);
    this.logger.log('✅ Farmacia sembrada');

    // ---- CAMAS ----
    const beds = [
      this.bedRepo.create({ room: 'Sala A', number: 'A-01', status: 'Disponible' }),
      this.bedRepo.create({ room: 'Sala A', number: 'A-02', status: 'Ocupada', patientId: 'p1', patientName: 'Roberto Gomez' }),
      this.bedRepo.create({ room: 'Sala A', number: 'A-03', status: 'Mantenimiento' }),
      this.bedRepo.create({ room: 'Sala B', number: 'B-01', status: 'Disponible' }),
      this.bedRepo.create({ room: 'Sala B', number: 'B-02', status: 'Ocupada', patientId: 'p3', patientName: 'Ana Torres' }),
      this.bedRepo.create({ room: 'UCI', number: 'UCI-01', status: 'Disponible' }),
      this.bedRepo.create({ room: 'UCI', number: 'UCI-02', status: 'Disponible' }),
      this.bedRepo.create({ room: 'Emergencia', number: 'E-01', status: 'Disponible' }),
    ];
    await this.bedRepo.save(beds);
    this.logger.log('✅ Camas sembradas');
    this.logger.log('🎉 Seed completo. Base de datos lista.');
  }
}
