import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from './core/services/theme.service';
import { ResponsiveHelperComponent } from './shared/components/responsive-helper/responsive-helper.component';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, ResponsiveHelperComponent, NgxSonnerToaster, LoadingOverlayComponent],
})
export class AppComponent {
  title = 'Finca App';

  constructor(public themeService: ThemeService) {}
}
