import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService } from './animal.service';

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

  constructor(private http: HttpClient, private animalService: AnimalService) {}

  create(dto: CreateVentaDto): Observable<VentaDto> {
    // If the frontend passes a numeroArete in animalId field (not typical), perform upsert first
    // Otherwise assume animalId is an existing id and call API directly
    const maybeIsNumero = /^[A-Za-z0-9\-]+$/.test(dto.animalId);
    // Heuristic: if animalId looks like a GUID (contains - and length > 20), treat as id
    const looksLikeId = dto.animalId.length > 20 && dto.animalId.includes('-');

    if (!looksLikeId) {
      const animalPayload: any = {
        numeroArete: dto.animalId,
        tipo: 1,
        proposito: 1,
        fechaNacimiento: null,
        fincaId: null,
      };
      return this.animalService.upsert(animalPayload).pipe(
        switchMap((a: any) => {
          const payload = { ...dto, animalId: a.id } as CreateVentaDto;
          return this.http.post<VentaDto>(this.apiUrl, payload);
        })
      );
    }

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
