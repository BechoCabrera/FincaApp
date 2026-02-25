import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ToreteResumen {
  id: string;
  numero: number | string;
  nombre: string;
}

export interface ToreteDetalle {
  id: string;
  numero: number | string;
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

@Injectable({ providedIn: 'root' })
export class ToretesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/RecriasMachos`;

  listarToretes(opts?: { q?: string; fincaId?: string; page?: number; pageSize?: number }):
    Observable<{ total: number; items: ToreteResumen[] }> {
    let params = new HttpParams();
    if (opts?.q) params = params.set('q', opts.q);
    if (opts?.fincaId) params = params.set('fincaId', opts.fincaId);
    if (opts?.page != null) params = params.set('page', String(opts.page));
    if (opts?.pageSize != null) params = params.set('pageSize', String(opts.pageSize));
    return this.http.get<{ total: number; items: ToreteResumen[] }>(this.apiUrl, { params });
  }

  obtenerToretePorId(id: string): Observable<ToreteDetalle> {
    return this.http.get<ToreteDetalle>(`${this.apiUrl}/${id}`);
  }
}
