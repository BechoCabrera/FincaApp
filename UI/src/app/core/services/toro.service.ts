import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * DTO que el backend espera para crear un toro
 * (debe coincidir con CreateToroRequest)
 */
export interface CreateToroDto {
  nombre: String;
  fechaNac: Date | null;
  pesoKg: number | null;
  color: string | null;
  propietario: string | null;
  fincaId: string | null;
  madreId: string | null;
  detalles: string | null;
  fechaDestete: Date | null;
}

/**
 * DTO que el backend devuelve
 */
export interface ToroDto {
  id: string;
  nombre: string;
  fechaNac: string;
  peso: number;
  finca: string;
}
@Injectable({
  providedIn: 'root',
})
export class ToroService {
  private readonly apiUrl = `${environment.apiUrl}/api/toros`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un toro
   */
  createToro(dto: CreateToroDto): Observable<ToroDto> {
    return this.http.post<ToroDto>(this.apiUrl, dto);
  }

  /**
   * Obtener todos los toros (búsqueda)
   */
  getToros(nombre?: string): Observable<ToroDto[]> {
    const params: any = {};
    if (nombre) params.nombre = nombre;

    return this.http.get<ToroDto[]>(this.apiUrl, { params });
  }

  /**
   * Obtener toro por id
   */
  getToroById(id: string): Observable<ToroDto> {
    return this.http.get<ToroDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar toro
   */
  updateToro(id: string, dto: CreateToroDto): Observable<ToroDto> {
    return this.http.put<ToroDto>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Eliminar toro
   */
  deleteToro(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
