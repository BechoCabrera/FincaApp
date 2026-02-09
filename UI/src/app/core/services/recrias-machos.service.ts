import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RecriaResumen {
  id: string;
  numero: number;
  nombre: string;
}

export interface RecriaDetalle {
  id: string;
  numero: number;
  nombre: string;
  fechaNac?: string | Date | null;
  pesoKg?: number | null;
  color?: string | null;
  propietario?: string | null;
  fincaId?: string | null;
  madreId?: string | null;
  madreNumero?: number | string | null;
  madreNombre?: string | null;
  detalles?: string | null;
  fechaDestete?: string | Date | null;
}

export type RecriaCreate = Omit<RecriaDetalle, 'id'>;
export type RecriaUpdate = Partial<RecriaCreate>;

@Injectable({ providedIn: 'root' })
export class RecriasMachosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/ganaderia/recrias-machos`;

  listarRecrias(opts?: { q?: string; fincaId?: string; page?: number; pageSize?: number }):
    Observable<{ total: number; items: RecriaResumen[] }> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    if (opts?.page != null) params = params.set('page', String(opts.page));
    if (opts?.pageSize != null) params = params.set('pageSize', String(opts.pageSize));
    return this.http.get<{ total: number; items: RecriaResumen[] }>(this.apiUrl, { params });
  }

  obtenerRecriaPorId(id: string): Observable<RecriaDetalle> {
    return this.http.get<RecriaDetalle>(`${this.apiUrl}/${id}`);
  }

  crearRecria(payload: RecriaCreate): Observable<RecriaDetalle> {
    return this.http.post<RecriaDetalle>(this.apiUrl, payload);
  }

  actualizarRecria(id: string, payload: RecriaUpdate): Observable<RecriaDetalle> {
    return this.http.put<RecriaDetalle>(`${this.apiUrl}/${id}`, payload);
  }

  actualizarDestete(id: string, fechaDestete: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/destete`, { fechaDestete });
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
