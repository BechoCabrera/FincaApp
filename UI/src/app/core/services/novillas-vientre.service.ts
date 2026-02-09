import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateNovillaVientreDto {
  numero: string;
  nombre: string;
  fechaNac?: string | null;
  fechaDestete?: string | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fincaId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  procedencia?: string | null;
  detalles?: string | null;
}

export interface NovillaVientreDto extends CreateNovillaVientreDto {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class NovillasVientreService {
  private readonly apiUrl = `${environment.apiUrl}/api/novillas-vientre`;

  constructor(private http: HttpClient) {}

  /** CREATE - El API devuelve CreatedAtAction pero no necesitamos el ID en el cliente */
  create(dto: CreateNovillaVientreDto): Observable<void> {
    return this.http.post<void>(this.apiUrl, dto);
  }

  /** LIST */
  getAll(): Observable<NovillaVientreDto[]> {
    return this.http.get<NovillaVientreDto[]>(this.apiUrl);
  }

  /** GET BY ID */
  getById(id: string): Observable<NovillaVientreDto> {
    return this.http.get<NovillaVientreDto>(`${this.apiUrl}/${id}`);
  }

  /** UPDATE - El API devuelve NoContent (204) */
  update(id: string, dto: CreateNovillaVientreDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  /** DELETE */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** SEARCH (opcional) */
  search(opts?: { q?: string; fincaId?: string }): Observable<NovillaVientreDto[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    return this.http.get<NovillaVientreDto[]>(this.apiUrl, { params });
  }
}
