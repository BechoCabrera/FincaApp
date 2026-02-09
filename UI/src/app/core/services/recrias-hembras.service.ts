import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateRecriaHembraDto {
  numero: string;
  nombre: string;
  fechaNac?: string | null;
  pesoKg?: number | null;
  color?: string | null;
  propietario?: string | null;
  fincaId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
  fechaDestete?: string | null;
}

export interface RecriaHembraDto extends CreateRecriaHembraDto {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class RecriaHembrasService {
  private readonly apiUrl = `${environment.apiUrl}/api/recrias-hembras`;

  constructor(private http: HttpClient) {}

  /** CREATE - El API devuelve CreatedAtAction pero no necesitamos el ID en el cliente */
  create(dto: CreateRecriaHembraDto): Observable<void> {
    return this.http.post<void>(this.apiUrl, dto);
  }

  /** LIST */
  getAll(): Observable<RecriaHembraDto[]> {
    return this.http.get<RecriaHembraDto[]>(this.apiUrl);
  }

  /** GET BY ID */
  getById(id: string): Observable<RecriaHembraDto> {
    return this.http.get<RecriaHembraDto>(`${this.apiUrl}/${id}`);
  }

  /** UPDATE - El API devuelve NoContent (204) */
  update(id: string, dto: CreateRecriaHembraDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  /** DELETE */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** SEARCH (opcional) */
  search(opts?: { q?: string; fincaId?: string }): Observable<RecriaHembraDto[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    return this.http.get<RecriaHembraDto[]>(this.apiUrl, { params });
  }
}
