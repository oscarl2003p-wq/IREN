export interface Patient {
  dni: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

export interface Appointment {
  id: string;
  patientDni: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  room: string;
  floor: string;
  time: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'arrived' | 'no_show';
}

export interface Doctor {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  specialty: string;
}

export interface RouteStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  timeCompleted?: string;
}

export interface PatientRoute {
  patientDni: string;
  currentProgress: number; // 0 to 100
  steps: RouteStep[];
}
