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
interface ToolGroup { label: string; tools: Tool[]; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule],
  template: `
    <div class="hero">
      <h1>Ferramentas para desenvolvedores</h1>
      <p>Sem login, direto ao ponto.</p>
    </div>

    @for (group of toolGroups; track group.label) {
      <div class="group-label">{{ group.label }}</div>
      <div class="tools-grid">
        @for (tool of group.tools; track tool.path) {
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
    }

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

    .group-label {
      font-size: 11px; font-weight: 700; letter-spacing: .8px;
      text-transform: uppercase; color: var(--mat-sys-on-surface-variant);
      margin: 28px 0 10px; opacity: .7;
      &:first-of-type { margin-top: 0; }
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
  toolGroups: ToolGroup[] = [
    {
      label: 'Geradores',
      tools: [
        { path: 'cnpj',      icon: 'business',    label: 'Gerador de CNPJ',
          description: 'Gera CNPJs válidos no formato tradicional ou alfanumérico, com ou sem pontuação.',
          tags: ['Normal', 'Alfanumérico', 'Com/Sem máscara'], color: '#7c3aed' },
        { path: 'cpf',       icon: 'person',      label: 'Gerador de CPF',
          description: 'Gera CPFs válidos com cálculo correto dos dígitos verificadores.',
          tags: ['Com/Sem máscara'], color: '#4f46e5' },
        { path: 'uuid',      icon: 'fingerprint', label: 'Gerador de UUID',
          description: 'Gera UUIDs v4 aleatórios. Opções de formato: maiúsculas, minúsculas, com ou sem hífens.',
          tags: ['UUID v4', 'Maiúsculas', 'Sem hífens'], color: '#0891b2' },
        { path: 'password',  icon: 'lock',        label: 'Gerador de Senhas',
          description: 'Gera senhas seguras configurando comprimento, letras, números e símbolos.',
          tags: ['Configurável', 'Múltiplas'], color: '#0284c7' },
        { path: 'fake-data', icon: 'badge',       label: 'Dados Fictícios',
          description: 'Gera dados brasileiros falsos para testes: nome, CPF, e-mail, telefone, endereço.',
          tags: ['CPF', 'Nome', 'E-mail', 'Endereço'], color: '#059669' },
        { path: 'cep',       icon: 'location_on', label: 'Consulta de CEP',
          description: 'Busca endereço completo a partir do CEP usando a API ViaCEP.',
          tags: ['ViaCEP', 'Endereço', 'IBGE'], color: '#ea580c' },
      ]
    },
    {
      label: 'Formatadores',
      tools: [
        { path: 'json-formatter', icon: 'data_object', label: 'Formatador de JSON',
          description: 'Valida, formata com indentação ou minifica JSON. Destaca erros de sintaxe.',
          tags: ['Formatar', 'Minificar', 'Validar'], color: '#f59e0b' },
        { path: 'xml',            icon: 'code',         label: 'Formatador de XML',
          description: 'Formata XML com indentação e opção de escapar como string JSON.',
          tags: ['Formatar', 'Escapar JSON'], color: '#0891b2' },
        { path: 'sql-formatter',  icon: 'storage',      label: 'Formatador de SQL',
          description: 'Embeleza queries SQL com suporte a MySQL, PostgreSQL, SQLite, T-SQL e PL/SQL.',
          tags: ['MySQL', 'PostgreSQL', 'T-SQL', 'PL/SQL'], color: '#6366f1' },
        { path: 'minifier',       icon: 'compress',     label: 'Minificador CSS/JS',
          description: 'Comprime CSS ou JavaScript removendo espaços e comentários. Exibe % de redução.',
          tags: ['CSS', 'JavaScript', '% redução'], color: '#7c3aed' },
        { path: 'markdown',       icon: 'article',      label: 'Markdown Viewer',
          description: 'Visualize Markdown formatado em tempo real com preview ao lado.',
          tags: ['Preview', 'Tempo real'], color: '#d97706' },
        { path: 'text',           icon: 'text_fields',  label: 'Formatador de Texto',
          description: 'Aplique transformações ao texto: maiúsculas, acentos, quebras de linha e mais.',
          tags: ['Upper/Lower', 'Trim', 'Acentos'], color: '#db2777' },
      ]
    },
    {
      label: 'Conversores',
      tools: [
        { path: 'json-xml', icon: 'sync_alt',    label: 'JSON ↔ XML',
          description: 'Converta dados entre os formatos JSON e XML nos dois sentidos.',
          tags: ['JSON→XML', 'XML→JSON'], color: '#0891b2' },
        { path: 'json-csv', icon: 'table_chart', label: 'JSON ↔ CSV',
          description: 'Converta arrays JSON para CSV e vice-versa. Suporte a vírgula, ponto-vírgula e tab.',
          tags: ['JSON→CSV', 'CSV→JSON', 'Separador'], color: '#059669' },
        { path: 'base64',   icon: 'translate',   label: 'Base64',
          description: 'Codifique ou decodifique texto e arquivos em Base64 diretamente no navegador.',
          tags: ['Encode', 'Decode', 'Arquivo'], color: '#7c3aed' },
        { path: 'units',    icon: 'straighten',  label: 'Conversor de Unidades',
          description: 'Converta entre unidades de comprimento, peso, temperatura, dados e tempo.',
          tags: ['Comprimento', 'Peso', 'Temperatura', 'Dados'], color: '#ea580c' },
      ]
    },
    {
      label: 'Codificação',
      tools: [
        { path: 'url-encode',    icon: 'link',  label: 'URL Encode / Decode',
          description: 'Codifique ou decodifique strings para uso seguro em URLs e query strings.',
          tags: ['encodeURIComponent', 'Decode'], color: '#0284c7' },
        { path: 'html-entities', icon: 'code',  label: 'HTML Entities',
          description: 'Converta caracteres especiais para entidades HTML e vice-versa.',
          tags: ['Encode', 'Decode', 'Referência'], color: '#d97706' },
        { path: 'hash',          icon: 'tag',   label: 'Hash (SHA)',
          description: 'Gere hashes criptográficos SHA-1, SHA-256, SHA-384 e SHA-512 via SubtleCrypto.',
          tags: ['SHA-256', 'SHA-512', 'SubtleCrypto'], color: '#6366f1' },
      ]
    },
    {
      label: 'Dev Tools',
      tools: [
        { path: 'validator', icon: 'verified',  label: 'Validador CPF / CNPJ',
          description: 'Valida CPF e CNPJ verificando os dígitos verificadores. Suporta validação em lote.',
          tags: ['CPF', 'CNPJ', 'Lote'], color: '#059669' },
        { path: 'jwt',       icon: 'key',       label: 'JWT Decoder',
          description: 'Decodifique tokens JWT exibindo header, payload e signature. Indica se está expirado.',
          tags: ['Header', 'Payload', 'Expiração'], color: '#7c3aed' },
        { path: 'curl',      icon: 'terminal',  label: 'cURL → Código',
          description: 'Converta comandos cURL em código JavaScript (fetch/Axios) ou Python requests.',
          tags: ['fetch', 'Axios', 'Python'], color: '#0891b2' },
      ]
    },
  ];
}
