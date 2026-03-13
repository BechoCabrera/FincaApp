import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService, AnimalDto } from './animal.service';
import { CriaView } from '../models/animal-view.models';
import { EstadoHembra, PropositoAnimal, TipoAnimal } from '../models/animal.enums';

export interface CreateRecriaHembraDto {
  numero: string;
  nombre: string;
  fechaNac?: string | null;
  pesoKg?: number | null;
  color?: string | null;
  propietario?: string | null;
  fincaId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
  fechaDestete?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RecriaHembrasService {
  private readonly apiUrl = `${environment.apiUrl}/api/recrias-hembras`;

  constructor(private animalService: AnimalService) {}

  /** CREATE - now uses animal upsert and returns mapped RecriaHembraDto */
  create(dto: CreateRecriaHembraDto): Observable<AnimalDto> {
    const payload: any = {
      numeroArete: dto.numero,
      tipo: TipoAnimal.Hembra,
      proposito: PropositoAnimal.Carne,
      estadoActualHembra: EstadoHembra.Recria,
      fechaNacimiento: dto.fechaNac ?? null,
      fincaId: dto.fincaId ?? null,
    };

    return this.animalService.upsert(payload);
  }

  /** LIST */
  getAll(): Observable<AnimalDto[]> {
    return this.animalService.list({ tipo: TipoAnimal.Hembra, proposito: PropositoAnimal.Carne, estado: EstadoHembra.Recria });
  }

  /** GET BY ID */
  getById(id: string): Observable<AnimalDto> {
    return this.animalService.getById(id);
  }

  /** UPDATE - El API devuelve NoContent (204) */
  update(id: string, dto: CreateRecriaHembraDto): Observable<AnimalDto> {
    const payload: any = {
      id,
      numeroArete: dto.numero,
      tipo: TipoAnimal.Hembra,
      proposito: PropositoAnimal.Carne,
      estadoActualHembra: EstadoHembra.Recria,
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
    return this.animalService.list({
      tipo: TipoAnimal.Hembra,
      proposito: PropositoAnimal.Carne,
      estado: EstadoHembra.Recria,
      q: opts?.q,
      fincaId: opts?.fincaId,
    });
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
