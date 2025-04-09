import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { MoviesService } from '../movies/movies.service';

// https://docs.nestjs.com/providers
// https://docs.nestjs.com/exception-filters
// https://typeorm.io/#/find-options
// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date
// https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
// https://www.freecodecamp.org/news/how-to-validate-a-date-in-javascript/#:~:text=How%20to%20Check%20if%20a%20Date%20is%20in%20the%20Past,date%20with%20the%20current%20date.&text=JavaScript%20knows%20how%20to%20compare,values%20and%20compare%20them%20manually.

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private moviesService: MoviesService,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
    userId: number,
  ): Promise<Reservation> {
    try {
      await this.moviesService.getMovieById(
        createReservationDto.movieId.toString(),
      );
    } catch (error) {
      throw new BadRequestException("Le film spécifié n'existe pas");
    }

    const startTime = new Date(createReservationDto.startTime);

    if (isNaN(startTime.getTime())) {
      throw new BadRequestException('La date de début est invalide');
    }

    const now = new Date();
    if (startTime < now) {
      throw new BadRequestException(
        'Impossible de réserver pour une date passée',
      );
    }

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);

    const conflictingReservations = await this.reservationRepository.find({
      where: [
        {
          userId,
          startTime: LessThan(endTime),
          endTime: MoreThan(startTime),
        },
      ],
    });

    if (conflictingReservations.length > 0) {
      throw new BadRequestException(
        'Vous avez déjà une réservation sur ce créneau horaire. Respectez un délai de 2 heures entre chaque film.',
      );
    }

    const reservation = this.reservationRepository.create({
      movieId: createReservationDto.movieId,
      movieTitle: createReservationDto.movieTitle,
      userId,
      startTime,
      endTime,
    });

    return this.reservationRepository.save(reservation);
  }

  async findAllByUser(userId: number): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { userId },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette réservation');
    }

    return reservation;
  }

  async remove(id: number, userId: number): Promise<void> {
    const reservation = await this.findOne(id, userId);

    const now = new Date();
    if (reservation.startTime < now) {
      throw new BadRequestException(
        "Impossible d'annuler une réservation déjà commencée ou terminée",
      );
    }

    await this.reservationRepository.remove(reservation);
  }

  async findAvailableTimeSlots(
    date: Date,
    userId: number,
  ): Promise<{ startTime: Date; endTime: Date }[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(10, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(22, 0, 0, 0);

    const userReservations = await this.reservationRepository.find({
      where: {
        userId,
        startTime: Between(startOfDay, endOfDay),
      },
      order: { startTime: 'ASC' },
    });

    const availableSlots: { startTime: Date; endTime: Date }[] = [];
    let currentTime = new Date(startOfDay);

    if (userReservations.length === 0) {
      while (currentTime < endOfDay) {
        const slotEndTime = new Date(currentTime);
        slotEndTime.setHours(slotEndTime.getHours() + 2);

        if (slotEndTime <= endOfDay) {
          availableSlots.push({
            startTime: new Date(currentTime),
            endTime: new Date(slotEndTime),
          });
        }

        currentTime.setHours(currentTime.getHours() + 2);
      }
      return availableSlots;
    }

    for (let i = 0; i <= userReservations.length; i++) {
      const slotEndTime =
        i < userReservations.length ? userReservations[i].startTime : endOfDay;

      if (slotEndTime.getTime() - currentTime.getTime() >= 2 * 60 * 60 * 1000) {
        while (
          currentTime.getTime() + 2 * 60 * 60 * 1000 <=
          slotEndTime.getTime()
        ) {
          const endSlot = new Date(currentTime);
          endSlot.setHours(endSlot.getHours() + 2);

          availableSlots.push({
            startTime: new Date(currentTime),
            endTime: new Date(endSlot),
          });

          currentTime.setHours(currentTime.getHours() + 2);
        }
      }

      if (i < userReservations.length) {
        currentTime = new Date(userReservations[i].endTime);
      }
    }

    return availableSlots;
  }
}
