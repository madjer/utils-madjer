import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService, THEME_COLORS } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule,
    MatButtonModule, MatListModule, MatTooltipModule, MatDividerModule,
  ],
  template: `
    <mat-sidenav-container class="shell">

      <mat-sidenav #sidenav mode="side" [opened]="true" class="sidenav">
        <div class="sidenav-brand">
          <img src="logo.svg" alt="M" class="brand-logo">
          <span class="brand-name">Utilitários<br>Madjer</span>
        </div>

        <mat-divider></mat-divider>

        <mat-nav-list>
          @for (item of navItems; track item.path) {
            <a mat-list-item [routerLink]="item.path" routerLinkActive="active-link"
               [routerLinkActiveOptions]="{exact: item.path === '/'}">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="toolbar" color="primary">
          <button mat-icon-button (click)="sidenav.toggle()" aria-label="Menu">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Utilitários Madjer</span>
          <span class="spacer"></span>

          <!-- Theme color picker -->
          <div class="color-picker">
            @for (c of themeColors; track c.id) {
              <button class="color-dot"
                [style.background]="c.hex"
                [class.selected]="theme.color() === c.id"
                [matTooltip]="c.label"
                (click)="theme.setColor(c.id)">
              </button>
            }
          </div>

          <!-- Dark mode toggle -->
          <button mat-icon-button (click)="theme.toggleDark()"
            [matTooltip]="theme.isDark() ? 'Modo claro' : 'Modo escuro'">
            <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>
        </mat-toolbar>

        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .shell { height: 100vh; }

    .sidenav {
      width: var(--app-sidenav-width, 240px);
      border-right: none;
      background: var(--mat-sys-surface-container-low);

      .sidenav-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 16px;

        .brand-logo { width: 36px; height: 36px; border-radius: 10px; }
        .brand-name { font-size: 13px; font-weight: 600; line-height: 1.3; color: var(--mat-sys-on-surface); }
      }

      .active-link {
        background: var(--mat-sys-secondary-container) !important;
        color: var(--mat-sys-on-secondary-container) !important;
        border-radius: 50px;
        mat-icon { color: var(--mat-sys-on-secondary-container) !important; }
      }
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      height: var(--app-toolbar-height, 64px);
      gap: 8px;

      .toolbar-title {
        font-size: 18px;
        font-weight: 600;
        margin-left: 4px;
      }
      .spacer { flex: 1; }
    }

    .color-picker {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-right: 4px;

      .color-dot {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform .15s, border-color .15s;
        padding: 0;

        &:hover { transform: scale(1.2); }
        &.selected { border-color: white; transform: scale(1.15); box-shadow: 0 0 0 1px rgba(0,0,0,.3); }
      }
    }

    .page-content {
      padding: 28px 32px;
      max-width: 980px;
      margin: 0 auto;
      @media (max-width: 768px) { padding: 16px; }
    }
  `]
})
export class AppComponent {
  theme = inject(ThemeService);
  themeColors = THEME_COLORS;

  navItems = [
    { path: '/',        icon: 'home',             label: 'Início' },
    { path: '/cnpj',    icon: 'business',          label: 'Gerador de CNPJ' },
    { path: '/cpf',     icon: 'person',            label: 'Gerador de CPF' },
    { path: '/xml',     icon: 'code',              label: 'Formatador de XML' },
    { path: '/markdown',icon: 'article',           label: 'Markdown Viewer' },
    { path: '/text',    icon: 'text_fields',       label: 'Formatador de Texto' },
  ];
}
