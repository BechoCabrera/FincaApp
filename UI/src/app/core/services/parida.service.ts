import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateParidaDto {
  nombre: string;
  numero: string;
  fincaId: string;

  generoCria: 'Hembra' | 'Macho';

  fechaParida: string;
  fechaPalpacion?: string | null;
  fechaNacimiento?: string | null;

  color?: string | null;
  tipoLeche?: string | null;
  procedencia?: string | null;

  propietario?: string | null;
  observaciones?: string | null;
}

export interface ParidaDto {
  id: string;
  nombre: string;
  numero: string;
  fincaId: string;
  generoCria: 'Hembra' | 'Macho';
  fechaParida: string;
  fechaPalpacion?: string | null;
  fechaNacimiento?: string | null;
  color?: string | null;
  tipoLeche?: string | null;
  procedencia?: string | null;
  observaciones?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  propietario?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ParidaService {
  private readonly apiUrl = `${environment.apiUrl}/api/paridas`;

  constructor(private http: HttpClient) {}

  create(dto: CreateParidaDto): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, dto);
  }

  getAll(): Observable<ParidaDto[]> {
    return this.http.get<ParidaDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<ParidaDto> {
    return this.http.get<ParidaDto>(`${this.apiUrl}/${id}`);
  }

  update(id: string, dto: CreateParidaDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
