export interface ParidaView {
  id: string;
  nombre: string | null;
  numeroArete: string | null;
  fincaActualId: string | null;
  generoCria: 'Hembra' | 'Macho' | null;
  fechaParida: string | null;
  fechaPalpacion?: string | null;
  fechaNacimiento?: string | null;
  color?: string | null;
  tipoLeche?: string | null;
  procedencia?: string | null;
  observaciones?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  propietario?: string | null;
  lastPartoId?: string | null; // Add lastPartoId to ParidaView so UI can edit Parto directly
}

export interface EscoteraView {
  id: string;
  numeroArete: string | null;
  nombre: string | null;
  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;
  nroMama?: string | null;
  fechaNacida?: string | null;
  tipoLeche?: string | null;
  fPalpacion?: string | null;
  dPrenez?: number | null; // d�as de pre�ez
  detalles?: string | null;
  fechaDestete?: string | null;
  vacaId?: string | null;
  fincaActualId?: string | null;
}

export interface CriaView {
  id: string;
  numeroArete: string | null;
  nombre: string | null;
  fechaNacimiento?: string | null;
  pesoKg?: number | null;
  color?: string | null;
  propietario?: string | null;
  fincaActualId?: string | null;
  madreId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
  fechaDestete?: string | null;
  procedencia?: string | null;
}

export type AnimalView = ParidaView | EscoteraView | CriaView;
