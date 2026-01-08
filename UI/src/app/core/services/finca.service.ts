import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateFincaDto {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  isActive: boolean;
}

export interface UpdateFincaDto extends CreateFincaDto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  isActive: boolean;
}

export interface FincaDto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  isActive: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class FincaService {
  private readonly apiUrl = `${environment.apiUrl}/api/fincas`;

  constructor(private http: HttpClient) {}

  private headers() {
    return {
      headers: {
        'X-Tenant-Id': '11111111-1111-1111-1111-111111111111',
      },
    };
  }

  crear(dto: CreateFincaDto): Observable<FincaDto> {
    return this.http.post<FincaDto>(this.apiUrl, dto, this.headers());
  }

  listar(): Observable<FincaDto[]> {
    return this.http.get<FincaDto[]>(this.apiUrl, this.headers());
  }

  actualizar(id: string, dto: UpdateFincaDto): Observable<FincaDto> {
    return this.http.put<FincaDto>(`${this.apiUrl}/${id}`, dto, this.headers());
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.headers());
  }
}
