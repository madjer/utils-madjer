import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.open]="open">
      <div class="sidebar-brand">
        <span class="brand-icon">⚡</span>
        <div class="brand-text">
          <span class="brand-name">Utilitários</span>
          <span class="brand-sub">Madjer</span>
        </div>
        <button class="close-btn" (click)="close.emit()" title="Fechar menu">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <nav class="nav-list">
        <span class="nav-section-label">Ferramentas</span>
        @for (item of navItems; track item.path) {
          <a class="nav-item" [routerLink]="item.path" routerLinkActive="active"
             [routerLinkActiveOptions]="{exact: item.path === ''}"
             (click)="close.emit()">
            <span class="nav-icon material-icons-round">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <span class="footer-text">v1.0 · Madjer Sistemas</span>
      </div>
    </aside>
    @if (open) {
      <div class="sidebar-overlay" (click)="close.emit()"></div>
    }
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: transform .3s cubic-bezier(.4,0,.2,1);
      box-shadow: var(--shadow-md);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);

      .brand-icon {
        font-size: 26px;
        line-height: 1;
      }

      .brand-text {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .brand-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .brand-sub {
          font-size: 12px;
          color: var(--primary);
          font-weight: 600;
          letter-spacing: .5px;
        }
      }

      .close-btn {
        margin-left: auto;
        background: none;
        border: none;
        color: var(--text-muted);
        width: 30px;
        height: 30px;
        border-radius: 6px;
        display: none;
        align-items: center;
        justify-content: center;
        &:hover { background: var(--surface-3); color: var(--text-primary); }

        @media (max-width: 768px) { display: flex; }
      }
    }

    .nav-list {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .nav-section-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: .8px;
      padding: 4px 8px 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      transition: all .2s;

      .nav-icon { font-size: 18px; opacity: .7; }

      &:hover {
        background: var(--surface-3);
        color: var(--text-primary);
        .nav-icon { opacity: 1; }
      }

      &.active {
        background: var(--primary-light);
        color: var(--primary-dark);
        font-weight: 600;
        .nav-icon { opacity: 1; }
      }
    }

    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid var(--border);

      .footer-text {
        font-size: 11px;
        color: var(--text-muted);
      }
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.35);
      z-index: 99;

      @media (max-width: 768px) { display: block; }
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        &.open { transform: translateX(0); }
      }
    }
  `]
})
export class SidebarComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  navItems: NavItem[] = [
    { path: '', label: 'Início', icon: 'home', description: 'Página inicial' },
    { path: 'cnpj', label: 'Gerador de CNPJ', icon: 'business', description: 'Gera CNPJs para testes' },
    { path: 'cpf', label: 'Gerador de CPF', icon: 'person', description: 'Gera CPFs para testes' },
    { path: 'xml', label: 'Formatador de XML', icon: 'code', description: 'Formata e escapa XML' },
    { path: 'markdown', label: 'Markdown Viewer', icon: 'article', description: 'Visualiza Markdown formatado' },
    { path: 'text', label: 'Formatador de Texto', icon: 'text_fields', description: 'Transforma e formata textos' },
  ];
}
