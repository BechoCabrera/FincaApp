import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateCriaHembraDto {
  numero: string;
  nombre: string;
  fechaNac?: string | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fincaId: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
}

export interface CriaHembraDto extends CreateCriaHembraDto {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class CriaHembrasService {
  private readonly apiUrl = `${environment.apiUrl}/api/crias-hembras`;

  constructor(private http: HttpClient) {}

  /** CREATE */
  create(dto: CreateCriaHembraDto): Observable<CriaHembraDto> {
    return this.http.post<CriaHembraDto>(this.apiUrl, dto);
  }

  /** LIST */
  getAll(): Observable<CriaHembraDto[]> {
    return this.http.get<CriaHembraDto[]>(this.apiUrl);
  }

  /** GET BY ID */
  getById(id: string): Observable<CriaHembraDto> {
    return this.http.get<CriaHembraDto>(`${this.apiUrl}/${id}`);
  }

  /** UPDATE */
  update(id: string, dto: CreateCriaHembraDto): Observable<CriaHembraDto> {
    return this.http.put<CriaHembraDto>(`${this.apiUrl}/${id}`, dto);
  }

  /** DELETE */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** SEARCH (opcional) */
  search(opts?: { q?: string; fincaId?: string }): Observable<CriaHembraDto[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    return this.http.get<CriaHembraDto[]>(this.apiUrl, { params });
  }
}
