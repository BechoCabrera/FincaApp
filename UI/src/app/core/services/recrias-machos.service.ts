import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnimalService, AnimalDto } from './animal.service';
import { CriaView } from '../models/animal-view.models';
import { EstadoMacho, PropositoAnimal, TipoAnimal } from '../models/animal.enums';

@Injectable({ providedIn: 'root' })
export class RecriasMachosService {
  private http = inject(HttpClient);
  private animalService = inject(AnimalService);
  private apiUrl = `${environment.apiUrl}/api/RecriasMachos`;

  listarRecrias(opts?: { q?: string; fincaActualId?: string; page?: number; pageSize?: number }): Observable<AnimalDto[]> {
    const params: any = {
      tipo: TipoAnimal.Macho,
      proposito: PropositoAnimal.Carne,
      estado: EstadoMacho.Recria,
      q: opts?.q,
      fincaActualId: opts?.fincaActualId,
      page: opts?.page,
      pageSize: opts?.pageSize,
    };
    return this.animalService.list(params);
  }

  obtenerRecriaPorId(id: string): Observable<AnimalDto> {
    return this.animalService.getById(id);
  }

  crearRecria(payload: any): Observable<AnimalDto> {
    const animalPayload: any = {
      numeroArete: String(payload.numero ?? payload.nombre ?? ''),
      tipo: TipoAnimal.Macho,
      proposito: PropositoAnimal.Carne,
      estadoActualMacho: EstadoMacho.Recria,
      fechaNacimiento: payload.fechaNacimiento ?? null,
      fincaActualId: payload.fincaActualId ?? null,
    };

    return this.animalService.upsert(animalPayload);
  }

  actualizarRecria(id: string, payload: any): Observable<AnimalDto> {
    const animalPayload: any = {
      id,
      numeroArete: String(payload.numero ?? payload.nombre ?? ''),
      tipo: TipoAnimal.Macho,
      proposito: PropositoAnimal.Carne,
      estadoActualMacho: EstadoMacho.Recria,
      fechaNacimiento: payload.fechaNacimiento ?? null,
      fincaActualId: payload.fincaActualId ?? null,
    };
    return this.animalService.upsert(animalPayload);
  }

  actualizarDestete(id: string, fechaDestete: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/destete`, { fechaDestete });
  }

  eliminar(id: string): Observable<void> {
    return this.animalService.deactivate(id);
  }

  // view adapters
  private mapAnimalToView(a: AnimalDto): CriaView {
    return {
      id: a.id,
      numeroArete: a.numeroArete ?? null,
      nombre: a.nombre ?? null,
      fechaNacimiento: a.fechaNacimiento ?? null,
      color: a.color ?? null,
      propietario: a.propietario ?? null,
      pesoKg: a.pesoKg ?? null,
      fincaActualId: a.fincaActualId ?? null,
      madreId: a.madreId ?? null,
      madreNumero: a.madreNumero ?? null,
      madreNombre: a.madreNombre ?? null,
      detalles: a.detalles ?? a.observaciones ?? null,
      fechaDestete: a.fechaDestete ?? null,
    };
  }

  getAllAsView(opts?: { q?: string; fincaActualId?: string; page?: number; pageSize?: number }): Observable<CriaView[]> {
    return this.listarRecrias(opts).pipe(map((items: AnimalDto[]) => (items || []).map((a) => this.mapAnimalToView(a))));
  }

  getByIdAsView(id: string): Observable<CriaView> {
    return this.obtenerRecriaPorId(id).pipe(map((a: AnimalDto) => this.mapAnimalToView(a)));
  }
}
