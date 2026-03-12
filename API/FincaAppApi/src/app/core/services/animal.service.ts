import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateAnimalDto {
  numeroArete: string;
  tipo: number;
  proposito: number;
  fechaNacimiento: string;
  fincaId: string;
  madreId?: string | null;
  padreId?: string | null;
}

export interface AnimalDto {
  id: string;
  numeroArete: string;
  tipo: number;
  proposito: number;
  fechaNacimiento: string;
  fincaActualId: string;
  estadoActualHembra?: number | null;
  estadoActualMacho?: number | null;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private readonly apiUrl = `${environment.apiUrl}/api/animals`;

  constructor(private http: HttpClient) {}

  // Upsert: create or update existing by numeroArete
  upsert(dto: CreateAnimalDto): Observable<AnimalDto> {
    return this.http.post<AnimalDto>(`${this.apiUrl}/upsert`, dto);
  }

  // Create (compat) - calls upsert
  create(dto: CreateAnimalDto) {
    return this.upsert(dto);
  }

  list(params?: any) {
    return this.http.get<AnimalDto[]>(this.apiUrl, { params });
  }

  getById(id: string) {
    return this.http.get<AnimalDto>(`${this.apiUrl}/${id}`);
  }

  changeState(id: string, payload: any) {
    return this.http.post(`${this.apiUrl}/${id}/change-state`, payload);
  }

  move(id: string, nuevaFincaId: string) {
    return this.http.post(`${this.apiUrl}/${id}/move`, { nuevaFincaId });
  }

  deactivate(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
