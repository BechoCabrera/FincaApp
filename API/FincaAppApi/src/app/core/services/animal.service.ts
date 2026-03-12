import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateAnimalDto {
  numeroArete: string;
  nombre?: string | null; // optional name field
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
  numero?: string | null;
  nombre?: string | null; // optional name field
  tipo: number;
  proposito: number;
  fechaNacimiento: string;
  fincaActualId: string;
  estadoActualHembra?: number | null;
  estadoActualMacho?: number | null;
  activo: boolean;

  // optional/extended properties used by the frontend
  fechaNac?: string | null;
  pesoKg?: number | null;
  color?: string | null;
  propietario?: string | null;
  fincaId?: string | null;
  madreId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
  observaciones?: string | null;
  fechaDestete?: string | null;
  fechaParida?: string | null;
  fechaPalpacion?: string | null;
  tipoLeche?: string | null;
  procedencia?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
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
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
