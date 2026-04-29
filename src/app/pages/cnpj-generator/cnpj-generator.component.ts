import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

type CnpjMode = 'normal' | 'alfanumerico';

@Component({
  selector: 'app-cnpj-generator',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule, MatDividerModule, MatTooltipModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Gerador de CNPJ</h1>
    <p class="page-subtitle">Gera CNPJs válidos para uso em testes e ambientes de desenvolvimento.</p>

    <mat-card>
      <mat-card-content>
        <div class="options-row">
          <div class="field-group">
            <label class="field-label">Tipo</label>
            <mat-button-toggle-group [ngModel]="mode()" (ngModelChange)="mode.set($event)">
              <mat-button-toggle value="normal">Normal</mat-button-toggle>
              <mat-button-toggle value="alfanumerico">Alfanumérico</mat-button-toggle>
            </mat-button-toggle-group>
          </div>
          <div class="field-group">
            <label class="field-label">Formato</label>
            <mat-button-toggle-group [ngModel]="withMask()" (ngModelChange)="withMask.set($event)">
              <mat-button-toggle [value]="true">Com pontuação</mat-button-toggle>
              <mat-button-toggle [value]="false">Sem pontuação</mat-button-toggle>
            </mat-button-toggle-group>
          </div>
        </div>

        @if (mode() === 'alfanumerico') {
          <div class="info-note">
            <mat-icon>info</mat-icon>
            <span>CNPJ alfanumérico: primeiros 8 caracteres podem conter letras e números (nova regra da Receita Federal — vigência 2026).</span>
          </div>
        }

        <mat-divider style="margin: 20px 0"></mat-divider>

        <div class="generate-row">
          <mat-form-field appearance="outline" style="width:120px">
            <mat-label>Quantidade</mat-label>
            <input matInput type="number" [(ngModel)]="quantity" min="1" max="50">
          </mat-form-field>
          <button mat-flat-button (click)="generate()">
            <mat-icon>refresh</mat-icon> Gerar
          </button>
        </div>

        @if (results().length > 0) {
          <mat-divider style="margin: 20px 0"></mat-divider>
          <div class="results-header">
            <span class="results-label">Resultados ({{ results().length }})</span>
            <button mat-stroked-button (click)="copyAll()">
              <mat-icon>content_copy</mat-icon> Copiar todos
            </button>
          </div>
          <div class="result-list">
            @for (cnpj of results(); track cnpj; let i = $index) {
              <div class="result-row">
                <span class="result-index">{{ i + 1 }}</span>
                <span class="result-value">{{ cnpj }}</span>
                <button mat-icon-button (click)="copySingle(cnpj, i)" [matTooltip]="'Copiar'">
                  <mat-icon>{{ copiedIndex() === i ? 'check' : 'content_copy' }}</mat-icon>
                </button>
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>

    <mat-card style="margin-top:16px" appearance="outlined">
      <mat-card-content>
        <p style="font-size:13px;color:var(--mat-sys-on-surface-variant);margin:0">
          CNPJs gerados com dígitos verificadores conforme algoritmo oficial da Receita Federal.
          <strong>Não use em produção.</strong>
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .options-row { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 4px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 12px; font-weight: 500; color: var(--mat-sys-on-surface-variant); text-transform: uppercase; letter-spacing: .5px; }
    .generate-row { display: flex; align-items: flex-start; gap: 12px; }
    .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .results-label { font-size: 13px; font-weight: 600; color: var(--mat-sys-on-surface); }
  `]
})
export class CnpjGeneratorComponent {
  mode = signal<CnpjMode>('normal');
  withMask = signal(true);
  quantity = 5;
  results = signal<string[]>([]);
  copiedIndex = signal(-1);

  constructor(private snackBar: MatSnackBar) {}

  generate(): void {
    const list: string[] = [];
    for (let i = 0; i < Math.min(this.quantity, 50); i++)
      list.push(this.mode() === 'normal' ? this.generateNormal() : this.generateAlfanumerico());
    this.results.set(list);
    this.copiedIndex.set(-1);
  }

  private generateNormal(): string {
    const nums = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
    nums.push(this.calcDigit(nums, [5,4,3,2,9,8,7,6,5,4,3,2]));
    nums.push(this.calcDigit(nums, [6,5,4,3,2,9,8,7,6,5,4,3,2]));
    const raw = nums.join('');
    return this.withMask() ? this.applyMask(raw) : raw;
  }

  private generateAlfanumerico(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const base = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]);
    base.push(String(this.calcDigitAlfa(base, [5,4,3,2,9,8,7,6,5,4,3,2])));
    base.push(String(this.calcDigitAlfa(base, [6,5,4,3,2,9,8,7,6,5,4,3,2])));
    const raw = base.join('');
    return this.withMask() ? this.applyMask(raw) : raw;
  }

  private calcDigit(nums: number[], w: number[]): number {
    const rem = nums.slice(0, w.length).reduce((a, n, i) => a + n * w[i], 0) % 11;
    return rem < 2 ? 0 : 11 - rem;
  }

  private calcDigitAlfa(chars: string[], w: number[]): number {
    const rem = chars.slice(0, w.length).reduce((a, c, i) => {
      return a + (isNaN(Number(c)) ? c.charCodeAt(0) - 55 : Number(c)) * w[i];
    }, 0) % 11;
    return rem < 2 ? 0 : 11 - rem;
  }

  private applyMask(raw: string): string {
    return `${raw.slice(0,2)}.${raw.slice(2,5)}.${raw.slice(5,8)}/${raw.slice(8,12)}-${raw.slice(12,14)}`;
  }

  copySingle(value: string, index: number): void {
    navigator.clipboard.writeText(value);
    this.copiedIndex.set(index);
    this.snackBar.open('CNPJ copiado!', '', { duration: 2000 });
    setTimeout(() => this.copiedIndex.set(-1), 1500);
  }

  copyAll(): void {
    navigator.clipboard.writeText(this.results().join('\n'));
    this.snackBar.open(`${this.results().length} CNPJs copiados!`, '', { duration: 2000 });
  }
}
