import { Controller, Get, Param, NotFoundException, Patch, Body, BadRequestException, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Appointment } from '../../core/entities/Appointment.entity';
import { User } from '../../core/entities/User.entity';
import { SPECIALTY_ROUTE_STEPS, DEFAULT_STEPS } from '../../core/constants/routes.constants';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  private readonly STANDARD_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'
  ];

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get('available-slots')
  @ApiOperation({ summary: 'Obtener cupos disponibles por especialidad y fecha' })
  async getAvailableSlots(@Query('specialty') specialty: string, @Query('date') date: string) {
    if (!specialty || !date) {
      throw new BadRequestException('Falta especialidad o fecha');
    }

    const doctors = await this.userRepository.find({ where: { role: 'doctor', specialty } });
    if (doctors.length === 0) {
      return { success: true, data: [] };
    }

    const doctorIds = doctors.map(d => d.id);
    const existingAppointments = await this.appointmentRepository.find({
      where: { doctorId: In(doctorIds), date, status: In(['pending', 'in_progress', 'completed', 'arrived']) }
    });

    const availableSlots = [];

    for (const slot of this.STANDARD_SLOTS) {
      const availableDoctor = doctors.find(doc => 
        !existingAppointments.some(app => app.doctorId === doc.id && app.time === slot)
      );

      if (availableDoctor) {
        const ROOMS: Record<string, { room: string; floor: string }> = {
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
        const locationInfo = ROOMS[availableDoctor.specialty] || { room: `Consultorio ${availableDoctor.id}`, floor: 'Piso 1' };
        availableSlots.push({
          time: slot,
          doctorId: availableDoctor.id,
          doctorName: `Dr. ${availableDoctor.firstName} ${availableDoctor.lastName}`,
          specialty: availableDoctor.specialty,
          room: locationInfo.room,
          floor: locationInfo.floor,
        });
      }
    }

    return { success: true, data: availableSlots };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva cita' })
  async createAppointment(@Body() body: Partial<Appointment> & { patientDni?: string }) {
    if (body.date && body.time && body.doctorId) {
      const existing = await this.appointmentRepository.findOne({
        where: { doctorId: body.doctorId, date: body.date, time: body.time, status: In(['pending', 'in_progress', 'completed', 'arrived']) }
      });
      if (existing) {
        throw new BadRequestException('El cupo ya ha sido ocupado por otro paciente');
      }
    }

    let actualPatientId = body.patientId;
    let actualPatientName = body.patientName;

    if (body.patientDni || (body.patientId && !body.patientId.includes('-'))) {
      const dni = body.patientDni || body.patientId;
      const patient = await this.userRepository.findOne({ where: { dni, role: 'patient' } });
      if (!patient) {
        throw new BadRequestException(`Paciente no encontrado con el DNI ${dni}. El paciente debe registrarse primero.`);
      }
      actualPatientId = patient.id;
      actualPatientName = `${patient.firstName} ${patient.lastName}`;
    }

    const newAppointment = this.appointmentRepository.create({
      ...body,
      patientId: actualPatientId,
      patientName: actualPatientName,
    });
    await this.appointmentRepository.save(newAppointment);
    return { success: true, data: newAppointment };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las citas' })
  async getAllAppointments() {
    const appointments = await this.appointmentRepository.find();
    return { success: true, data: appointments };
  }

  @Get('urgencies')
  @ApiOperation({ summary: 'Obtener pacientes de urgencias' })
  async getUrgencies() {
    const appointments = await this.appointmentRepository.find({ where: { isUrgency: true, status: 'pending' } });
    return { success: true, data: appointments };
  }

  @Get('current/:patientId')
  @ApiOperation({ summary: 'Obtener la cita actual del paciente' })
  async getCurrentAppointment(@Param('patientId') patientId: string) {
    const today = new Date().toISOString().split('T')[0];
    const appointment = await this.appointmentRepository.findOne({ 
      where: { patientId, date: today } 
    });
    
    if (!appointment) {
      throw new NotFoundException('No hay citas programadas para hoy');
    }

    return { success: true, data: appointment };
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Obtener las citas del día para un doctor' })
  async getDoctorAppointments(@Param('doctorId') doctorId: string) {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await this.appointmentRepository.find({
      where: { doctorId, date: today }
    });
    return { success: true, data: appointments };
  }

  @Patch('doctor/:doctorId/emergency')
  @ApiOperation({ summary: 'Declarar emergencia y reprogramar citas pendientes' })
  async declareEmergency(@Param('doctorId') doctorId: string) {
    const today = new Date().toISOString().split('T')[0];
    await this.appointmentRepository.update(
      { doctorId, date: today, status: 'pending' },
      { status: 'rescheduled' }
    );
    return { success: true, message: 'Citas reprogramadas por emergencia' };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de la cita' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'arrived' | 'no_show' | 'completed' | 'rescheduled' | 'emergency' }
  ) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Cita no encontrada');

    appointment.status = body.status;
    await this.appointmentRepository.save(appointment);

    return { success: true, data: appointment };
  }

  @Patch(':id/advance-step')
  @ApiOperation({ summary: 'Avanzar al siguiente paso en la ruta clínica' })
  async advanceStep(@Param('id') id: string) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Cita no encontrada');

    const specialtySteps = SPECIALTY_ROUTE_STEPS[appointment.specialty] || DEFAULT_STEPS;
    
    if (appointment.currentStepIndex < specialtySteps.length - 1) {
      appointment.currentStepIndex++;
      if (appointment.status === 'pending' || appointment.status === 'arrived') {
        appointment.status = 'in_progress';
      }
      await this.appointmentRepository.save(appointment);
    } else {
      appointment.status = 'completed';
      await this.appointmentRepository.save(appointment);
    }

    return { success: true, data: appointment, currentStepIndex: appointment.currentStepIndex };
  }

  @Post(':id/derive-treatment')
  @ApiOperation({ summary: 'Derivar paciente a tratamiento específico (Cáncer Cuello Uterino)' })
  async deriveTreatment(
    @Param('id') id: string,
    @Body() body: { treatment: 'Radioterapia' | 'Cirugía Oncológica' }
  ) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Cita no encontrada');

    appointment.status = 'completed';
    await this.appointmentRepository.save(appointment);

    const targetDoctor = await this.userRepository.findOne({ 
      where: { specialty: body.treatment, role: 'doctor' } 
    });

    if (!targetDoctor) {
      throw new BadRequestException(`No hay especialistas registrados para ${body.treatment}`);
    }

    let nextHour = parseInt(appointment.time.split(':')[0]) + 1;
    if (isNaN(nextHour) || nextHour > 17) nextHour = 8; // Reset to morning if late

    const newAppointment = this.appointmentRepository.create({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: targetDoctor.id,
      doctorName: `${targetDoctor.firstName} ${targetDoctor.lastName}`,
      specialty: body.treatment,
      room: body.treatment === 'Radioterapia' ? 'Unidad de Radioterapia' : 'Centro Quirúrgico',
      floor: body.treatment === 'Radioterapia' ? 'Piso 1, Ala Sur' : 'Piso 3, Ala Central',
      time: `${nextHour.toString().padStart(2, '0')}:00`,
      date: appointment.date,
      status: 'pending',
      currentStepIndex: 0
    });

    await this.appointmentRepository.save(newAppointment);

    return { success: true, message: `Ruta de ${body.treatment} generada con éxito` };
  }
}
