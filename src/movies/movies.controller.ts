import { Controller, Get, Param, Query } from '@nestjs/common';
import { GenreResponse } from './interfaces/movie.interface';

import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { SearchDto } from './dto/movies.dto';
import { MoviesService } from './movies.service';

// I created two objects for the responses to avoid repetition, marked in UPPERCASE (important constant values) to replace magic values. I didn't do this in my user controller because I only have one async function there.
const API_RESPONSES = {
  OK_200: {
    status: 200,
    description: 'Operation success',
  },
  SERVER_ERROR_500: {
    status: 500,
    description: 'Internal server error from the backend',
  },
  NOT_FOUND_404: {
    status: 404,
    description: 'Resource not found , probably cause the api key is not valid',
  },
};

const ENDPOINT_RESPONSES = {
  NOW_PLAYING: {
    ...API_RESPONSES.OK_200,
    description: "Liste des films actuellement à l'affiche",
  },
  SEARCH: {
    ...API_RESPONSES.OK_200,
    description: 'Résultats de la recherche de films',
  },
  MOVIE_BY_ID: {
    ...API_RESPONSES.OK_200,
    description: "Film correspondant à l'ID",
  },
  GENRES: {
    ...API_RESPONSES.OK_200,
    description: 'Liste des genres de films',
  },
};
// After a small talk w U i noticed that i have make 4 endpoints or , one was excepted mb sorry ,readed the notion too fast , all endpoint work with swagger :)

@ApiTags('Liste des endpoints')
@Controller('movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Get('now_playing')
  @ApiOperation({ summary: "Films actuellement à l'affiche" })
  @SwaggerApiResponse(ENDPOINT_RESPONSES.NOW_PLAYING)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  @SwaggerApiResponse(API_RESPONSES.NOT_FOUND_404)
  async getNowPlaying(): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.moviesService.getNowPlaying();
  }

  @Get('search')
  @ApiOperation({ summary: 'Recherche de films' })
  @SwaggerApiResponse(ENDPOINT_RESPONSES.SEARCH)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  @SwaggerApiResponse(API_RESPONSES.NOT_FOUND_404)
  async search(@Query() searchDto: SearchDto): Promise<any> {
    return await this.moviesService.searchMovieByTitle(searchDto.query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Recherche de film par ID(Exemple avec titanic:11021)',
  })
  @SwaggerApiResponse(ENDPOINT_RESPONSES.MOVIE_BY_ID)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  @SwaggerApiResponse(API_RESPONSES.NOT_FOUND_404)
  async getMovieById(@Param('id') id: string): Promise<any> {
    return await this.moviesService.getMovieById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des genres' })
  @SwaggerApiResponse(ENDPOINT_RESPONSES.GENRES)
  @SwaggerApiResponse(API_RESPONSES.SERVER_ERROR_500)
  async getGenres(): Promise<GenreResponse> {
    return await this.moviesService.getGenres();
  }
}
