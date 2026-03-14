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
import { ParidaService, CreateParidaDto } from 'src/app/core/services/parida.service';
import { ParidaView } from 'src/app/core/models/animal-view.models';

import { MatMenuModule } from '@angular/material/menu';
import { FincaDto, FincaService } from 'src/app/core/services/finca.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { TableFiltersComponent } from 'src/app/shared/components/table-filters/table-filters.component';
import { CriaDraftDto, ParidaCriaFormComponent } from 'src/app/modules/ganaderia/hembras/paridas/parida-cria-form/parida-cria-form.component';
import { EstadoHembra } from 'src/app/core/models/animal.enums';
import { MatDialog } from '@angular/material/dialog';
import { TimelineDialogComponent } from 'src/app/shared/components/timeline/timeline-dialog.component';
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
    // shared
    TableFiltersComponent,
    ParidaCriaFormComponent,
  ],
  templateUrl: './paridas.component.html',
  styleUrls: ['./paridas.component.css'],
  providers: [DatePipe],
})
export class ParidasComponent {
  constructor(private fincaService: FincaService, private dialog: MatDialog) {}

  private paridaService = inject(ParidaService);
  private date = inject(DatePipe);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  // Opciones (mock; cámbialas por tu API)
  fincas: FincaDto[] = [];
  tiposLeche: TipoLeche[] = ['Buena', 'Regular', 'Mala'];

