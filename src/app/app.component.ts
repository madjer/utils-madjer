import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="app-shell">
      <app-sidebar [open]="sidebarOpen()" (close)="sidebarOpen.set(false)" />

      <div class="main-area" [class.sidebar-open]="sidebarOpen()">
        <header class="top-bar">
          <button class="hamburger btn btn-icon" (click)="sidebarOpen.set(!sidebarOpen())" title="Menu">
            <span class="material-icons-round">menu</span>
          </button>
          <span class="top-bar-title">Utilitários Madjer</span>
        </header>

        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
    }

    .main-area {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: margin .3s cubic-bezier(.4,0,.2,1);

      @media (max-width: 768px) {
        margin-left: 0;
      }
    }

    .top-bar {
      position: sticky;
      top: 0;
      z-index: 50;
      height: var(--header-height);
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,.05);

      .hamburger {
        display: none;
        background: none;
        border: none;
        color: var(--text-secondary);
        &:hover { background: var(--surface-3); color: var(--text-primary); }

        @media (max-width: 768px) { display: flex; }
      }

      .top-bar-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--primary);
        letter-spacing: -.2px;
      }
    }

    .page-content {
      flex: 1;
      padding: 32px;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;

      @media (max-width: 768px) {
        padding: 20px 16px;
      }
    }
  `]
})
export class AppComponent {
  sidebarOpen = signal(false);
}
