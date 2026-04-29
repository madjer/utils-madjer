import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  PoPageModule, PoContainerModule, PoTagModule, PoButtonModule
} from '@po-ui/ng-components';

interface Tool {
  path: string;
  icon: string;
  label: string;
  description: string;
  tags: string[];
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PoPageModule, PoContainerModule, PoTagModule, PoButtonModule],
  template: `
    <po-page-default p-title="Utilitários Madjer">
      <p class="page-subtitle">Ferramentas práticas para desenvolvedores — sem login, direto ao ponto.</p>

      <div class="tools-grid">
        @for (tool of tools; track tool.path) {
          <div class="tool-card" (click)="navigate(tool.path)">
            <div class="tool-card-accent" [style.background]="tool.color"></div>
            <div class="tool-card-body">
              <div class="tool-card-title">
                <span class="ph-icon" [class]="tool.icon"></span>
                {{ tool.label }}
              </div>
              <p class="tool-card-desc">{{ tool.description }}</p>
              <div class="tool-tags">
                @for (tag of tool.tags; track tag) {
                  <po-tag p-value="{{ tag }}" p-color="color-01"></po-tag>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <po-container [p-no-border]="false">
        <div class="info-banner">
          <span class="ph ph-shield-check info-icon"></span>
          <p>Todas as operações são realizadas localmente no seu navegador. Nenhum dado é enviado para servidores externos.</p>
        </div>
      </po-container>
    </po-page-default>
  `,
  styles: [`
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .tool-card {
      background: var(--color-neutral-light-00);
      border: 1px solid var(--color-neutral-light-20);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all .2s ease;

      &:hover {
        border-color: var(--color-brand-01-base);
        box-shadow: 0 4px 16px rgba(0,0,0,.1);
        transform: translateY(-2px);
      }
    }

    .tool-card-accent {
      height: 5px;
    }

    .tool-card-body {
      padding: 18px;
    }

    .tool-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: var(--color-neutral-dark-90);
      margin-bottom: 8px;

      .ph-icon {
        font-size: 18px;
        color: var(--color-brand-01-base);
      }
    }

    .tool-card-desc {
      font-size: 13px;
      color: var(--color-neutral-mid-60);
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .tool-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 4px 0;

      .info-icon {
        font-size: 18px;
        color: var(--color-brand-01-base);
        flex-shrink: 0;
        margin-top: 2px;
      }

      p {
        font-size: 13px;
        color: var(--color-neutral-mid-60);
        line-height: 1.5;
      }
    }
  `]
})
export class HomeComponent {
  constructor(private router: Router) {}

  tools: Tool[] = [
    {
      path: 'cnpj',
      icon: 'ph ph-buildings',
      label: 'Gerador de CNPJ',
      description: 'Gera CNPJs válidos para testes, no formato tradicional ou alfanumérico, com ou sem pontuação.',
      tags: ['Normal', 'Alfanumérico', 'Com/Sem máscara'],
      color: '#6366f1'
    },
    {
      path: 'cpf',
      icon: 'ph ph-user',
      label: 'Gerador de CPF',
      description: 'Gera CPFs válidos para testes com cálculo correto dos dígitos verificadores.',
      tags: ['Com/Sem máscara'],
      color: '#8b5cf6'
    },
    {
      path: 'xml',
      icon: 'ph ph-code',
      label: 'Formatador de XML',
      description: 'Cole um XML e visualize formatado com indentação. Opção para escapar o XML como string JSON.',
      tags: ['Formatar', 'Escapar', 'JSON string'],
      color: '#10b981'
    },
    {
      path: 'markdown',
      icon: 'ph ph-article',
      label: 'Markdown Viewer',
      description: 'Cole texto em Markdown e visualize o resultado formatado em tempo real.',
      tags: ['Preview', 'Tempo real'],
      color: '#f59e0b'
    },
    {
      path: 'text',
      icon: 'ph ph-text-t',
      label: 'Formatador de Texto',
      description: 'Aplique transformações ao texto: maiúsculas, remover acentos, quebras de linha, ordenar linhas e mais.',
      tags: ['Upper/Lower', 'Trim', 'Acentos', 'Linhas'],
      color: '#ec4899'
    }
  ];

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
