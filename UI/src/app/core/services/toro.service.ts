import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * DTO que el backend espera para crear un toro
 * (debe coincidir con CreateToroRequest)
 */
export interface CreateToroDto {
  numero: String;
  nombre: String;
  fechaNac: Date | null;
  pesoKg: number | null;
  color: string | null;
  propietario: string | null;
  fincaId: string | null;
  madreNumero: string | null;
  detalles: string | null;
  fechaDestete: Date | null;
}

/**
 * DTO que el backend devuelve
 */
export interface ToroDto {
  id: string;
  numero: string;
  nombre: string;
  fechaNacimiento: string;
  peso: number;
  finca: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToroService {
  // 🔴 AJUSTA el puerto si es necesario
  private readonly apiUrl = `${environment.apiUrl}/api/toros`;

  constructor(private http: HttpClient) { }

  /**
   * Crear un toro
   */
  createToro(dto: CreateToroDto): Observable<ToroDto> {
    return this.http.post<ToroDto>(this.apiUrl, dto, {
      headers: {
        'X-Tenant-Id': '11111111-1111-1111-1111-111111111111',
      },
    });
  }

  /**
   * Obtener todos los toros (búsqueda)
   */
  getToros(nombre?: string, numero?: string): Observable<ToroDto[]> {
    const params: any = {};
    if (nombre) params.nombre = nombre;
    if (numero) params.numero = numero;

    return this.http.get<ToroDto[]>(this.apiUrl, {
      params,
      headers: {
        'X-Tenant-Id': '11111111-1111-1111-1111-111111111111',
      },
    });
  }

  /**
   * Obtener toro por id
   */
  getToroById(id: string): Observable<ToroDto> {
    return this.http.get<ToroDto>(`${this.apiUrl}/${id}`, {
      headers: {
        'X-Tenant-Id': '11111111-1111-1111-1111-111111111111',
      },
    });
  }

  /**
   * Actualizar toro
   */
  updateToro(id: string, dto: CreateToroDto): Observable<ToroDto> {
    return this.http.put<ToroDto>(`${this.apiUrl}/${id}`, dto, {
      headers: {
        'X-Tenant-Id': '11111111-1111-1111-1111-111111111111',
      },
    });
  }

  /**
   * Eliminar toro
   */
  deleteToro(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: {
        'X-Tenant-Id': '11111111-1111-1111-1111-111111111111',
      },
    });
  }
}
