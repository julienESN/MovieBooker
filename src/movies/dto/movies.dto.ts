/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDto {
  @ApiProperty({ description: 'Nom du film (Exemple Titanic)' })
  @IsString()
  @IsNotEmpty()
  query: string;
}
