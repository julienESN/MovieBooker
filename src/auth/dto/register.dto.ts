/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

//https://docs.nestjs.com/techniques/validation

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: "Email de l'utilisateur",
  })
  @IsEmail({}, { message: 'Veuillez fournir un email valide' })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: "Nom complet de l'utilisateur",
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  name: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mot de passe (min. 8 caractères)',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;
}
