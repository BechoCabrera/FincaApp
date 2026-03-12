import { animate, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ThemeService, ThemeColor, ThemeDir } from '../../../../../core/services/theme.service';
import { ClickOutsideDirective } from '../../../../../shared/directives/click-outside.directive';
import { FontZoomService } from 'src/app/core/services/font-zoom.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.css'],
  imports: [
    ClickOutsideDirective,
    RouterLink,
    AngularSvgIconModule,
    NgClass,
    AsyncPipe,
    DecimalPipe,
  ],
  animations: [
    trigger('openClose', [
      state('open',   style({ opacity: 1, transform: 'translateY(0)',   visibility: 'visible' })),
      state('closed', style({ opacity: 0, transform: 'translateY(-20px)', visibility: 'hidden' })),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class ProfileMenuComponent implements OnInit {
  @HostListener('document:keydown.escape')
  onEsc() { this.isOpen = false; }

  @HostListener('window:keydown', ['$event'])          // ⬅️ faltaba este decorador
  onKeydown(e: KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (e.key === '=' || e.key === '+') { this.fontZoom.inc();   e.preventDefault(); }
    if (e.key === '-' || e.key === '_') { this.fontZoom.dec();   e.preventDefault(); }
    if (e.key === '0')                  { this.fontZoom.reset(); e.preventDefault(); }
  }

  zoom$ = this.fontZoom.zoom$;
  incFont()   { this.fontZoom.inc(); }
  decFont()   { this.fontZoom.dec(); }
  resetFont() { this.fontZoom.reset(); }

  isOpen = false;

  profileMenu = [
    { title: 'Your Profile', icon: './assets/icons/heroicons/outline/user-circle.svg', link: '/profile' },
    { title: 'Settings',     icon: './assets/icons/heroicons/outline/cog-6-tooth.svg', link: '/settings' },
    { title: 'Log out',      icon: './assets/icons/heroicons/outline/logout.svg',      link: '/auth' },
  ];

  themeColors = [
  { name: 'base',   code: '#e11d48' },
  { name: 'yellow', code: '#f59e0b' },
  { name: 'green',  code: '#22c55e' },
  { name: 'blue',   code: '#3b82f6' },
  { name: 'orange', code: '#ea580c' },
  { name: 'red',    code: '#cc0022' },
  { name: 'violet', code: '#6d28d9' },
] as const satisfies ReadonlyArray<{ name: ThemeColor; code: string }>;


  themeMode = ['light', 'dark'] as const;
  themeDirection = ['ltr', 'rtl'] as const;

  constructor(public themeService: ThemeService, private fontZoom: FontZoomService) {}

  ngOnInit(): void {}

  toggleMenu() { this.isOpen = !this.isOpen; }

  toggleThemeMode() {
    this.themeService.setMode(this.themeService.isDark ? 'light' : 'dark');
  }
  toggleThemeColor(color: ThemeColor) {         // ⬅️ tipo fuerte
    this.themeService.setColor(color);
  }
  setDirection(value: ThemeDir) {               // ⬅️ tipo fuerte
    this.themeService.setDirection(value);
  }
}
