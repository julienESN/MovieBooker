/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Reservation } from './entities/reservation.entity';
import { User } from '../user/entities/user.entity';

describe('ReservationController', () => {
  let reservationController: ReservationController;
  let reservationService: ReservationService;

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

  const mockAvailableSlots = [
    {
      startTime: new Date('2025-04-15T10:00:00Z'),
      endTime: new Date('2025-04-15T12:00:00Z'),
    },
    {
      startTime: new Date('2025-04-15T12:00:00Z'),
      endTime: new Date('2025-04-15T14:00:00Z'),
    },
  ];

  const mockReservationService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    findAvailableTimeSlots: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: mockReservationService,
        },
      ],
    }).compile();

    reservationController = module.get<ReservationController>(
      ReservationController,
    );
    reservationService = module.get<ReservationService>(ReservationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(reservationController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        movieId: 11021,
        movieTitle: 'Titanic',
        startTime: '2025-04-15T14:00:00Z',
      };

      const req = { user: { userId: 1 } };

      const expectedReservation = {
        id: 3,
        ...createReservationDto,
        userId: 1,
        startTime: new Date(createReservationDto.startTime),
        endTime: new Date(
          new Date(createReservationDto.startTime).setHours(
            new Date(createReservationDto.startTime).getHours() + 2,
          ),
        ),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        user: mockUser,
      };

      mockReservationService.create.mockResolvedValue(expectedReservation);

      const result = await reservationController.create(
        createReservationDto,
        req,
      );

      expect(reservationService.create).toHaveBeenCalledWith(
        createReservationDto,
        req.user.userId,
      );
      expect(result).toEqual(expectedReservation);
    });

    it('should handle errors when creating a reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        movieId: 11021,
        movieTitle: 'Titanic',
        startTime: '2025-04-15T14:00:00Z',
      };

      const req = { user: { userId: 1 } };

      mockReservationService.create.mockRejectedValue(
        new BadRequestException('Error creating reservation'),
      );

      await expect(
        reservationController.create(createReservationDto, req),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all reservations for the user', async () => {
      const req = { user: { userId: 1 } };
      mockReservationService.findAllByUser.mockResolvedValue(mockReservations);

      const result = await reservationController.findAll(req);

      expect(reservationService.findAllByUser).toHaveBeenCalledWith(
        req.user.userId,
      );
      expect(result).toEqual(mockReservations);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available time slots for a date', async () => {
      const dateString = '2025-04-15';
      const req = { user: { userId: 1 } };
      mockReservationService.findAvailableTimeSlots.mockResolvedValue(
        mockAvailableSlots,
      );

      const result = await reservationController.getAvailableSlots(
        dateString,
        req,
      );

      expect(reservationService.findAvailableTimeSlots).toHaveBeenCalledWith(
        expect.any(Date),
        req.user.userId,
      );
      expect(result).toEqual(mockAvailableSlots);
    });

    it('should handle invalid date formats', async () => {
      const invalidDateString = 'not-a-date';
      const req = { user: { userId: 1 } };

      mockReservationService.findAvailableTimeSlots.mockResolvedValue([]);

      await reservationController.getAvailableSlots(invalidDateString, req);

      expect(reservationService.findAvailableTimeSlots).toHaveBeenCalledWith(
        expect.any(Date),
        req.user.userId,
      );

      const dateArg =
        mockReservationService.findAvailableTimeSlots.mock.calls[0][0];

      expect(mockReservationService.findAvailableTimeSlots).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      const id = '1';
      const req = { user: { userId: 1 } };
      mockReservationService.findOne.mockResolvedValue(mockReservations[0]);

      const result = await reservationController.findOne(id, req);

      expect(reservationService.findOne).toHaveBeenCalledWith(
        +id,
        req.user.userId,
      );
      expect(result).toEqual(mockReservations[0]);
    });

    it('should handle reservation not found', async () => {
      const id = '999';
      const req = { user: { userId: 1 } };
      mockReservationService.findOne.mockRejectedValue(
        new NotFoundException('Reservation not found'),
      );

      await expect(reservationController.findOne(id, req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      const id = '1';
      const req = { user: { userId: 1 } };
      mockReservationService.remove.mockResolvedValue(undefined);

      const result = await reservationController.remove(id, req);

      expect(reservationService.remove).toHaveBeenCalledWith(
        +id,
        req.user.userId,
      );
      expect(result).toEqual({ message: 'Réservation annulée avec succès' });
    });

    it('should handle errors when removing a reservation', async () => {
      const id = '1';
      const req = { user: { userId: 1 } };
      mockReservationService.remove.mockRejectedValue(
        new BadRequestException(
          "Impossible d'annuler une réservation déjà commencée",
        ),
      );

      await expect(reservationController.remove(id, req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
