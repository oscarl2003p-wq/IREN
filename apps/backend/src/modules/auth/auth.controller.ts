import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../core/entities/User.entity';

export class LoginDto {
  @ApiProperty({ example: '78451236' })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  pin: string;

  @ApiProperty({ example: 'data:image/jpeg;base64,...' })
  @IsString()
  @IsNotEmpty()
  photoBase64: string;
}

export class DoctorLoginDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  pin: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login con DNI y fotografía (Paciente)' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    if (loginDto.pin !== '1234') {
      throw new UnauthorizedException('PIN incorrecto');
    }

    const patient = await this.userRepository.findOne({ where: { dni: loginDto.dni, role: 'patient' } });
    
    if (!patient) {
      throw new UnauthorizedException('Paciente no encontrado');
    }

    if (!loginDto.photoBase64) {
      throw new UnauthorizedException('Fotografía requerida para verificación');
    }

    const payload = { sub: patient.id, dni: patient.dni, role: patient.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
      }
    };
  }

  @Post('doctor-login')
  @ApiOperation({ summary: 'Login de médicos con DNI y Contraseña' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async doctorLogin(@Body() dto: DoctorLoginDto) {
    const doctor = await this.userRepository.findOne({ where: { dni: dto.dni, role: 'doctor' } });
    
    if (!doctor || doctor.password !== dto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: doctor.id, dni: doctor.dni, role: doctor.role, specialty: doctor.specialty };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      doctor: {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
      }
    };
  }

  @Post('receptionist-login')
  @ApiOperation({ summary: 'Login de recepcionista con DNI y Contraseña' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async receptionistLogin(@Body() dto: DoctorLoginDto) {
    const user = await this.userRepository.findOne({ where: { dni: dto.dni, role: 'receptionist' } });
    
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, dni: user.dni, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo paciente' })
  async register(@Body() dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { dni: dto.dni } });
    if (existing) {
      throw new BadRequestException('El paciente ya está registrado');
    }
    const patient = this.userRepository.create({
      dni: dto.dni,
      firstName: dto.firstName,
      lastName: dto.lastName,
      pin: dto.pin,
      role: 'patient',
      status: 'Activo',
    });
    await this.userRepository.save(patient);
    return { success: true, message: 'Paciente registrado exitosamente' };
  }
}
