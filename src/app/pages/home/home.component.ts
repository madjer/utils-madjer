import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <div class="hero">
        <div class="hero-icon">⚡</div>
        <h1>Utilitários Madjer</h1>
        <p>Ferramentas práticas para desenvolvedores — sem login, direto ao ponto.</p>
      </div>
    </div>

    <div class="tools-grid">
      @for (tool of tools; track tool.path) {
        <a class="tool-card" [routerLink]="tool.path">
          <div class="tool-card-header" [style.--card-color]="tool.color">
            <span class="tool-icon material-icons-round">{{ tool.icon }}</span>
          </div>
          <div class="tool-card-body">
            <h3>{{ tool.label }}</h3>
            <p>{{ tool.description }}</p>
            <div class="tool-tags">
              @for (tag of tool.tags; track tag) {
                <span class="tag tag-primary">{{ tag }}</span>
              }
            </div>
          </div>
          <div class="tool-card-arrow">
            <span class="material-icons-round">arrow_forward</span>
          </div>
        </a>
      }
    </div>

    <div class="info-banner">
      <span class="material-icons-round">info</span>
      <p>Todas as operações são realizadas localmente no seu navegador. Nenhum dado é enviado para servidores externos.</p>
    </div>
  `,
  styles: [`
    .hero {
      text-align: center;
      padding: 20px 0 36px;

      .hero-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }

      h1 {
        font-size: 30px;
        color: var(--text-primary);
        margin-bottom: 10px;
      }

      p {
        color: var(--text-secondary);
        font-size: 16px;
        max-width: 480px;
        margin: 0 auto;
      }
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .tool-card {
      display: flex;
      flex-direction: column;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      text-decoration: none;
      overflow: hidden;
      transition: all .25s ease;
      position: relative;

      &:hover {
        border-color: var(--primary);
        box-shadow: var(--shadow-md);
        transform: translateY(-3px);

        .tool-card-arrow {
          opacity: 1;
          transform: translateX(0);
        }
      }
    }

    .tool-card-header {
      height: 6px;
      background: var(--card-color, var(--primary));
    }

    .tool-card-body {
      padding: 20px;
      flex: 1;

      h3 {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      p {
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: 12px;
      }

      .tool-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }

    .tool-icon {
      position: absolute;
      top: 18px;
      right: 18px;
      font-size: 22px !important;
      color: var(--text-muted);
      opacity: .5;
    }

    .tool-card-arrow {
      position: absolute;
      bottom: 20px;
      right: 18px;
      color: var(--primary);
      opacity: 0;
      transform: translateX(-6px);
      transition: all .2s;

      .material-icons-round { font-size: 18px !important; }
    }

    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: var(--primary-light);
      border: 1px solid #c7d2fe;
      border-radius: var(--radius-sm);
      padding: 14px 18px;
      color: var(--primary-dark);

      .material-icons-round { font-size: 18px !important; margin-top: 1px; flex-shrink: 0; }

      p { font-size: 13px; line-height: 1.5; }
    }
  `]
})
export class HomeComponent {
  tools: Tool[] = [
    {
      path: 'cnpj',
      icon: 'business',
      label: 'Gerador de CNPJ',
      description: 'Gera CNPJs válidos para testes, no formato tradicional ou alfanumérico, com ou sem pontuação.',
      tags: ['Normal', 'Alfanumérico', 'Com/Sem máscara'],
      color: '#6366f1'
    },
    {
      path: 'cpf',
      icon: 'person',
      label: 'Gerador de CPF',
      description: 'Gera CPFs válidos para testes com cálculo correto dos dígitos verificadores.',
      tags: ['Com/Sem máscara'],
      color: '#8b5cf6'
    },
    {
      path: 'xml',
      icon: 'code',
      label: 'Formatador de XML',
      description: 'Cole um XML e visualize formatado com indentação. Opção para escapar o XML como string JSON.',
      tags: ['Formatar', 'Escapar', 'JSON string'],
      color: '#10b981'
    },
    {
      path: 'markdown',
      icon: 'article',
      label: 'Markdown Viewer',
      description: 'Cole texto em Markdown e visualize o resultado formatado em tempo real.',
      tags: ['Preview', 'Tempo real'],
      color: '#f59e0b'
    },
    {
      path: 'text',
      icon: 'text_fields',
      label: 'Formatador de Texto',
      description: 'Aplique transformações ao texto: maiúsculas, remover acentos, quebras de linha, ordenar linhas e mais.',
      tags: ['Upper/Lower', 'Trim', 'Acentos', 'Linhas'],
      color: '#ec4899'
    }
  ];
}
