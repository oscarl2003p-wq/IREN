import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/entities/User.entity';
import { PharmacyItem } from '../../core/entities/PharmacyItem.entity';
import { Bed } from '../../core/entities/Bed.entity';

@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(PharmacyItem) private readonly pharmacyRepository: Repository<PharmacyItem>,
    @InjectRepository(Bed) private readonly bedRepository: Repository<Bed>
  ) {}

  // ---- USERS ----
  @Get('users')
  async getUsers() {
    const users = await this.userRepository.find();
    return { success: true, users };
  }

  @Post('users')
  async createUser(@Body() body: Partial<User>) {
    // Para simplificar la demo, asigamos DNI falso si no hay y aseguramos PIN
    if (!body.dni) body.dni = Math.floor(10000000 + Math.random() * 90000000).toString();
    if (body.role === 'patient') body.pin = '1234';
    if (body.role === 'doctor') body.password = 'password123';
    
    const user = this.userRepository.create(body);
    await this.userRepository.save(user);
    return { success: true, user };
  }

  @Put('users')
  async updateUser(@Body() body: Partial<User>) {
    await this.userRepository.update(body.id as string, body);
    return { success: true };
  }

  @Delete('users')
  async deleteUser(@Query('id') id: string) {
    await this.userRepository.delete(id);
    return { success: true };
  }

  // ---- PHARMACY ----
  @Get('pharmacy')
  async getPharmacy() {
    const items = await this.pharmacyRepository.find();
    return { success: true, items };
  }

  @Post('pharmacy')
  async createPharmacyItem(@Body() body: Partial<PharmacyItem>) {
    const item = this.pharmacyRepository.create(body);
    await this.pharmacyRepository.save(item);
    return { success: true, item };
  }

  @Put('pharmacy')
  async updatePharmacyItem(@Body() body: Partial<PharmacyItem>) {
    await this.pharmacyRepository.update(body.id as string, body);
    return { success: true };
  }

  @Delete('pharmacy')
  async deletePharmacyItem(@Query('id') id: string) {
    await this.pharmacyRepository.delete(id);
    return { success: true };
  }

  // ---- BEDS ----
  @Get('beds')
  async getBeds() {
    const beds = await this.bedRepository.find();
    return { success: true, beds };
  }

  @Post('beds')
  async createBed(@Body() body: Partial<Bed>) {
    const bed = this.bedRepository.create(body);
    await this.bedRepository.save(bed);
    return { success: true, bed };
  }

  @Put('beds')
  async updateBed(@Body() body: Partial<Bed>) {
    await this.bedRepository.update(body.id as string, body);
    return { success: true };
  }

  @Delete('beds')
  async deleteBed(@Query('id') id: string) {
    await this.bedRepository.delete(id);
    return { success: true };
  }
}
