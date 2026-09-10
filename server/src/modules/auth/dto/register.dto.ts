import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'investigator@circuit.gov' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '••••••••' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Rajesh Sharma' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Role, default: Role.INVESTIGATOR })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ example: 'Special Investigation Unit', required: false })
  @IsOptional()
  department?: string;

  @ApiProperty({ example: 'SIU-8821', required: false })
  @IsOptional()
  badgeNumber?: string;

  @ApiProperty({ example: 'Mumbai South', required: false })
  @IsOptional()
  district?: string;

  @ApiProperty({ example: 'Colaba Cyber Crime PS', required: false })
  @IsOptional()
  stationName?: string;

  @ApiProperty({ example: 'Senior Inspector / SHO', required: false })
  @IsOptional()
  inchargeRank?: string;

  @ApiProperty({ example: 'Inspector Vikram Shinde', required: false })
  @IsOptional()
  inchargeName?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  createdByHr?: boolean;
}

