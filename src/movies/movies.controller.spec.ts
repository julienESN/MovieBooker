/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { SearchDto } from './dto/movies.dto';
import { GenreResponse } from './interfaces/movie.interface';

describe('MoviesController', () => {
  let moviesController: MoviesController;
  let moviesService: MoviesService;

  const mockMoviesService = {
    getNowPlaying: jest.fn(),
    searchMovieByTitle: jest.fn(),
    getMovieById: jest.fn(),
    getGenres: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    moviesController = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(moviesController).toBeDefined();
  });

  describe('getNowPlaying', () => {
    it('should return now playing movies', async () => {
      const mockResult = {
        results: [
          {
            id: 11021,
            title: 'Titanic',
            release_date: '1997-12-19',
          },
        ],
      };

      mockMoviesService.getNowPlaying.mockResolvedValue(mockResult);

      const result = await moviesController.getNowPlaying();

      expect(moviesService.getNowPlaying).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('search', () => {
    it('should search movies by title', async () => {
      const searchDto: SearchDto = {
        query: 'Titanic',
      };

      const mockResult = {
        results: [
          {
            id: 11021,
            title: 'Titanic',
            release_date: '1997-12-19',
          },
        ],
      };

      mockMoviesService.searchMovieByTitle.mockResolvedValue(mockResult);

      const result = await moviesController.search(searchDto);

      expect(moviesService.searchMovieByTitle).toHaveBeenCalledWith(
        searchDto.query,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getMovieById', () => {
    it('should get a movie by id', async () => {
      const movieId = '11021';
      const mockResult = {
        id: 11021,
        title: 'Titanic',
        release_date: '1997-12-19',
      };

      mockMoviesService.getMovieById.mockResolvedValue(mockResult);

      const result = await moviesController.getMovieById(movieId);

      expect(moviesService.getMovieById).toHaveBeenCalledWith(movieId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getGenres', () => {
    it('should get movie genres', async () => {
      const mockResult: GenreResponse = {
        genres: [
          { id: 28, name: 'Action' },
          { id: 12, name: 'Adventure' },
          { id: 16, name: 'Animation' },
        ],
      };

      mockMoviesService.getGenres.mockResolvedValue(mockResult);

      const result = await moviesController.getGenres();

      expect(moviesService.getGenres).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
