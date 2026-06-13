import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from '../../core/entities/User.entity';
import { PharmacyItem } from '../../core/entities/PharmacyItem.entity';
import { Bed } from '../../core/entities/Bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PharmacyItem, Bed])],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
