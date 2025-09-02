import { Component, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, startWith } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatMenuModule } from '@angular/material/menu';
type Genero = 'Hembra' | 'Macho';
type TipoLeche = 'Buena' | 'Regular' | 'Mala';

export interface VacaParida {
  id?: string;
  numero: string;
  nombre: string;
  fechaNac?: Date | null;
  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;
  fechaParto: Date | null;
  fPalpacion?: Date | null;
  genero: Genero;
  tipoLeche?: TipoLeche | null;
  dp?: number | null;
  gc?: string | null;
  detalles?: string | null;
  fincaId: string | null;
}

@Component({
  selector: 'app-paridas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatCardModule,
    MatSelectModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule,
  ],
  templateUrl: './paridas.component.html',
  styleUrls: ['./paridas.component.css'],
  providers: [DatePipe],
})
export class ParidasComponent {
  private fb = inject(FormBuilder);

  // Opciones (mock; cámbialas por tu API)
  fincas = [
    { id: 'F1', nombre: 'Tierra Nueva' },
    { id: 'F2', nombre: 'La Mas Nueva' },
    { id: 'F3', nombre: 'San Antonio' },
  ];
  tiposLeche: TipoLeche[] = ['Buena', 'Regular', 'Mala'];

  // ------ Formulario ------
  form = this.fb.group({
    numero: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    fechaNac: [null as Date | null],
    color: [''],
    procedencia: [''],
    propietario: [''],

    fechaParto: [null as Date | null, [Validators.required]],
    fPalpacion: [null as Date | null], // opcional
    fincaId: [null as string | null, [Validators.required]],
    genero: ['Hembra' as Genero, [Validators.required]],

    detalles: [''],
    tipoLeche: [null as TipoLeche | null],
  });

  isSaving = signal(false);
  canSubmit = computed(() => this.form.valid && !this.isSaving());

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  // ------ Tabla ------
  displayedColumns: string[] = [
    'numero',
    'nombre',
    'fechaNac',
    'color',
    'tipoLeche',
    'procedencia',
    'propietario',
    'dp',
    'fPalpacion',
    'fechaParto',
    'gc',
    'detalles',
    'acciones',
  ];

  dataSource = new MatTableDataSource<VacaParida>([]);

  // Columnas (conmutables desde menú)
  allColumns = [
    { key: 'idx', label: '#' },
    { key: 'numero', label: 'Nº' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaNac', label: 'Nacimiento' },
    { key: 'color', label: 'Color' },
    { key: 'tipoLeche', label: 'Leche' },
    { key: 'procedencia', label: 'Procedencia' },
    { key: 'propietario', label: 'Propietario' },
    { key: 'dp', label: 'D.P' },
    { key: 'fPalpacion', label: 'F. Palpación' },
    { key: 'fechaParto', label: 'Fec. Parto' },
    { key: 'gc', label: 'G.C' },
    { key: 'detalles', label: 'Detalles' },
    { key: 'acciones', label: 'Editar' },
  ];

  // Filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });
  generoCtrl = new FormControl<string>('', { nonNullable: true }); // '', 'Hembra', 'Macho'
  fincaCtrl = new FormControl<string>('', { nonNullable: true }); // '', 'F1', 'F2'...

  dense = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Orden por defecto
    this.sort.active = 'fechaParto';
    this.sort.direction = 'desc';
    this.sort.sortChange.emit();

    // 👇 asegura que fechas nulas vayan al final y números se comparen como números
    this.dataSource.sortingDataAccessor = (item: VacaParida, property: string) => {
      const v = (item as any)[property];
      if (property === 'fechaParto' || property === 'fechaNac') {
        return v ? new Date(v).getTime() : Number.NEGATIVE_INFINITY;
      }
      if (property === 'dp') return typeof v === 'number' ? v : Number.NEGATIVE_INFINITY;
      return typeof v === 'string' ? v.toLowerCase() : v;
    };

    // Predicado de filtro compuesto (texto + finca + genero)
    this.dataSource.filterPredicate = (data: VacaParida, raw: string) => {
      const f = JSON.parse(raw || '{}') as { q: string; fincaId: string; genero: string };
      const q = (f.q || '').trim().toLowerCase();
      const byText =
        !q ||
        (data.numero || '').toLowerCase().includes(q) ||
        (data.nombre || '').toLowerCase().includes(q) ||
        (data.propietario || '').toLowerCase().includes(q);

      const byFinca = !f.fincaId || f.fincaId === (data.fincaId || '');
      const byGenero = !f.genero || f.genero === (data.genero || '');

      return byText && byFinca && byGenero;
    };

    // Reaplicar filtro cuando cambie algo
    const pushFilter = () => {
      const payload = { q: this.qCtrl.value, fincaId: this.fincaCtrl.value, genero: this.generoCtrl.value };
      this.dataSource.filter = JSON.stringify(payload);
      // importante: forzar recalcular paginator index
      if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    };

    this.qCtrl.valueChanges.pipe(debounceTime(120), startWith(this.qCtrl.value)).subscribe(() => pushFilter());
    this.fincaCtrl.valueChanges.pipe(startWith(this.fincaCtrl.value)).subscribe(() => pushFilter());
    this.generoCtrl.valueChanges.pipe(startWith(this.generoCtrl.value)).subscribe(() => pushFilter());
  }

ngOnInit() {
  this.setData(this.mockRows(5));
}

mockRows(n = 5): VacaParida[] {
  const fincas = this.fincas.map(f => f.id);
  const colores = ['Blanca','Roja','Pintada','Negra','Baya'];
  const nombres = ['Blanquita Gigantona','Abril','Estrella','Canela','Luna'];

  const pick = <T>(arr: T[]) => arr[Math.floor(Math.random()*arr.length)];
  const randDate = (from: Date, to: Date) =>
    new Date(from.getTime() + Math.random()*(to.getTime()-from.getTime()));

  const today = new Date();
  const start = new Date(today.getFullYear()-8, 0, 1);

  const rows: VacaParida[] = [];
  for (let i=0;i<n;i++){
    const fechaNac = randDate(start, today);
    const fechaParto = randDate(new Date(today.getFullYear()-1,0,1), today);
    const genero: Genero = Math.random() < 0.85 ? 'Hembra' : 'Macho'; // mayoría hembras

    const numero = String(7 + i * 3); // just for variety

    rows.push({
      id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
      numero,
      nombre: pick(nombres),
      fechaNac,
      color: pick(colores),
      procedencia: ['Cría','H-casa blanca','Compra'][Math.floor(Math.random()*3)],
      propietario: 'MC',
      tipoLeche: ['Buena','Regular','Mala'][Math.floor(Math.random()*3)] as TipoLeche,
      fechaParto,
      fPalpacion: randDate(new Date(today.getFullYear()-1,0,1), today),
      genero,
      dp: this.calcDP(fechaParto),
      gc: genero === 'Macho' ? 'M' : 'H',
      detalles: Math.random() < 0.3 ? 'Sin observaciones' : '',
      fincaId: pick(fincas),
    });
  }
  return rows;
}


