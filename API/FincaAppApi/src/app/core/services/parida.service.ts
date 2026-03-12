import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService, AnimalDto } from './animal.service';
import { ParidaView } from '../models/animal-view.models';

export interface CreateParidaDto {
  nombre: string;
  numero: string;
  fincaId: string;

  generoCria: 'Hembra' | 'Macho';

  fechaParida: string;
  fechaPalpacion?: string | null;
  fechaNacimiento?: string | null;

  color?: string | null;
  tipoLeche?: string | null;
  procedencia?: string | null;

  propietario?: string | null;
  observaciones?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ParidaService {
  private readonly apiUrl = `${environment.apiUrl}/api/paridas`;

  constructor(private animalService: AnimalService) {}

  mapToParidaView(a: AnimalDto): ParidaView {
    return {
      id: a.id,
      nombre: (a as any).nombre ?? null,
      numero: a.numeroArete ?? null,
      fincaId: a.fincaActualId ?? null,
      generoCria: a.tipo === 1 ? 'Hembra' : 'Macho',
      fechaParida: (a as any).fechaParida ?? null,
      fechaPalpacion: (a as any).fechaPalpacion ?? null,
      fechaNacimiento: a.fechaNacimiento ?? null,
      color: (a as any).color ?? null,
      tipoLeche: (a as any).tipoLeche ?? null,
      procedencia: (a as any).procedencia ?? null,
      observaciones: (a as any).observaciones ?? null,
      createdAt: (a as any).createdAt ?? null,
      updatedAt: (a as any).updatedAt ?? null,
      propietario: (a as any).propietario ?? null,
    };
  }

  create(dto: CreateParidaDto): Observable<{ id: string }> {
    const animalPayload: any = {
      numeroArete: dto.numero,
      tipo: dto.generoCria === 'Hembra' ? 1 : 2,
      proposito: 1,
      fechaNacimiento: dto.fechaNacimiento ?? null,
      fincaId: dto.fincaId,
    };

    return this.animalService.upsert(animalPayload).pipe(map((a: any) => ({ id: a.id })));
  }

  getAll(): Observable<AnimalDto[]> {
    const params: any = { tipo: 1, proposito: 1, estado: 'Parida' };
    return this.animalService.list(params);
  }

  getAllAsView(): Observable<ParidaView[]> {
    return this.getAll().pipe(map(items => (items || []).map(a => this.mapToParidaView(a))));
  }

  getById(id: string): Observable<AnimalDto> {
    return this.animalService.getById(id);
  }

  getByIdAsView(id: string): Observable<ParidaView> {
    return this.getById(id).pipe(map(a => this.mapToParidaView(a)));
  }

  update(id: string, dto: CreateParidaDto): Observable<AnimalDto> {
    const payload: any = {
      numeroArete: dto.numero,
      tipo: dto.generoCria === 'Hembra' ? 1 : 2,
      proposito: 1,
      fechaNacimiento: dto.fechaNacimiento ?? null,
      fincaId: dto.fincaId,
      id: id,
    };

    return this.animalService.upsert(payload);
  }

  delete(id: string): Observable<void> {
    return this.animalService.deactivate(id);
  }
}
