import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-paridas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './paridas.component.html',
  styleUrls: ['./paridas.component.css']
})
export class ParidasComponent {
  form: FormGroup;
  displayedColumns: string[] = ['nombre', 'edad', 'acciones'];
  data: any[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(1)]]
    });
  }

  agregar() {
    if (this.form.valid) {
      this.data.push(this.form.value);
      this.form.reset();
    }
  }

  eliminar(index: number) {
    this.data.splice(index, 1);
  }
}
