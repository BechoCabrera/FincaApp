import { Component, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
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
  private date = inject(DatePipe);
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

  // === Columnas por defecto e iniciales ===
  defaultColumns: string[] = [
    'numero', 'nombre', 'fechaNac', 'color', 'tipoLeche',
    'procedencia', 'propietario', 'dp', 'fPalpacion',
    'fechaParto', 'gc', 'detalles', 'acciones'
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
      this.displayedColumns = this.allColumns.map(c => c.key); // todas, en el orden de allColumns
    } else {
      this.displayedColumns = [];        // vuelve a las “por defecto”
    }
  }

  // === Mantener orden y unicidad cuando agregas/quitás una ===
  toggleColumn(key: string, show: boolean) {
    if (show) {
      const set = new Set(this.displayedColumns.concat(key));
      this.displayedColumns = this.allColumns.map(c => c.key).filter(k => set.has(k));
    } else {
      this.displayedColumns = this.displayedColumns.filter(c => c !== key);
    }
  }

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
    this.dataSource.sortingDataAccessor = (item: VacaParida, prop: string) => {
      const v = (item as any)[prop];
      if (prop === 'fechaParto' || prop === 'fechaNac') {
        return v ? new Date(v).getTime() : null;            // null -> al final (lo manejamos abajo)
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
        if (aNull) return 1;   // null al final
        if (bNull) return -1;  // null al final

        return (av < bv ? -1 : av > bv ? 1 : 0) * (isAsc ? 1 : -1);
      });
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
    this.setData(this.mockRows(125));
  }

  mockRows(n = 5): VacaParida[] {
    const fincas = this.fincas.map(f => f.id);
    const colores = ['Blanca', 'Roja', 'Pintada', 'Negra', 'Baya'];
    const nombres = ['Blanquita Gigantona', 'Abril', 'Estrella', 'Canela', 'Luna'];

    const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const randDate = (from: Date, to: Date) =>
      new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));

    const today = new Date();
    const start = new Date(today.getFullYear() - 8, 0, 1);

    const rows: VacaParida[] = [];
    for (let i = 0; i < n; i++) {
      const fechaNac = randDate(start, today);
      const fechaParto = randDate(new Date(today.getFullYear() - 1, 0, 1), today);
      const genero: Genero = Math.random() < 0.85 ? 'Hembra' : 'Macho'; // mayoría hembras

      const numero = String(7 + i * 3); // just for variety

      rows.push({
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        numero,
        nombre: pick(nombres),
        fechaNac,
        color: pick(colores),
        procedencia: ['Cría', 'H-casa blanca', 'Compra'][Math.floor(Math.random() * 3)],
        propietario: 'MC',
        tipoLeche: ['Buena', 'Regular', 'Mala'][Math.floor(Math.random() * 3)] as TipoLeche,
        fechaParto,
        fPalpacion: randDate(new Date(today.getFullYear() - 1, 0, 1), today),
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

  private colLabel(key: string) {
    return this.allColumns.find(c => c.key === key)?.label ?? key;
  }

  exportPdf() {
    // Solo columnas visibles y “reales” (excluye acciones/idx si no quieres exportarlas)
    const visibleKeys = this.displayedColumns
      .filter(k => k !== 'acciones'); // quita lo que no tenga datos

    // Cabecera (labels)
    const head = [visibleKeys.map(k => this.colLabel(k).toUpperCase())];

    // Filas (usa los datos filtrados que el usuario está viendo)
    const rows = this.dataSource.filteredData.map(row =>
      visibleKeys.map(key => {
        let v: any = (row as any)[key];

        // Formatea fechas
        if (key === 'fechaNac' || key === 'fechaParto' || key === 'fPalpacion') {
          return v ? this.date.transform(v, 'yyyy-MM-dd') : '';
        }
        return v ?? '';
      })
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
    doc.text('Vacas Paridas', marginX, 32);

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
        doc.text(
          `Página ${pageNum}`,
          pageSize.getWidth() - marginX,
          pageSize.getHeight() - 12,
          { align: 'right' }
        );
      },
    });

    const file = `vacas-paridas_${this.date.transform(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(file);
  }
}
