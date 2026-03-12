import { Injectable } from '@angular/core';
import { Observable } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService, AnimalDto } from './animal.service';
import { CriaView } from '../models/animal-view.models';

export interface CreateCriaHembraDto {
  numero: string;
  nombre: string;
  fechaNac?: string | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fincaId: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CriaHembrasService {
  private readonly apiUrl = `${environment.apiUrl}/api/crias-hembras`;

  constructor(private animalService: AnimalService) {}

  /** CREATE */
  create(dto: CreateCriaHembraDto): Observable<AnimalDto> {
    const animalPayload: any = {
      numeroArete: dto.numero,
      tipo: 1, // Hembra
      proposito: 1, // Carne (default)
      fechaNacimiento: dto.fechaNac ?? null,
      fincaId: dto.fincaId ?? null,
    };

    return this.animalService.upsert(animalPayload);
  }

  /** LIST */
  getAll(): Observable<AnimalDto[]> {
    const params: any = { tipo: 1 };
    return this.animalService.list(params);
  }

  /** GET BY ID */
  getById(id: string): Observable<AnimalDto> {
    return this.animalService.getById(id);
  }

  /** UPDATE */
  update(id: string, dto: CreateCriaHembraDto): Observable<AnimalDto> {
    const payload: any = {
      id,
      numeroArete: dto.numero,
      tipo: 1,
      proposito: 1,
      fechaNacimiento: dto.fechaNac ?? null,
      fincaId: dto.fincaId ?? null,
    };
    return this.animalService.upsert(payload);
  }

  /** DELETE */
  delete(id: string): Observable<void> {
    return this.animalService.deactivate(id);
  }

  /** SEARCH (opcional) */
  search(opts?: { q?: string; fincaId?: string }): Observable<AnimalDto[]> {
    return this.animalService.list({ tipo: 1, q: opts?.q, fincaId: opts?.fincaId });
  }

  // ---- view adapters ----
  private mapAnimalToView(a: AnimalDto): CriaView {
    const asAny = a as any;
    return {
      id: a.id,
      numero: asAny.numeroArete ?? null,
      nombre: asAny.nombre ?? null,
      fechaNac: asAny.fechaNacimiento ?? null,
      color: asAny.color ?? null,
      propietario: asAny.propietario ?? null,
      pesoKg: asAny.pesoKg ?? null,
      fincaId: a.fincaActualId ?? null,
      madreId: asAny.madreId ?? null,
      madreNumero: asAny.madreNumero ?? null,
      madreNombre: asAny.madreNombre ?? null,
      detalles: asAny.detalles ?? asAny.observaciones ?? null,
      fechaDestete: asAny.fechaDestete ?? null,
    };
  }

  getAllAsView(): Observable<CriaView[]> {
    return this.getAll().pipe(map((items: AnimalDto[]) => (items || []).map((a) => this.mapAnimalToView(a))));
  }

  getByIdAsView(id: string): Observable<CriaView> {
    return this.getById(id).pipe(map((a: AnimalDto) => this.mapAnimalToView(a)));
  }
}
