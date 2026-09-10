import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'investigator@circuit.gov' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '••••••••' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
