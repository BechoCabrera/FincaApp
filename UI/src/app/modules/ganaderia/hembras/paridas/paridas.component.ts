import { Component, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { ParidaService, CreateParidaDto, ParidaDto } from 'src/app/core/services/parida.service';

import { MatMenuModule } from '@angular/material/menu';
import { FincaDto, FincaService } from 'src/app/core/services/finca.service';
type Genero = 'Hembra' | 'Macho';
type TipoLeche = 'Buena' | 'Regular' | 'Mala';
interface ParidaForm {
  nombre: string | null;
  numero: string | null;
  fincaId: string | null;

  generoCria: 'Hembra' | 'Macho' | null;

  fechaParida: string | null;
  fechaPalpacion: string | null;
  fechaNacimiento: string | null;

  color: string | null;
  tipoLeche: string | null;
  procedencia: string | null;

  propietario: string | null;
  observaciones: string | null;
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
  constructor(private fincaService: FincaService) {}

  private paridaService = inject(ParidaService);
  private date = inject(DatePipe);
  private fb = inject(FormBuilder);

  // Opciones (mock; cámbialas por tu API)
  fincas: FincaDto[] = [];
  tiposLeche: TipoLeche[] = ['Buena', 'Regular', 'Mala'];

  // ------ Formulario ------
  form = new FormGroup({
    nombre: new FormControl<string | null>(null, { nonNullable: false, validators: Validators.required }),
    numero: new FormControl<string | null>(null, { nonNullable: false, validators: Validators.required }),
    fincaId: new FormControl<string | null>(null, { nonNullable: false, validators: Validators.required }),

    generoCria: new FormControl<'Hembra' | 'Macho' | null>('Hembra', Validators.required),

    fechaParida: this.fb.control<Date | null>(null, Validators.required),
    fechaPalpacion: this.fb.control<Date | null>(null),
    fechaNacimiento: this.fb.control<Date | null>(null),

    color: new FormControl<string | null>(null),
    tipoLeche: new FormControl<string | null>(null),
    procedencia: new FormControl<string | null>(null),

    propietario: new FormControl<string | null>(null),
    observaciones: new FormControl<string | null>(null),
  });

  isSaving = signal(false);
  canSubmit = computed(() => this.form.valid && !this.isSaving());

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  cargarFincas() {
    this.fincaService.listar().subscribe({
      next: (res) => (this.fincas = res),
    });
  }
  // === Columnas por defecto e iniciales ===
  defaultColumns: string[] = [
    'numero',
    'nombre',
    'fechaNacimiento',
    'color',
    'tipoLeche',
    'procedencia',
    'propietario',
    'fechaPalpacion',
    'fechaParida',
    'observaciones',
    'acciones',
  ];

  displayedColumns: string[] = [...this.defaultColumns];

  // === Helpers para el checkbox maestro ===
  get allSelected(): boolean {
    return this.displayedColumns.length === this.allColumns.length;
  }
  get someSelected(): boolean {
    const n = this.displayedColumns.length;
    return n > 0 && n < this.allColumns.length;
  }
  isColumnVisible = (key: string) => this.displayedColumns.includes(key);

  // === Seleccionar / limpiar todas ===
  toggleAll(checked: boolean) {
    if (checked) {
      this.displayedColumns = this.allColumns.map((c) => c.key); // todas, en el orden de allColumns
    } else {
      this.displayedColumns = []; // vuelve a las “por defecto”
    }
  }

  // === Mantener orden y unicidad cuando agregas/quitás una ===
  toggleColumn(key: string, show: boolean) {
    if (show) {
      const set = new Set(this.displayedColumns.concat(key));
      this.displayedColumns = this.allColumns.map((c) => c.key).filter((k) => set.has(k));
    } else {
      this.displayedColumns = this.displayedColumns.filter((c) => c !== key);
    }
  }
  editingId: string | null = null;

  dataSource = new MatTableDataSource<ParidaDto>([]);

  // Columnas (conmutables desde menú)
  allColumns = [
    { key: 'idx', label: '#' },
    { key: 'numero', label: 'Nº' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaNacimiento', label: 'Nacimiento' },
    { key: 'color', label: 'Color' },
    { key: 'tipoLeche', label: 'Leche' },
    { key: 'procedencia', label: 'Procedencia' },
    { key: 'propietario', label: 'Propietario' },
    { key: 'fechaPalpacion', label: 'F. Palpación' },
    { key: 'fechaParida', label: 'Fec. Parto' },
    { key: 'observaciones', label: 'Detalles' },
    { key: 'acciones', label: 'Acciones' },
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
    // this.sort.active = 'fechaParto';
    // this.sort.direction = 'desc';
    // this.sort.sortChange.emit();

    // 👇 asegura que fechas nulas vayan al final y números se comparen como números
    this.dataSource.sortingDataAccessor = (item: ParidaDto, prop: string) => {
      const v = (item as any)[prop];
      if (prop === 'fechaParto' || prop === 'fechaNac') {
        return v ? new Date(v).getTime() : null; // null -> al final (lo manejamos abajo)
      }
      if (prop === 'dp') return typeof v === 'number' ? v : null;
      return typeof v === 'string' ? v.toLowerCase() : v;
    };

    // === fechas/valores nulos SIEMPRE al final (asc y desc) ===

    this.dataSource.sortData = (data, sort) => {
      if (!sort.active || sort.direction === '') return data.slice();
      const isAsc = sort.direction === 'asc';
      return data.slice().sort((a, b) => {
        const av = this.dataSource.sortingDataAccessor(a, sort.active);
        const bv = this.dataSource.sortingDataAccessor(b, sort.active);

        const aNull = av === null || av === undefined;
        const bNull = bv === null || bv === undefined;
        if (aNull && bNull) return 0;
        if (aNull) return 1; // null al final
        if (bNull) return -1; // null al final

        return (av < bv ? -1 : av > bv ? 1 : 0) * (isAsc ? 1 : -1);
      });
    };

    // Predicado de filtro compuesto (texto + finca + genero)
    this.dataSource.filterPredicate = (data: ParidaDto, raw: string) => {
      const f = JSON.parse(raw || '{}') as { q: string; fincaId: string; genero: string };
      const q = (f.q || '').trim().toLowerCase();
      const byText =
        !q ||
        (data.numero || '').toLowerCase().includes(q) ||
        (data.nombre || '').toLowerCase().includes(q) ||
        (data.propietario || '').toLowerCase().includes(q);

      const byFinca = !f.fincaId || f.fincaId === (data.fincaId || '');
      const byGenero = !f.genero || f.genero === (data.generoCria || '');

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
    this.loadParidas();
    this.cargarFincas();
  }

  get totalVacas(): number {
    return this.dataSource.data.length;
  }
  // Si quieres setear data inicialmente (ejemplo)

  clearFilters() {
    this.qCtrl.setValue('');
    this.fincaCtrl.setValue('');
    this.generoCtrl.setValue('');
  }
  submit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const payload: CreateParidaDto = {
      nombre: raw.nombre!,
      numero: raw.numero!,
      fincaId: raw.fincaId!,

      generoCria: raw.generoCria!,

      fechaParida: raw.fechaParida!.toISOString(),
      fechaPalpacion: raw.fechaPalpacion ? raw.fechaPalpacion.toISOString() : null,
      fechaNacimiento: raw.fechaNacimiento ? raw.fechaNacimiento.toISOString() : null,

      color: raw.color ?? null,
      tipoLeche: raw.tipoLeche ?? null,
      procedencia: raw.procedencia ?? null,

      propietario: raw.propietario ?? null,
      observaciones: raw.observaciones ?? null,
    };
    debugger;
    if (this.editingId) {
      this.paridaService.update(this.editingId, payload).subscribe({
        next: () => {
          this.form.reset();
          this.editingId = null;
          this.loadParidas();
        },
        error: (err) => alert(err.error?.message ?? 'Número duplicado'),
      });
    } else {
      this.paridaService.create(payload).subscribe({
        next: () => {
          this.form.reset();
          this.loadParidas();
        },
        error: (err) => alert(err.error?.message ?? 'Número duplicado'),
      });
    }
  }

  loadParidas() {
    this.paridaService.getAll().subscribe((paridas) => {
      this.dataSource.data = paridas;
    });
  }

  verDetalle(row: ParidaDto) {
    // TODO: abre un modal o navega a detalle
    console.log('Detalle:', row);
  }

  editar(row: ParidaDto) {
    this.editingId = row.id;
    this.form.patchValue({
      nombre: row.nombre,
      numero: row.numero,
      fincaId: row.fincaId,

      generoCria: row.generoCria,

      fechaParida: row.fechaParida ? new Date(row.fechaParida) : null,
      fechaPalpacion: row.fechaPalpacion ? new Date(row.fechaPalpacion) : null,
      fechaNacimiento: row.fechaNacimiento ? new Date(row.fechaNacimiento) : null,

      color: row.color,
      tipoLeche: row.tipoLeche,
      procedencia: row.procedencia,

      propietario: row.propietario,
      observaciones: row.observaciones,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  trackById = (_: number, item: ParidaDto) => item.id ?? `${item.numero}-${item.nombre}`;

  private colLabel(key: string) {
    return this.allColumns.find((c) => c.key === key)?.label ?? key;
  }

  eliminar(row: ParidaDto) {
  const ok = confirm(`¿Eliminar la parida Nº ${row.numero}?`);
  if (!ok) return;

  this.paridaService.delete(row.id).subscribe({
    next: () => {
      this.loadParidas();
    },
    error: err => {
      alert(err.error?.message ?? 'Error al eliminar');
    }
  });
}

  exportPdf() {
    // Solo columnas visibles y “reales” (excluye acciones/idx si no quieres exportarlas)
    const visibleKeys = this.displayedColumns.filter((k) => k !== 'acciones'); // quita lo que no tenga datos

    // Cabecera (labels)
    const head = [visibleKeys.map((k) => this.colLabel(k).toUpperCase())];

    // Filas (usa los datos filtrados que el usuario está viendo)
    const rows = this.dataSource.filteredData.map((row) =>
      visibleKeys.map((key) => {
        let v: any = (row as any)[key];

        // Formatea fechas
        if (key === 'fechaNac' || key === 'fechaParto' || key === 'fPalpacion') {
          return v ? this.date.transform(v, 'yyyy-MM-dd') : '';
        }
        return v ?? '';
      }),
    );

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'A4',
    });

    const marginX = 36;
    const startY = 64;

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Vacas ParidaDtos', marginX, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generado: ${this.date.transform(new Date(), 'yyyy-MM-dd HH:mm')}`, marginX, 46);

    // Tabla
    autoTable(doc, {
      head,
      body: rows,
      startY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { fillColor: [250, 204, 21], textColor: 20 }, // amarillo (FACC15 aprox)
      margin: { left: marginX, right: marginX },
      didDrawPage: (data) => {
        // Pie con número de página
        const pageSize = doc.internal.pageSize;
        const pageNum = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Página ${pageNum}`, pageSize.getWidth() - marginX, pageSize.getHeight() - 12, { align: 'right' });
      },
    });

    const file = `vacas-ParidaDtos_${this.date.transform(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(file);
  }
}
