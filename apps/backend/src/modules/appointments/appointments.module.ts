import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from '../../core/entities/Appointment.entity';
import { User } from '../../core/entities/User.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User])],
  controllers: [AppointmentsController],
  providers: [],
})
export class AppointmentsModule {}
