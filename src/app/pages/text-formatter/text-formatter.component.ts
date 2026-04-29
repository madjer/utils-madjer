import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transformation {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  group: string;
  exclusive?: string[];
}

@Component({
  selector: 'app-text-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Formatador de Texto</h1>
      <p>Cole um texto, selecione as transformações desejadas e veja o resultado em tempo real.</p>
    </div>

    <div class="formatter-layout">
      <div class="side-panel">
        <div class="card options-card">
          <span class="section-title">Transformações</span>

          @for (group of groups; track group) {
            <div class="option-group">
              <span class="group-label">{{ group }}</span>
              @for (def of defsByGroup(group); track def.id) {
                <label class="option-item" [class.disabled]="isDisabled(def)" (click)="!isDisabled(def) && toggle(def)">
                  <input
                    type="checkbox"
                    [checked]="isEnabled(def.id)"
                    [disabled]="isDisabled(def)"
                    (click)="$event.stopPropagation()"
                    (change)="toggle(def)"
                  >
                  <div class="option-text">
                    <span class="option-label">{{ def.label }}</span>
                    <span class="option-desc">{{ def.description }}</span>
                  </div>
                </label>
              }
            </div>
          }

          <div class="divider"></div>
          <button class="btn btn-secondary btn-sm" style="width:100%" (click)="resetAll()">
            <span class="material-icons-round">restart_alt</span>
            Limpar seleções
          </button>
        </div>
      </div>

      <div class="main-panel">
        <div class="card input-card">
          <div class="panel-header">
            <span class="section-title">Texto de entrada</span>
            <div class="panel-actions">
              <span class="char-badge">{{ inputText().length }} chars</span>
              <button class="btn btn-secondary btn-sm" (click)="clear()" [disabled]="!inputText()">
                <span class="material-icons-round">clear</span>
                Limpar
              </button>
            </div>
          </div>
          <textarea
            class="form-control text-area"
            [ngModel]="inputText()"
            (ngModelChange)="inputText.set($event)"
            placeholder="Cole seu texto aqui..."
            spellcheck="false"
          ></textarea>
        </div>

        @if (activeCount() > 0) {
          <div class="active-chips fade-in">
            @for (def of activeTransformations(); track def.id) {
              <span class="chip">
                <span class="material-icons-round">check</span>
                {{ def.label }}
                <button (click)="toggle(def)">
                  <span class="material-icons-round">close</span>
                </button>
              </span>
            }
          </div>
        }

        <div class="card output-card">
          <div class="panel-header">
            <span class="section-title">Resultado</span>
            <div class="panel-actions">
              <span class="char-badge">{{ outputText().length }} chars</span>
              @if (outputText()) {
                <button class="btn btn-secondary btn-sm" (click)="copyOutput()">
                  <span class="material-icons-round">{{ copied() ? 'check' : 'content_copy' }}</span>
                  {{ copied() ? 'Copiado!' : 'Copiar' }}
                </button>
              }
            </div>
          </div>

          @if (outputText()) {
            <pre class="output-pre fade-in">{{ outputText() }}</pre>
          } @else if (inputText()) {
            <div class="empty-state">
              <span class="material-icons-round">tune</span>
              <p>Selecione ao menos uma transformação</p>
            </div>
          } @else {
            <div class="empty-state">
              <span class="material-icons-round">text_fields</span>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .formatter-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 16px;
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .options-card {
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: sticky;
      top: calc(var(--header-height) + 16px);
    }

    .option-group {
      margin-top: 12px;
    }

    .group-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: .8px;
      margin-bottom: 6px;
      padding: 0 4px;
    }

    .option-item {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background .15s;

      &:hover:not(.disabled) { background: var(--surface-3); }

      &.disabled {
        opacity: .4;
        cursor: not-allowed;
      }

      input[type="checkbox"] {
        margin-top: 2px;
        width: 15px;
        height: 15px;
        accent-color: var(--primary);
        flex-shrink: 0;
        cursor: pointer;
      }

      .option-text {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      .option-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        line-height: 1.3;
      }

      .option-desc {
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.3;
      }
    }

    .main-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      gap: 8px;
    }

    .panel-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .char-badge {
      font-size: 11px;
      color: var(--text-muted);
      background: var(--surface-3);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2px 8px;
    }

    .text-area {
      min-height: 200px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
    }

    .active-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--primary-light);
      color: var(--primary-dark);
      border: 1px solid #c7d2fe;
      border-radius: 20px;
      padding: 3px 8px 3px 6px;
      font-size: 12px;
      font-weight: 500;

      .material-icons-round { font-size: 13px !important; }

      button {
        background: none;
        border: none;
        color: var(--primary-dark);
        opacity: .6;
        padding: 0;
        display: flex;
        align-items: center;
        cursor: pointer;
        &:hover { opacity: 1; }
        .material-icons-round { font-size: 13px !important; }
      }
    }

    .output-card {
      min-height: 160px;
      display: flex;
      flex-direction: column;
    }

    .output-pre {
      flex: 1;
      background: var(--surface-3);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      color: var(--text-primary);
      max-height: 360px;
      overflow-y: auto;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px;
      color: var(--text-muted);

      .material-icons-round { font-size: 36px !important; opacity: .3; }
      p { font-size: 13px; }
    }
  `]
})
export class TextFormatterComponent {
  inputText = signal('');
  copied = signal(false);

  // Signal com o Set de IDs ativos — única fonte de verdade reativa
  enabledIds = signal<Set<string>>(new Set());

  readonly DEFS: Omit<Transformation, 'enabled'>[] = [
    { id: 'upper',              label: 'UPPER CASE',                description: 'Tudo em maiúsculas',                  group: 'Capitalização',    exclusive: ['lower', 'capitalize', 'sentence'] },
    { id: 'lower',              label: 'lower case',                description: 'Tudo em minúsculas',                  group: 'Capitalização',    exclusive: ['upper', 'capitalize', 'sentence'] },
    { id: 'capitalize',         label: 'Capitalize Words',          description: 'Primeira letra de cada palavra',      group: 'Capitalização',    exclusive: ['upper', 'lower', 'sentence'] },
    { id: 'sentence',           label: 'Sentence case',             description: 'Primeira letra de cada frase',        group: 'Capitalização',    exclusive: ['upper', 'lower', 'capitalize'] },
    { id: 'trim',               label: 'Remover espaços nas bordas',description: 'Trim em cada linha',                  group: 'Espaços e linhas' },
    { id: 'remove_extra_spaces',label: 'Remover espaços duplos',    description: 'Normaliza múltiplos espaços em um',   group: 'Espaços e linhas' },
    { id: 'remove_newlines',    label: 'Remover quebras de linha',  description: 'Une todo o texto em uma linha',       group: 'Espaços e linhas' },
    { id: 'remove_empty_lines', label: 'Remover linhas vazias',     description: 'Elimina linhas em branco',            group: 'Espaços e linhas' },
    { id: 'sort_lines',         label: 'Ordenar linhas (A → Z)',    description: 'Ordena linhas alfabeticamente',       group: 'Espaços e linhas' },
    { id: 'dedupe_lines',       label: 'Remover linhas duplicadas', description: 'Mantém apenas linhas únicas',         group: 'Espaços e linhas' },
    { id: 'remove_accents',     label: 'Remover acentos',           description: 'ã→a, é→e, ç→c, etc.',               group: 'Caracteres' },
    { id: 'remove_special',     label: 'Remover caracteres especiais', description: 'Mantém letras, números e espaços', group: 'Caracteres' },
    { id: 'remove_numbers',     label: 'Remover números',           description: 'Remove dígitos 0–9',                 group: 'Caracteres' },
    { id: 'remove_punctuation', label: 'Remover pontuação',         description: "Remove . , ; : ! ? \" ' ( )",       group: 'Caracteres' },
  ];

  groups = [...new Set(this.DEFS.map(t => t.group))];

  defsByGroup(group: string) {
    return this.DEFS.filter(t => t.group === group);
  }

  isEnabled(id: string) { return this.enabledIds().has(id); }

  isDisabled(def: Omit<Transformation, 'enabled'>): boolean {
    if (!def.exclusive?.length) return false;
    return def.exclusive.some(id => this.enabledIds().has(id));
  }

  toggle(def: Omit<Transformation, 'enabled'>): void {
    const next = new Set(this.enabledIds());
    if (next.has(def.id)) {
      next.delete(def.id);
    } else {
      def.exclusive?.forEach(id => next.delete(id));
      next.add(def.id);
    }
    this.enabledIds.set(next);
  }

  activeCount = computed(() => this.enabledIds().size);

  activeTransformations = computed(() =>
    this.DEFS.filter(d => this.enabledIds().has(d.id))
  );

  outputText = computed(() => {
    const input = this.inputText();
    if (!input || this.activeCount() === 0) return '';
    return this.applyTransformations(input);
  });

  private applyTransformations(text: string): string {
    let result = text;
    const active = this.enabledIds();

    if (active.has('trim')) {
      result = result.split('\n').map(l => l.trim()).join('\n');
    }
    if (active.has('remove_extra_spaces')) {
      result = result.replace(/ {2,}/g, ' ');
    }
    if (active.has('remove_empty_lines')) {
      result = result.split('\n').filter(l => l.trim() !== '').join('\n');
    }
    if (active.has('remove_newlines')) {
      result = result.replace(/\r?\n/g, ' ').replace(/ {2,}/g, ' ').trim();
    }
    if (active.has('sort_lines')) {
      result = result.split('\n').sort((a, b) => a.localeCompare(b, 'pt')).join('\n');
    }
    if (active.has('dedupe_lines')) {
      result = [...new Set(result.split('\n'))].join('\n');
    }
    if (active.has('remove_accents')) {
      result = result.normalize('NFD').replace(/[̀-ͯ]/g, '');
    }
    if (active.has('remove_punctuation')) {
      result = result.replace(/[.,;:!?"'()\[\]{}\-–—]/g, '');
    }
    if (active.has('remove_special')) {
      result = result.replace(/[^a-zA-ZÀ-ÿ0-9 \n\r\t]/g, '');
    }
    if (active.has('remove_numbers')) {
      result = result.replace(/[0-9]/g, '');
    }
    if (active.has('upper')) {
      result = result.toLocaleUpperCase('pt-BR');
    } else if (active.has('lower')) {
      result = result.toLocaleLowerCase('pt-BR');
    } else if (active.has('capitalize')) {
      result = result.replace(/\b\w/g, c => c.toLocaleUpperCase('pt-BR'));
    } else if (active.has('sentence')) {
      result = result.replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toLocaleUpperCase('pt-BR'));
    }

    return result;
  }

  copyOutput(): void {
    const text = this.outputText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  clear(): void {
    this.inputText.set('');
  }

  resetAll(): void {
    this.enabledIds.set(new Set());
  }
}
