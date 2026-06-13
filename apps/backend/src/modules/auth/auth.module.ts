import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { User } from '../../core/entities/User.entity';

export const JWT_SECRET = 'IREN_SECURE_SECRET_2026';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '30m' }, // 30 minutos de expiración por seguridad
    }),
  ],
  controllers: [AuthController],
  providers: [],
  exports: [JwtModule],
})
export class AuthModule {}
