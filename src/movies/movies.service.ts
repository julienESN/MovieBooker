import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GenreResponse } from 'src/movies/interfaces/movie.interface';

@Injectable()
export class MoviesService {
  private readonly apiUrl = 'https://api.themoviedb.org/3';
  private readonly bearerToken =
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhODM3NWZjZWQxMDMzNjFlZjgzY2FiMDRlYzM1OWVmMiIsIm5iZiI6MTY4MjIwMzg1OS45OCwic3ViIjoiNjQ0NDY0ZDNiM2Y2ZjUwNGY0OWViMmJhIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.GIUgnmAlpIzpfudbsUssvhBJd814HT5y54VcSf2xvQ8';

  constructor(private readonly httpService: HttpService) {}
  async searchMovieByTitle(title: string): Promise<any> {
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    const encodedTitle = encodeURIComponent(title);
    const url = `${this.apiUrl}/search/movie?query=${encodedTitle}&language=en-US&page=1&include_adult=false`;

    const headers = {
      Authorization: this.bearerToken,
      accept: 'application/json',
    };

    const response = await firstValueFrom(
      this.httpService.get(url, { headers }),
    );
    return response.data;
  }

  async getMovieById(id: string): Promise<any> {
    const url = `${this.apiUrl}/movie/${id}?language=en-US`;

    const headers = {
      Authorization: this.bearerToken,
      accept: 'application/json',
    };
    //https://rxjs.dev/api/index/function/firstValueFrom

    const response = await firstValueFrom(
      this.httpService.get(url, { headers }),
    );
    return response.data;
  }
  //https://developer.themoviedb.org/reference/movie-now-playing-list
  async getNowPlaying(): Promise<any> {
    const url = `${this.apiUrl}/movie/now_playing?language=en-US&page=1`;
    const headers = {
      Authorization: `${this.bearerToken}`,
      accept: 'application/json',
    };
    const response = await firstValueFrom(
      this.httpService.get(url, { headers }),
    );
    return response.data;
  }

  //https://developer.themoviedb.org/reference/genre-movie-list
  // I have only make an interface for getGenres cause the other function have not probleme with Promise<any> except getGenres
  async getGenres(): Promise<GenreResponse> {
    const url = `${this.apiUrl}/genre/movie/list?language=en`;
    const headers = {
      Authorization: this.bearerToken,
      accept: 'application/json',
    };

    const response = await firstValueFrom(
      this.httpService.get<GenreResponse>(url, { headers }),
    );
    return response.data;
  }
}
