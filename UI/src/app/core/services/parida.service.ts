import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateParidaDto {
  numero: string;
  fincaId: string;
  fechaParida: Date;
  generoCria: 'Hembra' | 'Macho';
  fechaPalpacion?: Date | null;
  tipoLeche?: string | null;
  observaciones?: string | null;
}

export interface ParidaDto {
  id: string;
  vacaMadreId: string;
  fincaId: string;
  fechaParida: string;
  generoCria: string;
  tipoLeche?: string;
  observaciones?: string;
  fechaPalpacion?: string;
  numero: string;
  nombre: string;
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
}
