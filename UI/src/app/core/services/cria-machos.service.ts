import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateCriaMachoDto {
  nombre: string;
  fechaNac?: string | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fincaId: string | null;
  madreId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
}

export interface CriaMachoDto extends CreateCriaMachoDto {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class CriaMachosService {
  private readonly apiUrl = `${environment.apiUrl}/api/crias-machos`;

  constructor(private http: HttpClient) {}

  create(dto: CreateCriaMachoDto): Observable<CriaMachoDto> {
    return this.http.post<CriaMachoDto>(this.apiUrl, dto);
  }

  getAll(): Observable<CriaMachoDto[]> {
    return this.http.get<CriaMachoDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<CriaMachoDto> {
    return this.http.get<CriaMachoDto>(`${this.apiUrl}/${id}`);
  }

  update(id: string, dto: CreateCriaMachoDto): Observable<CriaMachoDto> {
    return this.http.put<CriaMachoDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(opts?: { q?: string; fincaId?: string }): Observable<CriaMachoDto[]> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    return this.http.get<CriaMachoDto[]>(this.apiUrl, { params });
  }
}
