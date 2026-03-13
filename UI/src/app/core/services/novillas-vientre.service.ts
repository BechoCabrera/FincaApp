import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService, AnimalDto } from './animal.service';
import { CriaView } from '../models/animal-view.models';
import { EstadoHembra, PropositoAnimal, TipoAnimal } from '../models/animal.enums';

export interface CreateNovillaVientreDto {
  numero: string;
  nombre: string;
  fechaNac?: string | null;
  fechaDestete?: string | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fincaId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  procedencia?: string | null;
  detalles?: string | null;
}

@Injectable({ providedIn: 'root' })
export class NovillasVientreService {
  private readonly apiUrl = `${environment.apiUrl}/api/novillas-vientre`;

  constructor(private http: HttpClient, private animalService: AnimalService) {}

  create(dto: CreateNovillaVientreDto): Observable<AnimalDto> {
    const payload: any = {
      numeroArete: dto.numero,
      tipo: TipoAnimal.Hembra,
      proposito: PropositoAnimal.Carne,
      estadoActualHembra: EstadoHembra.Novilla,
      fechaNacimiento: dto.fechaNac ?? null,
      fincaId: dto.fincaId ?? null,
    };

    return this.animalService.upsert(payload);
  }

  getAll(): Observable<AnimalDto[]> {
    return this.animalService.list({ tipo: TipoAnimal.Hembra, proposito: PropositoAnimal.Carne, estado: EstadoHembra.Novilla });
  }

  getById(id: string): Observable<AnimalDto> {
    return this.animalService.getById(id);
  }

  update(id: string, dto: CreateNovillaVientreDto): Observable<AnimalDto> {
    const payload: any = {
      id,
      numeroArete: dto.numero,
      tipo: TipoAnimal.Hembra,
      proposito: PropositoAnimal.Carne,
      estadoActualHembra: EstadoHembra.Novilla,
      fechaNacimiento: dto.fechaNac ?? null,
      fincaId: dto.fincaId ?? null,
    };

    return this.animalService.upsert(payload);
  }

  delete(id: string): Observable<void> {
    return this.animalService.deactivate(id);
  }

  search(opts?: { q?: string; fincaId?: string }): Observable<AnimalDto[]> {
    return this.animalService.list({
      tipo: TipoAnimal.Hembra,
      proposito: PropositoAnimal.Carne,
      estado: EstadoHembra.Novilla,
      q: opts?.q,
      fincaId: opts?.fincaId,
    });
  }

  private mapAnimalToView(a: AnimalDto): CriaView {
    const asAny = a as any;
    return {
      id: a.id,
      numero: asAny.numeroArete ?? null,
      nombre: asAny.nombre ?? null,
      fechaNac: asAny.fechaNacimiento ?? null,
      fechaDestete: asAny.fechaDestete ?? null,
      color: asAny.color ?? null,
      propietario: asAny.propietario ?? null,
      pesoKg: asAny.pesoKg ?? null,
      fincaId: a.fincaActualId ?? null,
      madreNumero: asAny.madreNumero ?? null,
      madreNombre: asAny.madreNombre ?? null,
      procedencia: asAny.procedencia ?? null,
      detalles: asAny.detalles ?? asAny.observaciones ?? null,
    };
  }

  getAllAsView(): Observable<CriaView[]> {
    return this.getAll().pipe(map((items: AnimalDto[]) => (items || []).map((a) => this.mapAnimalToView(a))));
  }

  getByIdAsView(id: string): Observable<CriaView> {
    return this.getById(id).pipe(map((a: AnimalDto) => this.mapAnimalToView(a)));
  }
}
