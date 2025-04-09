import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    example: 11021,
    description: 'ID du film à réserver',
  })
  @IsNumber()
  @IsNotEmpty({ message: "L'ID du film est obligatoire" })
  movieId: number;

  @ApiProperty({
    example: 'Titanic',
    description: 'Titre du film',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le titre du film est obligatoire' })
  movieTitle: string;

  @ApiProperty({
    example: '2025-04-10T18:00:00.000Z',
    description: 'Date et heure de début de la réservation (format ISO)',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'La date et heure de début sont obligatoires' })
  startTime: string;
}
