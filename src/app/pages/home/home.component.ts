import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

interface Tool {
  path: string; icon: string; label: string;
  description: string; tags: string[]; color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule],
  template: `
    <div class="hero">
      <h1>Ferramentas para desenvolvedores</h1>
      <p>Sem login, direto ao ponto.</p>
    </div>

    <div class="tools-grid">
      @for (tool of tools; track tool.path) {
        <mat-card class="tool-card" [routerLink]="tool.path">
          <div class="card-accent" [style.background]="tool.color"></div>
          <mat-card-header>
            <mat-icon mat-card-avatar [style.color]="tool.color" [style.background]="tool.color + '22'">
              {{ tool.icon }}
            </mat-icon>
            <mat-card-title>{{ tool.label }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ tool.description }}</p>
            <mat-chip-set>
              @for (tag of tool.tags; track tag) {
                <mat-chip>{{ tag }}</mat-chip>
              }
            </mat-chip-set>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <div class="info-note" style="margin-top:16px">
      <mat-icon>shield</mat-icon>
      <span>Todas as operações são realizadas localmente no seu navegador. Nenhum dado é enviado para servidores externos.</span>
    </div>
  `,
  styles: [`
    .hero {
      text-align: center;
      padding: 16px 0 32px;
      h1 { font-size: 28px; font-weight: 700; color: var(--mat-sys-on-surface); margin-bottom: 8px; }
      p  { color: var(--mat-sys-on-surface-variant); font-size: 15px; }
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 8px;
    }

    .tool-card {
      cursor: pointer;
      overflow: hidden;
      transition: box-shadow .2s, transform .2s;
      position: relative;
      padding-top: 0;

      &:hover { transform: translateY(-3px); }

      .card-accent { height: 4px; margin: -16px -16px 16px; }

      mat-icon[mat-card-avatar] {
        width: 40px; height: 40px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 10px; font-size: 20px;
      }

      mat-card-content p {
        font-size: 13px;
        color: var(--mat-sys-on-surface-variant);
        line-height: 1.5;
        margin-bottom: 12px;
      }

      mat-chip { font-size: 11px !important; height: 22px !important; }
    }
  `]
})
export class HomeComponent {
  tools: Tool[] = [
    { path: 'cnpj',     icon: 'business',    label: 'Gerador de CNPJ',
      description: 'Gera CNPJs válidos no formato tradicional ou alfanumérico, com ou sem pontuação.',
      tags: ['Normal', 'Alfanumérico', 'Com/Sem máscara'], color: '#7c3aed' },
    { path: 'cpf',      icon: 'person',      label: 'Gerador de CPF',
      description: 'Gera CPFs válidos com cálculo correto dos dígitos verificadores.',
      tags: ['Com/Sem máscara'], color: '#4f46e5' },
    { path: 'xml',      icon: 'code',        label: 'Formatador de XML',
      description: 'Formata XML com indentação e opção de escapar como string JSON.',
      tags: ['Formatar', 'Escapar JSON'], color: '#0891b2' },
    { path: 'markdown', icon: 'article',     label: 'Markdown Viewer',
      description: 'Visualize Markdown formatado em tempo real com preview ao lado.',
      tags: ['Preview', 'Tempo real'], color: '#d97706' },
    { path: 'text',     icon: 'text_fields', label: 'Formatador de Texto',
      description: 'Aplique transformações ao texto: maiúsculas, acentos, quebras de linha e mais.',
      tags: ['Upper/Lower', 'Trim', 'Acentos'], color: '#db2777' },
  ];
}
