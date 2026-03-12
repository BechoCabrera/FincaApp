// recrias.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecriasService {
  private http = inject(HttpClient);
  private api = '/api/ganaderia/recrias-hembras';

  listarRecrias(): Observable<{ total: number; items: any[] }> {
    return this.http.get<{ total: number; items: any[] }>(this.api);
  }

 obtenerRecriaPorId(id: string): Observable<any> {
  return this.http.get<any>(`${this.api}/${id}`);
}

  actualizarDestete(id: string, fechaDestete: string) {
    return this.http.put(`${this.api}/${id}/destete`, { fechaDestete });
  }
}
