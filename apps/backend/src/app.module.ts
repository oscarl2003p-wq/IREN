import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { RoutesModule } from './modules/routes/routes.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { AdminModule } from './modules/admin/admin.module';
import { User } from './core/entities/User.entity';
import { Appointment } from './core/entities/Appointment.entity';
import { MedicalRecord } from './core/entities/MedicalRecord.entity';
import { PharmacyItem } from './core/entities/PharmacyItem.entity';
import { Bed } from './core/entities/Bed.entity';
import { DatabaseSeederService } from './core/database-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [User, Appointment, MedicalRecord, PharmacyItem, Bed],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Appointment, PharmacyItem, Bed]),
    AuthModule, 
    AppointmentsModule, 
    RoutesModule, 
    MedicalRecordsModule,
    AdminModule
  ],
  controllers: [],
  providers: [DatabaseSeederService],
})
export class AppModule {}

