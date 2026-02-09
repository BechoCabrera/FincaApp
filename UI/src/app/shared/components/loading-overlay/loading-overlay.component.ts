import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [NgIf, AsyncPipe, MatProgressSpinnerModule],
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.css'],
})
export class LoadingOverlayComponent {
  constructor(public loading: LoadingService) {}
}
