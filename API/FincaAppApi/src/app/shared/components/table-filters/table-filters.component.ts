import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
// NgIf not required here

export interface ColumnDef { key: string; label: string }

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatMenuModule, MatCheckboxModule, MatDividerModule, MatTooltipModule],
  templateUrl: './table-filters.component.html',
  styleUrls: ['./table-filters.component.css'],
})
export class TableFiltersComponent {
  @Input() qControl!: FormControl<string>;
  @Input() fincaControl!: FormControl<string>;
  @Input() fincas: Array<{ id: string; nombre: string }> = [];
  @Input() totalLabel = '';

  @Input() allColumns: ColumnDef[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() allSelected = false;
  @Input() someSelected = false;

  @Output() toggleColumn = new EventEmitter<{ key: string; checked: boolean }>();
  @Output() toggleAll = new EventEmitter<boolean>();
  @Output() exportPdf = new EventEmitter<void>();

  onToggleColumn(key: string, checked: boolean) {
    this.toggleColumn.emit({ key, checked });
  }
  onToggleAll(checked: boolean) {
    this.toggleAll.emit(checked);
  }
  onExportPdf() {
    this.exportPdf.emit();
  }
}
