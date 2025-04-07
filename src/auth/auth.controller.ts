/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
@ApiTags('Authentification')
//https://github.com/stuyy/nestjs-passport-jwt-example/blob/master/src/auth/auth.controller.ts
//Help me to understand
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @SwaggerApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Données invalides ou utilisateur déjà existant 400',
  })
  @UsePipes(new ValidationPipe())
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @SwaggerApiResponse({ status: 200, description: 'Connexion réussie' })
  @SwaggerApiResponse({
    status: 401,
    description: 'Email ou mdp incorrect',
  })
  @UsePipes(new ValidationPipe())
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
