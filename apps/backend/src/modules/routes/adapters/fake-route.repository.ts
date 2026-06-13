import { Injectable } from '@nestjs/common';

export interface RouteStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  timeCompleted?: string;
}

export interface PatientRoute {
  patientId: string;
  currentProgress: number;
  steps: RouteStep[];
}

export interface RouteRepositoryPort {
  findRouteByPatientId(patientId: string): Promise<PatientRoute | null>;
}

@Injectable()
export class FakeRouteRepository implements RouteRepositoryPort {
  private routes: PatientRoute[] = [
    {
      patientId: '1',
      currentProgress: 50,
      steps: [
        {
          id: 'step-1',
          name: 'Admisión',
          description: 'Registro y verificación',
          status: 'completed',
          timeCompleted: '07:42'
        },
        {
          id: 'step-2',
          name: 'Triaje',
          description: 'Signos vitales\nPA 118/76 - FC 78',
          status: 'completed',
        },
        {
          id: 'step-3',
          name: 'Oncología',
          description: 'Consulta con especialista\nEn curso — Consultorio 4',
          status: 'in_progress',
        },
        {
          id: 'step-4',
          name: 'Cirugía',
          description: 'Evaluación preoperatoria\nProgramado 18 jun - 10:30',
          status: 'pending',
        }
      ]
    }
  ];

  async findRouteByPatientId(patientId: string): Promise<PatientRoute | null> {
    const route = this.routes.find((r) => r.patientId === patientId);
    return route || null;
  }
}
