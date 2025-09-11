import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ===== Tipos ===== */
export interface EscoteraResumen {
  id: string;
  numero: number;     // Nº escotera para el selector/tabla
  nombre: string;
}
export interface EscoteraDetalle {
  id: string;
  numeroEscotera: number;
  nombre: string;
  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;
  nroMama?: number | string | null;
  fechaNacida?: string | Date | null;
  tipoLeche?: string | null;
  fPalpacion?: string | Date | null;
  dPrenez?: number | null;
  detalles?: string | null;
  fechaDestete?: string | Date | null;
  fincaId?: string | null;
  madreNombre?: string | null;
}

/* Payloads crear/actualizar */
export type EscoteraCreate = Omit<EscoteraDetalle, 'id'>;
export type EscoteraUpdate = Partial<EscoteraCreate>;

@Injectable({ providedIn: 'root' })
export class EscoteraService {
  private http = inject(HttpClient);
  /** Cambia esta ruta según tu API */
  private api = '/api/ganaderia/escoteras';

  /** Lista resumida (para selector/tabla) */
  listarEscoteras(opts?: { q?: string; fincaId?: string; page?: number; pageSize?: number })
    : Observable<{ total: number; items: EscoteraResumen[] }> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    if (opts?.page != null) params = params.set('page', String(opts.page));
    if (opts?.pageSize != null) params = params.set('pageSize', String(opts.pageSize));
    return this.http.get<{ total: number; items: EscoteraResumen[] }>(this.api, { params });
  }

  /** Detalle por id (para Consultar) */
  obtenerEscoteraPorId(id: string): Observable<EscoteraDetalle> {
    return this.http.get<EscoteraDetalle>(`${this.api}/${id}`);
  }

  /** Crear registro (si usas submit en modo creación) */
  crearEscotera(payload: EscoteraCreate): Observable<EscoteraDetalle> {
    return this.http.post<EscoteraDetalle>(this.api, payload);
  }

  /** Actualizar registro completo/parcial */
  actualizarEscotera(id: string, payload: EscoteraUpdate): Observable<EscoteraDetalle> {
    return this.http.put<EscoteraDetalle>(`${this.api}/${id}`, payload);
  }

  /** Actualizar sólo la fecha de destete (flujo de consulta) */
  actualizarDestete(id: string, fechaDestete: string): Observable<void> {
    // fechaDestete en formato YYYY-MM-DD
    return this.http.put<void>(`${this.api}/${id}/destete`, { fechaDestete });
  }

  /** Eliminar */
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
