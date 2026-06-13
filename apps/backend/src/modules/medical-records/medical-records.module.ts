import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecord } from '../../core/entities/MedicalRecord.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord])],
  controllers: [MedicalRecordsController],
  providers: [],
})
export class MedicalRecordsModule {}
