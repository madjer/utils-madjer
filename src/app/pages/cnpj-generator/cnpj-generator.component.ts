import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type CnpjMode = 'normal' | 'alfanumerico';

@Component({
  selector: 'app-cnpj-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Gerador de CNPJ</h1>
      <p>Gera CNPJs válidos para uso em testes e ambientes de desenvolvimento.</p>
    </div>

    <div class="card">
      <div class="options-row">
        <div class="form-group">
          <label>Tipo de CNPJ</label>
          <div class="toggle-group">
            <button [class.active]="mode() === 'normal'" (click)="mode.set('normal')">Normal</button>
            <button [class.active]="mode() === 'alfanumerico'" (click)="mode.set('alfanumerico')">Alfanumérico</button>
          </div>
        </div>

        <div class="form-group">
          <label>Formato</label>
          <div class="toggle-group">
            <button [class.active]="withMask()" (click)="withMask.set(true)">Com pontuação</button>
            <button [class.active]="!withMask()" (click)="withMask.set(false)">Sem pontuação</button>
          </div>
        </div>
      </div>

      @if (mode() === 'alfanumerico') {
        <div class="info-note fade-in">
          <span class="material-icons-round">info</span>
          CNPJ alfanumérico: os primeiros 8 caracteres podem conter letras e números (nova regra da Receita Federal — vigência a partir de 2026).
        </div>
      }

      <div class="divider"></div>

      <div class="quantity-row">
        <div class="form-group">
          <label>Quantidade</label>
          <input type="number" class="form-control qty-input" [(ngModel)]="quantity" min="1" max="50">
        </div>
        <button class="btn btn-primary" (click)="generate()">
          <span class="material-icons-round">refresh</span>
          Gerar
        </button>
      </div>

      @if (results().length > 0) {
        <div class="results fade-in">
          <div class="results-header">
            <span class="section-title">Resultados ({{ results().length }})</span>
            <button class="btn btn-secondary btn-sm" (click)="copyAll()">
              <span class="material-icons-round">content_copy</span>
              Copiar todos
            </button>
          </div>

          <div class="results-list">
            @for (cnpj of results(); track cnpj; let i = $index) {
              <div class="result-row">
                <span class="result-index">{{ i + 1 }}</span>
                <span class="result-value">{{ cnpj }}</span>
                <button class="btn btn-icon btn-secondary" (click)="copySingle(cnpj, i)" title="Copiar">
                  <span class="material-icons-round">{{ copiedIndex() === i ? 'check' : 'content_copy' }}</span>
                </button>
              </div>
            }
          </div>

          @if (allCopied()) {
            <div class="copied-hint">Todos os CNPJs copiados!</div>
          }
        </div>
      }
    </div>

    <div class="card info-card">
      <h3>Como funciona</h3>
      <p>Os CNPJs são gerados com dígitos verificadores calculados conforme o algoritmo oficial da Receita Federal, sendo válidos para uso em ambientes de teste. <strong>Não use em produção.</strong></p>
    </div>
  `,
  styles: [`
    .options-row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .info-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      font-size: 13px;
      color: #92400e;
      margin-top: 16px;

      .material-icons-round { font-size: 16px !important; flex-shrink: 0; margin-top: 1px; }
    }

    .quantity-row {
      display: flex;
      align-items: flex-end;
      gap: 12px;

      .qty-input {
        width: 90px;
      }
    }

    .results {
      margin-top: 20px;
    }

    .results-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .result-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: var(--surface-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: border-color .2s;

      &:hover { border-color: var(--primary); }

      .result-index {
        font-size: 12px;
        color: var(--text-muted);
        width: 20px;
        text-align: right;
        flex-shrink: 0;
      }

      .result-value {
        flex: 1;
        font-family: 'Courier New', monospace;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-dark);
        letter-spacing: .5px;
      }
    }

    .info-card {
      margin-top: 16px;
      background: var(--surface-2);

      h3 { font-size: 14px; margin-bottom: 6px; }
      p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    }
  `]
})
export class CnpjGeneratorComponent {
  mode = signal<CnpjMode>('normal');
  withMask = signal(true);
  quantity = 5;
  results = signal<string[]>([]);
  copiedIndex = signal(-1);
  allCopied = signal(false);

  generate(): void {
    const list: string[] = [];
    for (let i = 0; i < Math.min(this.quantity, 50); i++) {
      list.push(this.mode() === 'normal' ? this.generateNormal() : this.generateAlfanumerico());
    }
    this.results.set(list);
    this.copiedIndex.set(-1);
    this.allCopied.set(false);
  }

  private generateNormal(): string {
    const nums = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
    nums.push(this.calcDigit(nums, [5,4,3,2,9,8,7,6,5,4,3,2]));
    nums.push(this.calcDigit(nums, [6,5,4,3,2,9,8,7,6,5,4,3,2]));
    const raw = nums.join('');
    return this.withMask() ? this.maskNormal(raw) : raw;
  }

  private generateAlfanumerico(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const base = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]);
    const d1 = this.calcDigitAlfa(base, [5,4,3,2,9,8,7,6,5,4,3,2]);
    base.push(String(d1));
    const d2 = this.calcDigitAlfa(base, [6,5,4,3,2,9,8,7,6,5,4,3,2]);
    base.push(String(d2));
    const raw = base.join('');
    return this.withMask() ? this.maskNormal(raw) : raw;
  }

  private calcDigit(nums: number[], weights: number[]): number {
    const sum = nums.slice(0, weights.length).reduce((acc, n, i) => acc + n * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  }

  private calcDigitAlfa(chars: string[], weights: number[]): number {
    const sum = chars.slice(0, weights.length).reduce((acc, c, i) => {
      const v = isNaN(Number(c)) ? c.charCodeAt(0) - 55 : Number(c);
      return acc + v * weights[i];
    }, 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  }

  private maskNormal(raw: string): string {
    return `${raw.slice(0,2)}.${raw.slice(2,5)}.${raw.slice(5,8)}/${raw.slice(8,12)}-${raw.slice(12,14)}`;
  }

  copySingle(value: string, index: number): void {
    navigator.clipboard.writeText(value);
    this.copiedIndex.set(index);
    setTimeout(() => this.copiedIndex.set(-1), 1500);
  }

  copyAll(): void {
    navigator.clipboard.writeText(this.results().join('\n'));
    this.allCopied.set(true);
    setTimeout(() => this.allCopied.set(false), 2000);
  }
}
