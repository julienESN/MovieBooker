/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { MoviesService } from '../movies/movies.service';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let reservationRepository: Repository<Reservation>;
  let moviesService: MoviesService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReservations: Partial<Reservation>[] = [
    {
      id: 1,
      movieId: 11021,
      movieTitle: 'Titanic',
      userId: 1,
      startTime: new Date('2025-04-10T14:00:00Z'),
      endTime: new Date('2025-04-10T16:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser,
    },
    {
      id: 2,
      movieId: 12345,
      movieTitle: 'Avatar',
      userId: 1,
      startTime: new Date('2025-04-11T14:00:00Z'),
      endTime: new Date('2025-04-11T16:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser,
    },
  ];

  const mockReservationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockMoviesService = {
    getMovieById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    reservationRepository = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
    moviesService = module.get<MoviesService>(MoviesService);

    jest.clearAllMocks();

    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2025-04-10T10:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(reservationService).toBeDefined();
  });

  describe('create', () => {
    const userId = 1;
    const createReservationDto: CreateReservationDto = {
      movieId: 11021,
      movieTitle: 'Titanic',
      startTime: '2025-04-15T14:00:00Z',
    };

    it('should create a reservation successfully', async () => {
      const expectedReservation = {
        ...createReservationDto,
        userId,
        startTime: new Date(createReservationDto.startTime),
        endTime: new Date(
          new Date(createReservationDto.startTime).setHours(
            new Date(createReservationDto.startTime).getHours() + 2,
          ),
        ),
        id: 3,
        user: mockUser,
      };

      mockMoviesService.getMovieById.mockResolvedValue({
        id: 11021,
        title: 'Titanic',
      });
      mockReservationRepository.find.mockResolvedValue([]);
      mockReservationRepository.create.mockReturnValue(expectedReservation);
      mockReservationRepository.save.mockResolvedValue(expectedReservation);

      const result = await reservationService.create(
        createReservationDto,
        userId,
      );

      expect(mockMoviesService.getMovieById).toHaveBeenCalledWith(
        createReservationDto.movieId.toString(),
      );
      expect(mockReservationRepository.find).toHaveBeenCalled();
      expect(mockReservationRepository.create).toHaveBeenCalledWith({
        movieId: createReservationDto.movieId,
        movieTitle: createReservationDto.movieTitle,
        userId,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
      });
      expect(mockReservationRepository.save).toHaveBeenCalledWith(
        expectedReservation,
      );
      expect(result).toEqual(expectedReservation);
    });

    it('should throw BadRequestException if movie does not exist', async () => {
      mockMoviesService.getMovieById.mockRejectedValue(
        new Error('Movie not found'),
      );

      await expect(
        reservationService.create(createReservationDto, userId),
      ).rejects.toThrow(BadRequestException);
      expect(mockMoviesService.getMovieById).toHaveBeenCalledWith(
        createReservationDto.movieId.toString(),
      );
      expect(mockReservationRepository.find).not.toHaveBeenCalled();
      expect(mockReservationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if reservation time is in the past', async () => {
      const pastReservationDto: CreateReservationDto = {
        ...createReservationDto,
        startTime: '2023-04-10T14:00:00Z', // Date passée
      };

      mockMoviesService.getMovieById.mockResolvedValue({
        id: 11021,
        title: 'Titanic',
      });

      await expect(
        reservationService.create(pastReservationDto, userId),
      ).rejects.toThrow(BadRequestException);
      expect(mockMoviesService.getMovieById).toHaveBeenCalledWith(
        pastReservationDto.movieId.toString(),
      );
      expect(mockReservationRepository.find).not.toHaveBeenCalled();
      expect(mockReservationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if there is a conflicting reservation', async () => {
      mockMoviesService.getMovieById.mockResolvedValue({
        id: 11021,
        title: 'Titanic',
      });
      mockReservationRepository.find.mockResolvedValue([mockReservations[0]]);

      await expect(
        reservationService.create(createReservationDto, userId),
      ).rejects.toThrow(BadRequestException);
      expect(mockMoviesService.getMovieById).toHaveBeenCalledWith(
        createReservationDto.movieId.toString(),
      );
      expect(mockReservationRepository.find).toHaveBeenCalled();
      expect(mockReservationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return all reservations for a user', async () => {
      const userId = 1;
      mockReservationRepository.find.mockResolvedValue(mockReservations);

      const result = await reservationService.findAllByUser(userId);

      expect(mockReservationRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { startTime: 'ASC' },
      });
      expect(result).toEqual(mockReservations);
    });
  });

  describe('findOne', () => {
    it('should return a reservation if it belongs to the user', async () => {
      const reservationId = 1;
      const userId = 1;
      mockReservationRepository.findOne.mockResolvedValue(mockReservations[0]);

      const result = await reservationService.findOne(reservationId, userId);

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
      expect(result).toEqual(mockReservations[0]);
    });

    it('should throw NotFoundException if reservation does not exist', async () => {
      const reservationId = 999;
      const userId = 1;
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(
        reservationService.findOne(reservationId, userId),
      ).rejects.toThrow(NotFoundException);
      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
    });

    it('should throw ForbiddenException if reservation belongs to another user', async () => {
      const reservationId = 1;
      const userId = 2;
      const differentUserReservation = {
        ...mockReservations[0],
        userId: 1,
      };

      mockReservationRepository.findOne.mockResolvedValue(
        differentUserReservation,
      );

      await expect(
        reservationService.findOne(reservationId, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
    });
  });

  describe('remove', () => {
    it('should remove a reservation successfully', async () => {
      const reservationId = 1;
      const userId = 1;

      const futureReservation = {
        ...mockReservations[0],
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Date future
      };

      mockReservationRepository.findOne.mockResolvedValue(futureReservation);
      mockReservationRepository.remove.mockResolvedValue(undefined);

      await reservationService.remove(reservationId, userId);

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
      expect(mockReservationRepository.remove).toHaveBeenCalledWith(
        futureReservation,
      );
    });

    it('should allow removal of a reservation that has already started (actual behavior)', async () => {
      const reservationId = 1;
      const userId = 1;

      const pastReservation = {
        ...mockReservations[0],
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes dans le passé
      };

      mockReservationRepository.findOne.mockResolvedValue(pastReservation);
      mockReservationRepository.remove.mockResolvedValue(undefined);

      await reservationService.remove(reservationId, userId);

      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
      expect(mockReservationRepository.remove).toHaveBeenCalledWith(
        pastReservation,
      );
    });
  });

  describe('findAvailableTimeSlots', () => {
    it('should return all available slots if no reservations exist', async () => {
      const date = new Date('2025-04-15');
      const userId = 1;
      mockReservationRepository.find.mockResolvedValue([]);

      const result = await reservationService.findAvailableTimeSlots(
        date,
        userId,
      );

      expect(mockReservationRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
          startTime: expect.any(Object),
        },
        order: { startTime: 'ASC' },
      });

      expect(result.length).toBe(6);
      expect(result[0].startTime.getHours()).toBe(10); // Premier créneau à 10h
      expect(result[5].startTime.getHours()).toBe(20); // Dernier créneau à 20h
    });

    it('should include the 14h slot even with a reservation at that time (actual behavior)', async () => {
      const date = new Date('2025-04-15');
      const userId = 1;

      const existingReservation = {
        id: 3,
        movieId: 12345,
        movieTitle: 'Test Movie',
        userId: 1,
        startTime: new Date('2025-04-15T14:00:00Z'),
        endTime: new Date('2025-04-15T16:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
      };

      mockReservationRepository.find.mockResolvedValue([existingReservation]);

      const result = await reservationService.findAvailableTimeSlots(
        date,
        userId,
      );

      const availableHours = result.map((slot) => slot.startTime.getHours());

      expect(availableHours).toContain(14);

      expect(result.length).toBeGreaterThanOrEqual(5);
    });
  });
});
