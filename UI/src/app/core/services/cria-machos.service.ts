import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService, AnimalDto } from './animal.service';
import { CriaView } from '../models/animal-view.models';
import { EstadoMacho, PropositoAnimal, TipoAnimal } from '../models/animal.enums';

export interface CreateCriaMachoDto {
  numeroArete: string;
  nombre: string;
  fechaNacimiento?: string | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fincaActualId: string | null;
  madreId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CriaMachosService {
  private readonly apiUrl = `${environment.apiUrl}/api/crias-machos`;

  constructor(private animalService: AnimalService) {}

  create(dto: CreateCriaMachoDto): Observable<AnimalDto> {
    const payload: any = {
      numeroArete: dto.numeroArete,
      tipo: TipoAnimal.Macho,
      proposito: PropositoAnimal.Carne,
      estadoActualMacho: EstadoMacho.Cria,
      fechaNacimiento: dto.fechaNacimiento ?? null,
      fincaActualId: dto.fincaActualId ?? null,
      madreId: dto.madreId ?? null,
    };

    return this.animalService.upsert(payload);
  }

  getAll(): Observable<AnimalDto[]> {
    return this.animalService.list({ tipo: TipoAnimal.Macho, proposito: PropositoAnimal.Carne, estado: EstadoMacho.Cria });
  }

  getById(id: string): Observable<AnimalDto> {
    return this.animalService.getById(id);
  }

  update(id: string, dto: CreateCriaMachoDto): Observable<AnimalDto> {
    const payload: any = {
      id,
      numeroArete: dto.numeroArete,
      tipo: TipoAnimal.Macho,
      proposito: PropositoAnimal.Carne,
      estadoActualMacho: EstadoMacho.Cria,
      fechaNacimiento: dto.fechaNacimiento ?? null,
      fincaActualId: dto.fincaActualId ?? null,
      madreId: dto.madreId ?? null,
    };

    return this.animalService.upsert(payload);
  }

  delete(id: string): Observable<void> {
    return this.animalService.deactivate(id);
  }

  search(opts?: { q?: string; fincaId?: string }): Observable<AnimalDto[]> {
    return this.animalService.list({
      tipo: TipoAnimal.Macho,
      proposito: PropositoAnimal.Carne,
      estado: EstadoMacho.Cria,
      q: opts?.q,
      fincaId: opts?.fincaId,
    });
  }

  // ---- view adapters ----
  private mapAnimalToView(a: AnimalDto): CriaView {
    const asAny = a as any;
    return {
      id: a.id,
      numeroArete: asAny.numeroArete ?? null,
      nombre: asAny.nombre ?? null,
      fechaNacimiento: asAny.fechaNacimiento ?? null,
      color: asAny.color ?? null,
      propietario: asAny.propietario ?? null,
      pesoKg: asAny.pesoKg ?? null,
      fincaActualId: a.fincaActualId ?? null,
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
export { AnimalDto };

