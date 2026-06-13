import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesController } from './routes.controller';
import { Appointment } from '../../core/entities/Appointment.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), AuthModule],
  controllers: [RoutesController],
  providers: [],
})
export class RoutesModule {}
