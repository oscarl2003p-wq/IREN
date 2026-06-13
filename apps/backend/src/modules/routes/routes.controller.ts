import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../core/entities/Appointment.entity';
import { SPECIALTY_ROUTE_STEPS, DEFAULT_STEPS } from '../../core/constants/routes.constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Routes')
@ApiBearerAuth()
@Controller('routes')
export class RoutesController {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  @Get(':patientId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener la ruta de atención del paciente (basada en citas reales del día)' })
  @ApiResponse({ status: 200, description: 'Ruta encontrada' })
  @ApiResponse({ status: 404, description: 'Sin citas para hoy' })
  async getPatientRoute(@Param('patientId') patientId: string) {
    const today = new Date().toISOString().split('T')[0];

    const appointments = await this.appointmentRepository.find({
      where: { patientId, date: today },
      order: { time: 'ASC' },
    });

    if (appointments.length === 0) {
      throw new NotFoundException('No se encontraron citas para este paciente el día de hoy');
    }

    // ---- Construir pasos de ruta por especialidad ----
    const allSteps: any[] = [];
    let completedSteps = 0;

    for (const appt of appointments) {
      const specialtySteps = SPECIALTY_ROUTE_STEPS[appt.specialty] || DEFAULT_STEPS;

      for (let i = 0; i < specialtySteps.length; i++) {
        const stepDef = specialtySteps[i];
        let status: 'pending' | 'in_progress' | 'completed' = 'pending';

        if (appt.status === 'completed') {
          status = 'completed';
          completedSteps++;
        } else if (appt.status === 'arrived' || appt.status === 'in_progress') {
          if (i < appt.currentStepIndex) {
            status = 'completed';
            completedSteps++;
          } else if (i === appt.currentStepIndex) {
            status = 'in_progress';
          } else {
            status = 'pending';
          }
        }

        let estimatedTime = appt.time;
        if (i > 0 && appt.time) {
          const baseHour = parseInt(appt.time.split(':')[0]);
          estimatedTime = `${String(baseHour + i).padStart(2, '0')}:00 (Aprox)`;
        }

        allSteps.push({
          id: `${appt.id}-step-${i}`,
          name: stepDef.name,
          description: `${stepDef.description}\n📍 ${appt.room} — ${appt.floor}\n⏰ ${estimatedTime} | Dr(a). ${appt.doctorName}`,
          status,
          specialty: appt.specialty,
        });
      }
    }

    const currentProgress =
      allSteps.length > 0
        ? Math.round((completedSteps / allSteps.length) * 100)
        : 0;

    return {
      success: true,
      data: {
        patientId,
        currentProgress,
        steps: allSteps,
      },
    };
  }
}