  get totalVacas(): number {
    return this.dataSource.data.length;
  }
  // Si quieres setear data inicialmente (ejemplo)
  setData(rows: VacaParida[]) {
    this.dataSource.data = rows ?? [];
  }

  clearFilters() {
    this.qCtrl.setValue('');
    this.fincaCtrl.setValue('');
    this.generoCtrl.setValue('');
  }

  toggleColumn(key: string, show: boolean) {
    if (show) {
      if (!this.displayedColumns.includes(key)) this.displayedColumns.push(key);
    } else {
      this.displayedColumns = this.displayedColumns.filter((c) => c !== key);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const nueva: VacaParida = {
      // opcional: id si quieres trackear
      id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),

      numero: String(v.numero ?? ''),
      nombre: String(v.nombre ?? ''),
      fechaNac: v.fechaNac ?? null,
      color: v.color ?? null,

      // 👇 nombre correcto
      tipoLeche: v.tipoLeche ?? null,

      procedencia: v.procedencia ?? null,
      propietario: v.propietario ?? null,

      fechaParto: v.fechaParto ?? null,
      fPalpacion: v.fPalpacion ?? null,

      // días posparto (o lo que sea dp en tu modelo)
      dp: this.calcDP(v.fechaParto),

      // 👇 agrega el campo requerido
      genero: (v.genero ?? 'Hembra') as Genero,

      // si quieres mantener la abreviatura según género
      gc: v.genero === 'Macho' ? 'M' : 'H',

      fincaId: v.fincaId ?? null,
      detalles: v.detalles ?? null,
    };

    // TODO: guardar/enviar
    console.log('Guardar vaca parida:', nueva);
  }

  private calcDP(fechaParto: Date | null): number | null {
    if (!fechaParto) return null;
    const ms = Date.now() - new Date(fechaParto).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }

  verDetalle(row: VacaParida) {
    // TODO: abre un modal o navega a detalle
    console.log('Detalle:', row);
  }

  editar(row: VacaParida) {
    // TODO: cargar el row al formulario para edición
    this.form.patchValue({
      numero: row.numero,
      nombre: row.nombre,
      fechaNac: row.fechaNac,
      color: row.color,
      procedencia: row.procedencia,
      propietario: row.propietario,
      fechaParto: row.fechaParto,
      fPalpacion: row.fPalpacion,
      fincaId: row.fincaId,
      genero: row.gc === 'M' ? 'Macho' : 'Hembra',
      detalles: row.detalles,
      tipoLeche: row.tipoLeche,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  trackById = (_: number, item: VacaParida) => item.id ?? `${item.numero}-${item.nombre}`;
}
