/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { GenreResponse } from './interfaces/movie.interface';

describe('MoviesService', () => {
  let moviesService: MoviesService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    moviesService = module.get<MoviesService>(MoviesService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(moviesService).toBeDefined();
  });

  describe('searchMovieByTitle', () => {
    it('should search movies by title', async () => {
      const title = 'Titanic';
      const mockResponse = {
        data: {
          results: [
            {
              id: 11021,
              title: 'Titanic',
              release_date: '1997-12-19',
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await moviesService.searchMovieByTitle(title);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/search/movie?query=Titanic'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.any(String),
            accept: 'application/json',
          }),
        }),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should encode special characters in the title', async () => {
      const title = 'Fast & Furious';
      const mockResponse = {
        data: {
          results: [
            {
              id: 12345,
              title: 'Fast & Furious',
              release_date: '2001-06-22',
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      await moviesService.searchMovieByTitle(title);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/search/movie?query=Fast%20%26%20Furious'),
        expect.any(Object),
      );
    });
  });

  describe('getMovieById', () => {
    it('should get a movie by id', async () => {
      const movieId = '11021';
      const mockResponse = {
        data: {
          id: 11021,
          title: 'Titanic',
          release_date: '1997-12-19',
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await moviesService.getMovieById(movieId);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/movie/${movieId}`),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.any(String),
            accept: 'application/json',
          }),
        }),
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getNowPlaying', () => {
    it('should get now playing movies', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 11021,
              title: 'Titanic',
              release_date: '1997-12-19',
            },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await moviesService.getNowPlaying();

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/movie/now_playing'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.any(String),
            accept: 'application/json',
          }),
        }),
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getGenres', () => {
    it('should get movie genres', async () => {
      const mockResponse = {
        data: {
          genres: [
            { id: 28, name: 'Action' },
            { id: 12, name: 'Adventure' },
            { id: 16, name: 'Animation' },
          ],
        },
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await moviesService.getGenres();

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/genre/movie/list'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.any(String),
            accept: 'application/json',
          }),
        }),
      );
      expect(result).toEqual(mockResponse.data as GenreResponse);
    });
  });
});
