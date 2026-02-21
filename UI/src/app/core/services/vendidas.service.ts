import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface CreateVentaDto {
  categoria: string;
  animalId: string;
  fechaVenta: string; // ISO yyyy-MM-dd
  comprador?: string | null;
  precio?: number | null;
  notas?: string | null;
}

// Venta DTO returned by the API (adjust fields as needed to match backend)
export interface VentaDto {
  id: string;
  categoria: string;
  animalId: string;
  fechaVenta: string;
  comprador?: string | null;
  precio?: number | null;
  notas?: string | null;
  // optional presentation field
  animalLabel?: string;
}

export interface UpdateVentaDto {
  id: string;
  categoria: string;
  animalId: string;
  fechaVenta: string;
  comprador?: string | null;
  precio?: number | null;
  notas?: string | null;
}

@Injectable({ providedIn: 'root' })
export class VendidasService {
  private readonly apiUrl = `${environment.apiUrl}/api/ventas`;

  constructor(private http: HttpClient) {}

  create(dto: CreateVentaDto): Observable<VentaDto> {
    return this.http.post<VentaDto>(this.apiUrl, dto);
  }

  getAll(): Observable<any[]> {
    return this.http.get<VentaDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<VentaDto> {
    return this.http.get<VentaDto>(`${this.apiUrl}/${id}`);
  }

  update(id: string, dto: UpdateVentaDto): Observable<VentaDto> {
    return this.http.put<VentaDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
