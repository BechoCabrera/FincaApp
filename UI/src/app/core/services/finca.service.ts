import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionService } from './session.service';

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
})export class FincaService {
  private readonly apiUrl = `${environment.apiUrl}/api/fincas`;

  constructor(private http: HttpClient) {}

  crear(dto: CreateFincaDto): Observable<FincaDto> {
    return this.http.post<FincaDto>(this.apiUrl, dto);
  }

  listar(): Observable<FincaDto[]> {
    return this.http.get<FincaDto[]>(this.apiUrl);
  }

  actualizar(id: string, dto: UpdateFincaDto): Observable<FincaDto> {
    return this.http.put<FincaDto>(`${this.apiUrl}/${id}`, dto);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
