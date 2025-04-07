/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
//https://docs.nestjs.com/controllers
@ApiTags('Utilisateurs')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }
}
