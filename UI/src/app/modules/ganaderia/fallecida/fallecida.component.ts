import { Component, inject, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
// PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Services
import { ParidaService } from 'src/app/core/services/parida.service';
import { EscoteraService } from 'src/app/core/services/escotera.service';
import { ProximaService } from 'src/app/core/services/proxima.service';
import { RecriaHembrasService } from 'src/app/core/services/recrias-hembras.service';
import { NovillasVientreService } from 'src/app/core/services/novillas-vientre.service';
import { CriaMachosService } from 'src/app/core/services/cria-machos.service';
import { RecriasMachosService } from 'src/app/core/services/recrias-machos.service';
import { ToroService } from 'src/app/core/services/toro.service';
import { ToretesService } from 'src/app/core/services/toretes.service';
import { FallecimientosService, CreateFallecimientoDto, FallecidaDto } from 'src/app/core/services/fallecimientos.service';
import { NotificationService } from 'src/app/core/services/notification.service';

type Item = { id: string; label: string };

@Component({
  selector: 'app-fallecida',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './fallecida.component.html',
  styleUrls: ['./fallecida.component.css'],
})
export class FallecidaComponent implements AfterViewInit, OnInit {
  private paridaSvc = inject(ParidaService);
  private escoteraSvc = inject(EscoteraService);
  private proximaSvc = inject(ProximaService);
  private recriaHembraSvc = inject(RecriaHembrasService);
  private novillaSvc = inject(NovillasVientreService);
  private criaMachoSvc = inject(CriaMachosService);
  private recriaMachoSvc = inject(RecriasMachosService);
  private toroSvc = inject(ToroService);
  private toreteSvc = inject(ToretesService);
  private fallecimientosSvc = inject(FallecimientosService);
  private notify = inject(NotificationService);
  // category and animal are part of the reactive form (`form`) — subscribe to their changes instead

  loadingAnimals = false;
  animals: Item[] = [];
  form: FormGroup;
  animalSearch = new FormControl('');
  // Table
  records: FallecidaDto[] = [];
  dataSource: any = new MatTableDataSource<FallecidaDto>([]);
  displayedColumns: string[] = ['idx', 'categoria', 'animalLabel', 'fechaFallecimiento', 'causa', 'notas', 'acciones'];
  allColumns = [
    { key: 'idx', label: '#' },
    { key: 'categoria', label: 'CATEGORÍA' },
    { key: 'animalLabel', label: 'ANIMAL' },
    { key: 'fechaFallecimiento', label: 'FECHA' },
    { key: 'causa', label: 'CAUSA' },
    { key: 'notas', label: 'NOTAS' },
    { key: 'acciones', label: 'ACCIONES' },
  ];
  private visible = new Set(this.displayedColumns);
  qCtrl = new FormControl('', { nonNullable: true });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categories = [
    { key: 'paridas', label: 'Vacas Paridas' },
    { key: 'escotera', label: 'Escotera' },
    { key: 'proximas', label: 'Próximas' },
    { key: 'crias-hembra', label: 'Crías Hembra' },
    { key: 'recrias-hembra', label: 'Recrías Hembra' },
    { key: 'novillas-vientre', label: 'Novillas de Vientre' },
    { key: 'crias-macho', label: 'Crías Macho' },
    { key: 'recrias-macho', label: 'Recrías Macho' },
    { key: 'toros', label: 'Toros' },
    { key: 'toretes', label: 'Toretes' },
  ];

  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.group({
      categoria: [null, Validators.required],
      animalId: [null, Validators.required],
      fechaFallecimiento: [null, Validators.required],
      causa: [null, Validators.required],
      notas: [null],
    });
    this.form.get('categoria')?.valueChanges.subscribe((k: string | null) => this.onCategoryChange(k));

    // Typeahead for animals
    this.animalSearch.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map((q: string | null) => q ?? ''),
        switchMap((q: string) => {
          const category = this.form.get('categoria')?.value;
          if (!category) return of([] as Item[]);
          return this.searchAnimals(String(q || ''), category).pipe(catchError(() => of([])));
        })
      )
      .subscribe((items) => {
        this.animals = items;
      });

    // Table search
    this.qCtrl.valueChanges.subscribe(() => this.applyFilter());
  }

  ngOnInit(): void {
    this.loadFallecimientos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (row: any, filterJson: string) => {
      const f = JSON.parse(filterJson) as { q: string };
      const q = (f.q || '').toLowerCase();
      return (
        String(row.categoria || '').toLowerCase().includes(q) || String(row.animalLabel || '').toLowerCase().includes(q) || String(row.causa || '').toLowerCase().includes(q)
      );
    };
  }

  private applyFilter() {
    this.dataSource.filter = JSON.stringify({ q: this.qCtrl.value || '' });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  private searchAnimals(query: string, key: string): Observable<Item[]> {
    const q = (query || '').trim().toLowerCase();
    const finishMap = (arr: any[], mapper: (r: any) => Item) => {
      const items = arr.map(mapper);
      return of(q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items);
    };

    switch (key) {
      case 'paridas':
        if ((this.paridaSvc as any).search) return (this.paridaSvc as any).search(q).pipe(map((res: any[]) => res.map((r: any) => ({ id: r.id, label: `${r.numero} — ${r.nombre}` }))));
        return this.paridaSvc.getAll().pipe(switchMap((res: any[]) => finishMap(res, (r: any) => ({ id: r.id, label: `${r.numero} — ${r.nombre}` }))));
      case 'escotera':
        if ((this.escoteraSvc as any).search) return (this.escoteraSvc as any).search(q).pipe(map((res: any[]) => res.map((r: any) => ({ id: r.id, label: `${r.numero} — ${r.nombre}` }))));
        return this.escoteraSvc.getAll().pipe(switchMap((res: any[]) => finishMap(res, (r: any) => ({ id: r.id as string, label: `${r.numero} — ${r.nombre}` }))));
      case 'proximas':
        return (this.proximaSvc as any).search(q).pipe(map((res: any[]) => res.map((r: any) => ({ id: r.id, label: `${r.numero} — ${r.nombre}` }))));
      case 'crias-hembra':
      case 'recrias-hembra':
        return this.recriaHembraSvc.getAll().pipe(switchMap((res: any[]) => finishMap(res, (r: any) => ({ id: r.id, label: `${(r as any).numero ?? ''} — ${r.nombre}` }))));
      case 'novillas-vientre':
        return this.novillaSvc.getAll().pipe(switchMap((res: any[]) => finishMap(res, (r: any) => ({ id: r.id, label: `${(r as any).numero ?? ''} — ${r.nombre}` }))));
      case 'crias-macho':
        return this.criaMachoSvc.getAll().pipe(switchMap((res: any[]) => finishMap(res, (r: any) => ({ id: r.id, label: `${(r as any).numero ?? ''} — ${r.nombre}` }))));
      case 'recrias-macho':
        return this.recriaMachoSvc.listarRecrias().pipe(map((res: any) => {
          const items = Array.isArray(res) ? res : res?.items || [];
          return items.map((r: any) => ({ id: r.id, label: `${(r.numero ?? '')} — ${r.nombre}` }));
        }));
      case 'toros':
        return this.toroSvc.getToros().pipe(switchMap((res: any[]) => finishMap(res, (r: any) => ({ id: r.id, label: r.nombre }))));
      case 'toretes':
        return this.toreteSvc.listarToretes().pipe(map((res: any) => {
          const items = Array.isArray(res) ? res : res?.items || [];
          return items.map((r: any) => ({ id: r.id, label: `${(r.numero ?? '')} — ${r.nombre}` }));
        }));
      default:
        return of([]);
    }
  }

  private onCategoryChange(key: string | null) {
    this.form.get('animalId')?.setValue(null, { emitEvent: false });
    this.animals = [];
    if (!key) return;
    this.loadingAnimals = true;

    const finish = (items: Item[]) => {
      this.animals = items;
      this.loadingAnimals = false;
    };

    switch (key) {
      case 'paridas':
        this.paridaSvc.getAll().subscribe((res) => finish(res.map((r) => ({ id: r.id, label: `${r.numero} — ${r.nombre}` }))));
        break;
      case 'escotera':
        this.escoteraSvc.getAll().subscribe((res) => finish(res.map((r) => ({ id: r.id as string, label: `${r.numero} — ${r.nombre}` }))));
        break;
      case 'proximas':
        this.proximaSvc.search().subscribe((res) => finish(res.map((r) => ({ id: r.id, label: `${r.numero} — ${r.nombre}` }))));
        break;
      case 'crias-hembra':
        this.recriaHembraSvc.getAll().subscribe((res) => finish(res.map((r) => ({ id: r.id, label: `${(r as any).numero ?? ''} — ${r.nombre}` }))));
        break;
      case 'recrias-hembra':
        this.recriaHembraSvc.getAll().subscribe((res) => finish(res.map((r) => ({ id: r.id, label: `${(r as any).numero ?? ''} — ${r.nombre}` }))));
        break;
      case 'novillas-vientre':
        this.novillaSvc.getAll().subscribe((res) => finish(res.map((r) => ({ id: r.id, label: `${(r as any).numero ?? ''} — ${r.nombre}` }))));
        break;
      case 'crias-macho':
        this.criaMachoSvc.getAll().subscribe((res) => finish(res.map((r) => ({ id: r.id, label: `${(r as any).numero ?? ''} — ${r.nombre}` }))));
        break;
      case 'recrias-macho':
        this.recriaMachoSvc.listarRecrias().subscribe((res) => {
          const items = Array.isArray(res) ? res : res?.items || [];
          finish(items.map((r: any) => ({ id: r.id, label: `${(r.numero ?? '')} — ${r.nombre}` })));
        });
        break;
      case 'toros':
        this.toroSvc.getToros().subscribe((res) => finish(res.map((r) => ({ id: r.id, label: r.nombre }))));
        break;
      case 'toretes':
        this.toreteSvc.listarToretes().subscribe((res) => {
          const items = Array.isArray(res) ? res : res?.items || [];
          finish(items.map((r: any) => ({ id: r.id, label: `${(r.numero ?? '')} — ${r.nombre}` })));
        });
        break;
      default:
        this.loadingAnimals = false;
        break;
    }
  }

  submitFallecimiento() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: CreateFallecimientoDto = {
      categoria: this.form.value.categoria || '',
      animalId: this.form.value.animalId || '',
      fechaFallecimiento: this.toIso(this.form.value.fechaFallecimiento),
      causa: this.form.value.causa || null,
      notas: this.form.value.notas || null,
    };

    this.fallecimientosSvc.create(dto).subscribe({
      next: (f: FallecidaDto) => {
        this.notify.success('Fallecimiento registrado', 2500);
        this.form.reset();
        this.form.get('categoria')?.setValue(null);
        this.form.get('animalId')?.setValue(null);
        this.animals = [];
        this.records.unshift(f);
        this.dataSource.data = this.records;
      },
      error: () => this.notify.error('No se pudo registrar fallecimiento', 3000),
    });
  }

  // ===== Tabla helpers =====
  isColumnVisible(key: string) {
    return this.visible.has(key);
  }
  get allSelected() {
    return this.visible.size === this.allColumns.length;
  }
  toggleColumn(key: string, on: boolean) {
    if (on) this.visible.add(key);
    else this.visible.delete(key);
    this.displayedColumns = this.allColumns.map((c) => c.key).filter((k) => this.visible.has(k));
  }
  toggleAll(on: boolean) {
    if (on) this.visible = new Set(this.allColumns.map((c) => c.key));
    else this.visible.clear();
    this.displayedColumns = this.allColumns.map((c) => c.key).filter((k) => this.visible.has(k));
  }

  exportPdf() {
    const exportKeys = this.displayedColumns.filter((k) => this.visible.has(k) && k !== 'acciones');
    const headers = exportKeys.map((k) => this.allColumns.find((c) => c.key === k)?.label ?? k.toUpperCase());
    const data = this.dataSource.filteredData?.length ? this.dataSource.filteredData : this.dataSource.data;
    const rows = data.map((r: any, idx: any) => exportKeys.map((k) => (k === 'idx' ? String(idx + 1) : r[k] ?? '')));
    const orientation = exportKeys.length > 6 ? 'l' : 'p';
    const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
    const title = 'Fallecimientos';
    const subtitle = `Generado: ${this.toIso(new Date())}   Registros: ${rows.length}`;
    doc.setFontSize(14);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(subtitle, 40, 58);
    autoTable(doc, { head: [headers], body: rows, startY: 72, styles: { fontSize: 9, cellPadding: 4 }, headStyles: { fillColor: [31, 59, 87], textColor: 255 }, margin: { left: 40, right: 40 } });
    doc.save(`fallecimientos_${this.toIso(new Date())}.pdf`);
  }

  /** trackBy for table rows */
  trackById = (_: number, r: any) => r?.id ?? r?.animalId ?? _;

  private toIso(d: any) {
    if (!d) return '';
    return d instanceof Date ? d.toISOString().slice(0, 10) : String(d);
  }

  private loadFallecimientos() {
    this.fallecimientosSvc.getAll().subscribe({
      next: (res: FallecidaDto[]) => {
        const items = Array.isArray(res) ? res : [];
        this.records = items;
        this.dataSource.data = this.records;
      },
      error: (err: any) => {
        console.error('Error cargando fallecimientos', err);
        this.notify.error('No se pudieron cargar fallecimientos');
      },
    });
  }
}
