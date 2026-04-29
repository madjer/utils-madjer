import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cpf-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Gerador de CPF</h1>
      <p>Gera CPFs válidos para uso em testes e ambientes de desenvolvimento.</p>
    </div>

    <div class="card">
      <div class="options-row">
        <div class="form-group">
          <label>Formato</label>
          <div class="toggle-group">
            <button [class.active]="withMask()" (click)="withMask.set(true)">Com pontuação</button>
            <button [class.active]="!withMask()" (click)="withMask.set(false)">Sem pontuação</button>
          </div>
        </div>
      </div>

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
            @for (cpf of results(); track cpf; let i = $index) {
              <div class="result-row">
                <span class="result-index">{{ i + 1 }}</span>
                <span class="result-value">{{ cpf }}</span>
                <button class="btn btn-icon btn-secondary" (click)="copySingle(cpf, i)" title="Copiar">
                  <span class="material-icons-round">{{ copiedIndex() === i ? 'check' : 'content_copy' }}</span>
                </button>
              </div>
            }
          </div>

          @if (allCopied()) {
            <div class="copied-hint fade-in">Todos os CPFs copiados!</div>
          }
        </div>
      }
    </div>

    <div class="card info-card">
      <h3>Como funciona</h3>
      <p>Os CPFs são gerados com dígitos verificadores calculados conforme o algoritmo do Módulo 11, sendo válidos para uso em ambientes de teste. <strong>Não use em produção.</strong></p>
    </div>
  `,
  styles: [`
    .options-row { display: flex; flex-wrap: wrap; gap: 24px; }

    .quantity-row {
      display: flex;
      align-items: flex-end;
      gap: 12px;

      .qty-input { width: 90px; }
    }

    .results { margin-top: 20px; }

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
        color: #7c3aed;
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
export class CpfGeneratorComponent {
  withMask = signal(true);
  quantity = 5;
  results = signal<string[]>([]);
  copiedIndex = signal(-1);
  allCopied = signal(false);

  generate(): void {
    const list: string[] = [];
    for (let i = 0; i < Math.min(this.quantity, 50); i++) {
      list.push(this.generateCpf());
    }
    this.results.set(list);
    this.copiedIndex.set(-1);
    this.allCopied.set(false);
  }

  private generateCpf(): string {
    const nums = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    nums.push(this.calcDigit(nums, 10));
    nums.push(this.calcDigit(nums, 11));
    const raw = nums.join('');
    return this.withMask() ? `${raw.slice(0,3)}.${raw.slice(3,6)}.${raw.slice(6,9)}-${raw.slice(9)}` : raw;
  }

  private calcDigit(nums: number[], factor: number): number {
    const sum = nums.reduce((acc, n, i) => acc + n * (factor - i), 0);
    const rem = (sum * 10) % 11;
    return rem >= 10 ? 0 : rem;
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
