import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule,FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-proximas',
   standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './proximas.component.html',
  styleUrl: './proximas.component.css'
})
export class ProximasComponent {

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
