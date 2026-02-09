import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateProximaDto {
  numero: number;
  nombre: string;
  fechaNacida?: string | null;
  color?: string | null;
  nroMama?: string | null;
  procedencia?: string | null;
  propietario?: string | null;
  fechaDestete?: string | null;
  fPalpacion?: string | null;
  dPrenez?: number | null;
  detalles?: string | null;
  fincaId?: string | null;
}

export interface ProximaDto extends CreateProximaDto {
  id: string;
}

export interface UpdateProximaDto extends CreateProximaDto {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class ProximaService {
  private readonly apiUrl = `${environment.apiUrl}/api/proximas`;

  constructor(private http: HttpClient) {}

  /** CREATE */
  create(dto: CreateProximaDto): Observable<ProximaDto> {
    return this.http.post<ProximaDto>(this.apiUrl, dto);
  }

  /** UPDATE (API espera el body completo con id) */
  update(dto: UpdateProximaDto): Observable<ProximaDto> {
    return this.http.put<ProximaDto>(this.apiUrl, dto);
  }

  /** DELETE */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** GET BY ID */
  getById(id: string): Observable<ProximaDto> {
    return this.http.get<ProximaDto>(`${this.apiUrl}/${id}`);
  }

  /** SEARCH (q y/o fincaId) */
  search(opts?: { q?: string; fincaId?: string }): Observable<ProximaDto[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    return this.http.get<ProximaDto[]>(this.apiUrl, { params });
  }
}
