import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService, AnimalDto } from './animal.service';
import { ParidaView } from '../models/animal-view.models';
import { HttpClient } from '@angular/common/http';
import { EstadoHembra, PropositoAnimal, TipoAnimal } from '../models/animal.enums';

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
  estadoHembra: EstadoHembra | null;
  propietario?: string | null;
  observaciones?: string | null;

  // optional cria fields to send together with parto
  numeroCria?: string | null;
  criaNombre?: string | null;
  criaColor?: string | null;
  criaPropietario?: string | null;
  criaPesoKg?: number | null;
  criaDetalles?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ParidaService {
  private readonly apiUrl = `${environment.apiUrl}/api/paridas`;

  constructor(private animalService: AnimalService, private http: HttpClient) {}

  mapToParidaView(a: AnimalDto): ParidaView {
    return {
      id: a.id,
      nombre: a.nombre ?? null,
      numero: a.numeroArete ?? a.numero ?? null,
      fincaId: a.fincaActualId ?? null,
      generoCria: a.tipo === 1 ? 'Hembra' : 'Macho',
      fechaParida: a.fechaParida ?? null,
      fechaPalpacion: a.fechaPalpacion ?? null,
      fechaNacimiento: a.fechaNacimiento ?? null,
      color: a.color ?? null,
      tipoLeche: a.tipoLeche ?? null,
      procedencia: a.procedencia ?? null,
      observaciones: a.observaciones ?? null,
      createdAt: a.createdAt ?? null,
      updatedAt: a.updatedAt ?? null,
      propietario: a.propietario ?? null,
    };
  }

  create(dto: CreateParidaDto): Observable<{ partoId: string; madreId: string; criaId: string }> {
    // Use backend endpoint that encapsulates parto + cria
    return this.http.post<{ partoId: string; madreId: string; criaId: string }>(this.apiUrl, dto);
  }

  // Return a lightweight list of madres useful for dropdowns ({id, numero, nombre})
  getAll(): Observable<Array<{ id: string; numero: string | null; nombre: string | null }>> {
    const params: any = {
      tipo: TipoAnimal.Hembra,
      proposito: PropositoAnimal.Carne,
      estado: EstadoHembra.Parida,
    };
    return this.animalService.list(params).pipe(
      map((items: AnimalDto[]) =>
        (items || []).map((a: AnimalDto) => ({
          id: a.id,
          numero: a.numeroArete ?? null,
          nombre: a.nombre ?? null,
        })),
      ),
    );
  }

  getAllAsView(): Observable<ParidaView[]> {
    return this.animalService
      .list({
        tipo: TipoAnimal.Hembra,
        proposito: PropositoAnimal.Carne,
        estado: EstadoHembra.Parida,
      })
      .pipe(map((items) => (items || []).map((a) => this.mapToParidaView(a))));
  }

  getById(id: string): Observable<AnimalDto> {
    return this.animalService.getById(id);
  }

  getByIdAsView(id: string): Observable<ParidaView> {
    return this.getById(id).pipe(map((a) => this.mapToParidaView(a)));
  }

  update(id: string, dto: CreateParidaDto): Observable<AnimalDto> {
    const payload: any = {
      numeroArete: dto.numero,
      tipo: TipoAnimal.Hembra,
      proposito: PropositoAnimal.Carne,
      estadoActualHembra: EstadoHembra.Parida,
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
