import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

// Réponses API
const API_RESPONSES = {
  CREATED_201: {
    status: 201,
    description: 'Ressource créée avec succès',
  },
  OK_200: {
    status: 200,
    description: 'Opération réussie',
  },
  BAD_REQUEST_400: {
    status: 400,
    description: 'Requête invalide ou données incorrectes',
  },
  NOT_FOUND_404: {
    status: 404,
    description: 'Ressource non trouvée',
  },
  FORBIDDEN_403: {
    status: 403,
    description: 'Accès non autorisé à cette ressource',
  },
  SERVER_ERROR_500: {
    status: 500,
    description: 'Erreur interne du serveur',
  },
};

// Endpoints de réservation
const RESERVATION_RESPONSES = {
  CREATE: {
    ...API_RESPONSES.CREATED_201,
    description: 'La réservation a été créée avec succès',
  },
  CREATE_ERROR: {
    ...API_RESPONSES.BAD_REQUEST_400,
    description: 'Données invalides ou conflit de réservation',
  },
  FIND_ALL: {
    ...API_RESPONSES.OK_200,
    description: 'Liste des réservations récupérée avec succès',
  },
  FIND_ONE: {
    ...API_RESPONSES.OK_200,
    description: 'Réservation récupérée avec succès',
  },
  FIND_ONE_ERROR: {
    ...API_RESPONSES.NOT_FOUND_404,
    description: 'Réservation non trouvée',
  },
  AVAILABLE_SLOTS: {
    ...API_RESPONSES.OK_200,
    description: 'Liste des créneaux disponibles récupérée avec succès',
  },
  REMOVE: {
    ...API_RESPONSES.OK_200,
    description: 'Réservation annulée avec succès',
  },
  REMOVE_ERROR: {
    ...API_RESPONSES.BAD_REQUEST_400,
    description:
      "Impossible d'annuler une réservation déjà commencée ou terminée",
  },
};

@ApiTags('Réservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle réservation' })
  @SwaggerApiResponse(RESERVATION_RESPONSES.CREATE)
  @SwaggerApiResponse(RESERVATION_RESPONSES.CREATE_ERROR)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.reservationService.create(
      createReservationDto,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({
    summary: "Récupérer toutes les réservations de l'utilisateur",
  })
  @SwaggerApiResponse(RESERVATION_RESPONSES.FIND_ALL)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  async findAll(@Request() req: { user: { userId: number } }) {
    return this.reservationService.findAllByUser(req.user.userId);
  }

  @Get('available')
  @ApiOperation({ summary: 'Récupérer les créneaux disponibles pour une date' })
  @SwaggerApiResponse(RESERVATION_RESPONSES.AVAILABLE_SLOTS)
  @SwaggerApiResponse(API_RESPONSES.BAD_REQUEST_400)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  @ApiQuery({
    name: 'date',
    required: true,
    description:
      'Date pour laquelle vérifier les disponibilités (format: YYYY-MM-DD)',
  })
  async getAvailableSlots(
    @Query('date') dateString: string,
    @Request() req: { user: { userId: number } },
  ) {
    const date = new Date(dateString);
    return this.reservationService.findAvailableTimeSlots(
      date,
      req.user.userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une réservation par son ID' })
  @SwaggerApiResponse(RESERVATION_RESPONSES.FIND_ONE)
  @SwaggerApiResponse(RESERVATION_RESPONSES.FIND_ONE_ERROR)
  @SwaggerApiResponse(API_RESPONSES.FORBIDDEN_403)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
  ) {
    return this.reservationService.findOne(+id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une réservation' })
  @SwaggerApiResponse(RESERVATION_RESPONSES.REMOVE)
  @SwaggerApiResponse(RESERVATION_RESPONSES.FIND_ONE_ERROR)
  @SwaggerApiResponse(RESERVATION_RESPONSES.REMOVE_ERROR)
  @SwaggerApiResponse(API_RESPONSES.FORBIDDEN_403)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: number } },
  ) {
    await this.reservationService.remove(+id, req.user.userId);
    return { message: 'Réservation annulée avec succès' };
  }
}
