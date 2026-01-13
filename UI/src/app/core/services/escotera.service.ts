import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface EscoteraDto {
  id: string;

  numero: number;
  nombre: string;

  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;

  nroMama?: number | null;

  fechaNacida?: string | null;
  tipoLeche?: string | null;

  fPalpacion?: string | null;
  dPrenez?: number | null;

  detalles?: string | null;
  fechaDestete?: string | null;

  vacaId?: string | null;
  fincaId?: string | null;
}

export interface CreateEscoteraDto {
  numero: number;
  nombre: string;

  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;

  nroMama?: number | null;

  fechaNacida?: string | null;
  tipoLeche?: string | null;

  fPalpacion?: string | null;
  dPrenez?: number | null;

  detalles?: string | null;
  fechaDestete?: string | null;

  vacaId?: string | null;
  fincaId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EscoteraService {
  private readonly apiUrl = `${environment.apiUrl}/api/escoteras`;

  constructor(private http: HttpClient) {}

  /** CREATE */
  create(dto: CreateEscoteraDto): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, dto);
  }

  /** LIST */
  getAll(): Observable<EscoteraDto[]> {
    return this.http.get<EscoteraDto[]>(this.apiUrl);
  }

  /** GET BY ID */
  getById(id: string): Observable<EscoteraDto> {
    return this.http.get<EscoteraDto>(`${this.apiUrl}/${id}`);
  }

  /** UPDATE */
  update(id: string, dto: EscoteraDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, {
      ...dto,
      id,
    });
  }

  /** DELETE */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
