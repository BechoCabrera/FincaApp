import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/** ===== Tipos ===== */
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
  madreNumero?: number | string | null;
  madreNombre?: string | null;
  detalles?: string | null;
  fechaDestete?: string | Date | null;
}

/** Payloads para crear/actualizar */
export type RecriaCreate = Omit<RecriaDetalle, 'id'>;
export type RecriaUpdate = Partial<RecriaCreate>;

@Injectable({ providedIn: 'root' })
export class RecriasMachosService {
  private http = inject(HttpClient);
  /** Ajusta esta ruta a tu backend */
  private api = '/api/ganaderia/recrias-machos';

  /** Lista resumida para el selector/tabla */
  listarRecrias(opts?: { q?: string; fincaId?: string; page?: number; pageSize?: number }):
    Observable<{ total: number; items: RecriaResumen[] }> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    if (opts?.page != null) params = params.set('page', String(opts.page));
    if (opts?.pageSize != null) params = params.set('pageSize', String(opts.pageSize));
    return this.http.get<{ total: number; items: RecriaResumen[] }>(this.api, { params });
  }

  /** Detalle por id (para Consultar) */
  obtenerRecriaPorId(id: string): Observable<RecriaDetalle> {
    return this.http.get<RecriaDetalle>(`${this.api}/${id}`);
  }

  /** Crear nueva recría (si lo usas desde submit) */
  crearRecria(payload: RecriaCreate): Observable<RecriaDetalle> {
    return this.http.post<RecriaDetalle>(this.api, payload);
  }

  /** Actualizar recría (opcional) */
  actualizarRecria(id: string, payload: RecriaUpdate): Observable<RecriaDetalle> {
    return this.http.put<RecriaDetalle>(`${this.api}/${id}`, payload);
  }

  /** Actualizar solo la fecha de destete (flujo de consulta) */
  actualizarDestete(id: string, fechaDestete: string): Observable<void> {
    // fechaDestete en formato YYYY-MM-DD
    return this.http.put<void>(`${this.api}/${id}/destete`, { fechaDestete });
  }

  /** Eliminar (opcional) */
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