  // ------ Formulario ------
  form = new FormGroup({
    nombre: new FormControl<string | null>(null, { nonNullable: false, validators: Validators.required }),
    numeroArete: new FormControl<string | null>(null, { nonNullable: false, validators: Validators.required }),
    fincaActualId: new FormControl<string | null>(null, { nonNullable: false, validators: Validators.required }),

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

  // show cria form when user selects genero or explicitly
  showCriaForm = false;

  ngOnInit() {
    this.loadParidas();
    this.cargarFincas();

    // auto-open cria form when generoCria changes
    this.form.get('generoCria')?.valueChanges.subscribe(() => {
      // only open if basic mother info provided (numero and finca)
      const numero = this.form.get('numero')?.value;
      const fincaId = this.form.get('fincaId')?.value;
      if (numero && fincaId) this.showCriaForm = true;
    });
  }

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  cargarFincas() {
    this.fincaService.listar().subscribe({
      next: (res) => (this.fincas = res),
      error: () => this.notify.error('No se pudo cargar las fincas'),
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
  // track parto id when editing a parto record instead of mother
  private editingPartoId: string | null = null;
  lastSavedParida: {
    madreId: string | null;
    madreNumero: string;
    madreNombre: string;
    generoCria: Genero;
    fincaActualId: string | null;
  } | null = null;
  lastSavedCria: {
    numeroArete: string | null;
    nombre: string | null;
    fechaNacimiento: string | null;
    color: string | null;
    propietario: string | null;
    pesoKg: number | null;
    fincaActualId: string | null;
    madreNumero: string | null;
    madreNombre: string | null;
    detalles: string | null;
  } | null = null;

  dataSource = new MatTableDataSource<ParidaView>([]);

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
    this.dataSource.sortingDataAccessor = (item: ParidaView, prop: string) => {
      const v = (item as any)[prop];
      if (prop === 'fechaParida' || prop === 'fechaNacimiento') {
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
    this.dataSource.filterPredicate = (data: ParidaView, raw: string) => {
      const f = JSON.parse(raw || '{}') as { q: string; fincaActualId: string; genero: string };
      const q = (f.q || '').trim().toLowerCase();
      const byText =
        !q ||
        (data.numeroArete || '').toLowerCase().includes(q) ||
        (data.nombre || '').toLowerCase().includes(q) ||
        (data.propietario || '').toLowerCase().includes(q);

      const byFinca = !f.fincaActualId || f.fincaActualId === (data.fincaActualId || '');
      const byGenero = !f.genero || f.genero === (data.generoCria || '');

      return byText && byFinca && byGenero;
    };

    // Reaplicar filtro cuando cambie algo
    const pushFilter = () => {
      const payload = { q: this.qCtrl.value, fincaActualId: this.fincaCtrl.value, genero: this.generoCtrl.value };
      this.dataSource.filter = JSON.stringify(payload);
      // importante: forzar recalcular paginator index
      if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    };

    this.qCtrl.valueChanges.pipe(debounceTime(120), startWith(this.qCtrl.value)).subscribe(() => pushFilter());
    this.fincaCtrl.valueChanges.pipe(startWith(this.fincaCtrl.value)).subscribe(() => pushFilter());
    this.generoCtrl.valueChanges.pipe(startWith(this.generoCtrl.value)).subscribe(() => pushFilter());
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
      numeroArete: raw.numeroArete!,
      fincaActualId: raw.fincaActualId!,

      generoCria: raw.generoCria!,

      fechaParida: raw.fechaParida!.toISOString(),
      fechaPalpacion: raw.fechaPalpacion ? raw.fechaPalpacion.toISOString() : null,
      fechaNacimiento: raw.fechaNacimiento ? raw.fechaNacimiento.toISOString() : null,

      color: raw.color ?? null,
      tipoLeche: raw.tipoLeche ?? null,
      procedencia: raw.procedencia ?? null,
      estadoHembra: EstadoHembra.Parida,
      propietario: raw.propietario ?? null,
      observaciones: raw.observaciones ?? null,
      // include cria data if available (from nested component)
      numeroCria: this.lastSavedCria?.numeroArete ?? null,
      criaNombre: this.lastSavedCria?.nombre ?? null,
      criaColor: this.lastSavedCria?.color ?? null,
      criaPropietario: this.lastSavedCria?.propietario ?? null,
      criaPesoKg: this.lastSavedCria?.pesoKg ?? null,
      criaDetalles: this.lastSavedCria?.detalles ?? null,
    };

    // reset showCriaForm when saving
    this.showCriaForm = false;

    if (this.editingId) {
      // If editing a Parto record (we have editingPartoId), call updateParto
      if (this.editingPartoId) {
        const updateDto: any = {
          fechaParida: raw.fechaParida!.toISOString(),
          fechaPalpacion: raw.fechaPalpacion ? raw.fechaPalpacion.toISOString() : null,
          fechaNacimiento: raw.fechaNacimiento ? raw.fechaNacimiento.toISOString() : null,
          generoCria: raw.generoCria ?? null,
          color: raw.color ?? null,
          tipoLeche: raw.tipoLeche ?? null,
          procedencia: raw.procedencia ?? null,
          propietario: raw.propietario ?? null,
          observaciones: raw.observaciones ?? null,
          // snapshot fields
          criaNumeroArete: this.lastSavedCria?.numeroArete ?? null,
          criaNombre: this.lastSavedCria?.nombre ?? null,
          criaColor: this.lastSavedCria?.color ?? null,
          criaPropietario: this.lastSavedCria?.propietario ?? null,
          criaPesoKg: this.lastSavedCria?.pesoKg ?? null,
          criaDetalles: this.lastSavedCria?.detalles ?? null,
        };

        this.paridaService.updateParto(this.editingPartoId, updateDto).subscribe({
          next: () => {
            this.lastSavedParida = {
              madreId: this.editingId,
              madreNumero: payload.numeroArete,
              madreNombre: payload.nombre,
              generoCria: payload.generoCria,
              fincaActualId: payload.fincaActualId ?? null,
            };
            this.form.reset();
            this.editingId = null;
            this.editingPartoId = null;
            this.loadParidas();
            this.notify.success('Registro de parto actualizado');
          },
          error: (err) => this.notify.error(err.error?.message ?? 'No se pudo actualizar el parto'),
        });

        return;
      }

      // Otherwise update the animal (existing behavior)
      this.paridaService.update(this.editingId, payload).subscribe({
        next: () => {
          this.lastSavedParida = {
            madreId: this.editingId,
            madreNumero: payload.numeroArete,
            madreNombre: payload.nombre,
            generoCria: payload.generoCria,
            fincaActualId: payload.fincaActualId,
          };
          this.form.reset();
          this.editingId = null;
          this.loadParidas();
          this.notify.success('Registro actualizado');
        },
        error: (err) => this.notify.error(err.error?.message ?? 'No se pudo actualizar'),
      });
    } else {
      this.paridaService.create(payload).subscribe({
        next: (res: any) => {
          // If API returns successful creation (no warnings)
          this.lastSavedParida = {
            madreId: res?.madreId ?? null,
            madreNumero: payload.numeroArete,
            madreNombre: payload.nombre,
            generoCria: payload.generoCria,
            fincaActualId: payload.fincaActualId ?? null,
          };
          // clear temporary cria after successful save
          this.lastSavedCria = null;
          this.form.reset();
          this.loadParidas();
          this.notify.success('Registro guardado');
        },
        error: (err) => {
          // If controller returned 400 with warnings, treat as partial success: show warnings but still update UI
          const warnings: string[] | undefined = err?.error?.warnings;
          if (err?.status === 400 && Array.isArray(warnings) && warnings.length > 0) {
            // Show main message if provided
            const msg = err.error?.message ?? 'Advertencias al guardar';
            this.notify.error(msg);
            // show each warning
            warnings.forEach(w => this.notify.info(w, 6000));

            // Update UI as if saved (the handler already created entities)
            this.lastSavedParida = {
              madreId: err.error?.madreId ?? null,
              madreNumero: payload.numeroArete,
              madreNombre: payload.nombre,
              generoCria: payload.generoCria,
              fincaActualId: payload.fincaActualId ?? null,
            };
            this.lastSavedCria = null;
            this.form.reset();
            this.loadParidas();
            return;
          }

          this.notify.error(err.error?.message ?? 'No se pudo guardar');
        },
      });
    }
  }

  onCriaGuardada(cria: any) {
    // child emits saved with cria data
    this.lastSavedCria = cria;
    this.showCriaForm = false;
    this.notify.success('Cría añadida, ahora guarda la parida para persistir todo');
  }

  loadParidas() {
    this.paridaService.getAllAsView().subscribe({
      next: (paridas) => {
        this.dataSource.data = paridas;
      },
      error: () => this.notify.error('No se pudo cargar el listado'),
    });
  }

  verDetalle(row: ParidaView) {
    // TODO: abre un modal o navega a detalle
    console.log('Detalle:', row);
  }

  editar(row: ParidaView) {
    this.editingId = row.id;
    // prefer editing the parto record if available (provided by API as lastPartoId)
    this.editingPartoId = (row as any).lastPartoId ?? null;

    this.form.patchValue({
      nombre: row.nombre,
      numeroArete: row.numeroArete,
      fincaActualId: row.fincaActualId,

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
  trackById = (_: number, item: ParidaView) => item.id ?? `${item.numeroArete}-${item.nombre}`;

  private colLabel(key: string) {
    return this.allColumns.find((c) => c.key === key)?.label ?? key;
  }

  eliminar(row: ParidaView) {
    const ok = confirm(`¿Eliminar la parida Nº ${row.numeroArete}?`);
    if (!ok) return;

    this.paridaService.delete(row.id).subscribe({
      next: () => {
        this.loadParidas();
        this.notify.success('Registro eliminado');
      },
      error: err => {
        this.notify.error(err.error?.message ?? 'No se pudo eliminar');
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
        if (key === 'fechaNacimiento' || key === 'fechaParida' || key === 'fechaPalpacion') {
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

  openTimeline(animalId: string) {
    this.dialog.open(TimelineDialogComponent, { data: { animalId } });
  }
}
