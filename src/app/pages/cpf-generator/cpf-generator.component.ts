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

@Component({
  selector: 'app-cpf-generator',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule, MatDividerModule, MatTooltipModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Gerador de CPF</h1>
    <p class="page-subtitle">Gera CPFs válidos para uso em testes e ambientes de desenvolvimento.</p>

    <mat-card>
      <mat-card-content>
        <div class="field-group">
          <label class="field-label">Formato</label>
          <mat-button-toggle-group [ngModel]="withMask()" (ngModelChange)="withMask.set($event)">
            <mat-button-toggle [value]="true">Com pontuação</mat-button-toggle>
            <mat-button-toggle [value]="false">Sem pontuação</mat-button-toggle>
          </mat-button-toggle-group>
        </div>

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
            @for (cpf of results(); track cpf; let i = $index) {
              <div class="result-row">
                <span class="result-index">{{ i + 1 }}</span>
                <span class="result-value">{{ cpf }}</span>
                <button mat-icon-button (click)="copySingle(cpf, i)" matTooltip="Copiar">
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
          CPFs gerados com dígitos verificadores conforme algoritmo Módulo 11.
          <strong>Não use em produção.</strong>
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
    .field-label { font-size: 12px; font-weight: 500; color: var(--mat-sys-on-surface-variant); text-transform: uppercase; letter-spacing: .5px; }
    .generate-row { display: flex; align-items: flex-start; gap: 12px; }
    .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .results-label { font-size: 13px; font-weight: 600; color: var(--mat-sys-on-surface); }
  `]
})
export class CpfGeneratorComponent {
  withMask = signal(true);
  quantity = 5;
  results = signal<string[]>([]);
  copiedIndex = signal(-1);

  constructor(private snackBar: MatSnackBar) {}

  generate(): void {
    const list: string[] = [];
    for (let i = 0; i < Math.min(this.quantity, 50); i++) list.push(this.generateCpf());
    this.results.set(list);
    this.copiedIndex.set(-1);
  }

  private generateCpf(): string {
    const nums = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    nums.push(this.calcDigit(nums, 10));
    nums.push(this.calcDigit(nums, 11));
    const raw = nums.join('');
    return this.withMask()
      ? `${raw.slice(0,3)}.${raw.slice(3,6)}.${raw.slice(6,9)}-${raw.slice(9)}`
      : raw;
  }

  private calcDigit(nums: number[], factor: number): number {
    const rem = (nums.reduce((a, n, i) => a + n * (factor - i), 0) * 10) % 11;
    return rem >= 10 ? 0 : rem;
  }

  copySingle(value: string, index: number): void {
    navigator.clipboard.writeText(value);
    this.copiedIndex.set(index);
    this.snackBar.open('CPF copiado!', '', { duration: 2000 });
    setTimeout(() => this.copiedIndex.set(-1), 1500);
  }

  copyAll(): void {
    navigator.clipboard.writeText(this.results().join('\n'));
    this.snackBar.open(`${this.results().length} CPFs copiados!`, '', { duration: 2000 });
  }
}
