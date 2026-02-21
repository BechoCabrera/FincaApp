import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateFallecimientoDto {
  categoria: string;
  animalId: string;
  fechaFallecimiento: string;
  causa?: string | null;
  notas?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FallecimientosService {
  private readonly apiUrl = `${environment.apiUrl}/api/fallecidas`;

  constructor(private http: HttpClient) {}

  create(dto: CreateFallecimientoDto): Observable<FallecidaDto> {
    return this.http.post<FallecidaDto>(this.apiUrl, dto);
  }

  getAll(): Observable<FallecidaDto[]> {
    return this.http.get<FallecidaDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<FallecidaDto> {
    return this.http.get<FallecidaDto>(`${this.apiUrl}/${id}`);
  }

  update(id: string, dto: UpdateFallecimientoDto): Observable<FallecidaDto> {
    return this.http.put<FallecidaDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

export interface FallecidaDto {
  id: string;
  categoria: string;
  animalId: string;
  fechaFallecimiento: string;
  causa?: string | null;
  notas?: string | null;
  animalLabel?: string;
}

export interface UpdateFallecimientoDto {
  id: string;
  categoria: string;
  animalId: string;
  fechaFallecimiento: string;
  causa?: string | null;
  notas?: string | null;
}
