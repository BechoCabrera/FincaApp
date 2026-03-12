import { Injectable } from '@angular/core';
import { Observable } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService, AnimalDto } from './animal.service';
import { EscoteraView } from '../models/animal-view.models';

export interface CreateEscoteraDto {
  numero: number;
  nombre: string;
  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;
  nroMama?: number | null;
  fechaNacida?: string | null;
  tipoLeche?: string | null;
  fPalpacion?: string | null;
  dPrenez?: number | null;
  detalles?: string | null;
  fechaDestete?: string | null;
  vacaId?: string | null;
  fincaId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EscoteraService {
  private readonly apiUrl = `${environment.apiUrl}/api/escoteras`;

  constructor(private animalService: AnimalService) {}

  /** CREATE */
  create(dto: CreateEscoteraDto): Observable<AnimalDto> {
    const payload: any = {
      numeroArete: String(dto.numero),
      tipo: 1, // Hembra
      proposito: 1,
      fechaNacimiento: dto.fechaNacida ?? null,
      fincaId: dto.fincaId ?? null,
    };

    return this.animalService.upsert(payload);
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
  update(id: string, dto: CreateEscoteraDto): Observable<AnimalDto> {
    const payload: any = {
      id: id,
      numeroArete: String(dto.numero),
      tipo: 1,
      proposito: 1,
      fechaNacimiento: dto.fechaNacida ?? null,
      fincaId: dto.fincaId ?? null,
    };
    return this.animalService.upsert(payload);
  }

  /** DELETE */
  delete(id: string): Observable<void> {
    return this.animalService.deactivate(id);
  }

  // ---- View adapters ----
  private mapAnimalToView(a: AnimalDto): EscoteraView {
    const asAny = a as any;
    return {
      id: a.id,
      numero: asAny.numeroArete ?? null,
      nombre: asAny.nombre ?? null,
      color: asAny.color ?? null,
      procedencia: asAny.procedencia ?? null,
      propietario: asAny.propietario ?? null,
      nroMama: asAny.nroMama ?? null,
      fechaNacida: asAny.fechaNacimiento ?? null,
      tipoLeche: asAny.tipoLeche ?? null,
      fPalpacion: asAny.fechaPalpacion ?? null,
      dPrenez: asAny.dPrenez ?? null,
      detalles: asAny.observaciones ?? null,
      fechaDestete: asAny.fechaDestete ?? null,
      fincaId: a.fincaActualId ?? null,
    };
  }

  getAllAsView(): Observable<EscoteraView[]> {
    return this.getAll().pipe(map((items: AnimalDto[]) => (items || []).map((a) => this.mapAnimalToView(a))));
  }

  getByIdAsView(id: string): Observable<EscoteraView> {
    return this.getById(id).pipe(map((a: AnimalDto) => this.mapAnimalToView(a)));
  }
}
