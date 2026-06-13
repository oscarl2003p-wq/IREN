import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../../core/entities/MedicalRecord.entity';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly repository: Repository<MedicalRecord>
  ) {}

  @Post()
  async create(@Body() body: Partial<MedicalRecord>) {
    const record = this.repository.create(body);
    return await this.repository.save(record);
  }

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId') patientId: string) {
    return await this.repository.find({
      where: { patientId },
      order: { createdAt: 'DESC' }
    });
  }

  @Get('doctor/:doctorId')
  async findByDoctor(@Param('doctorId') doctorId: string) {
    return await this.repository.find({
      where: { doctorId },
      order: { createdAt: 'DESC' }
    });
  }
}
