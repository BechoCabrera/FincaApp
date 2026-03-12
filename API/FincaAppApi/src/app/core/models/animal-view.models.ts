export interface ParidaView {
  id: string;
  nombre: string | null;
  numero: string | null;
  fincaId: string | null;
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
}

export interface EscoteraView {
  id: string;
  numero: string | null;
  nombre: string | null;
  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;
  nroMama?: string | null;
  fechaNacida?: string | null;
  tipoLeche?: string | null;
  fPalpacion?: string | null;
  dPrenez?: number | null;
  detalles?: string | null;
  fechaDestete?: string | null;
  vacaId?: string | null;
  fincaId?: string | null;
}

export interface CriaView {
  id: string;
  numero: string | null;
  nombre: string | null;
  fechaNac?: string | null;
  pesoKg?: number | null;
  color?: string | null;
  propietario?: string | null;
  fincaId?: string | null;
  madreId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
  fechaDestete?: string | null;
  procedencia?: string | null;
}

export type AnimalView = ParidaView | EscoteraView | CriaView;
