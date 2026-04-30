import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-password-generator',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatCheckboxModule,
            MatFormFieldModule, MatInputModule, MatSliderModule,
            MatIconModule, MatDividerModule, MatTooltipModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Gerador de Senhas</h1>
    <p class="page-subtitle">Gera senhas seguras e aleatórias com opções configuráveis.</p>

    <mat-card>
      <mat-card-content>
        <div class="slider-row">
          <label class="field-label">Comprimento: <strong>{{ length() }}</strong></label>
          <mat-slider min="4" max="128" step="1" style="width:100%">
            <input matSliderThumb [ngModel]="length()" (ngModelChange)="length.set($event)">
          </mat-slider>
        </div>

        <mat-divider style="margin:16px 0"></mat-divider>

        <div class="checkbox-grid">
          <mat-checkbox [checked]="useUpper()" (change)="useUpper.set($event.checked)">A–Z Maiúsculas</mat-checkbox>
          <mat-checkbox [checked]="useLower()" (change)="useLower.set($event.checked)">a–z Minúsculas</mat-checkbox>
          <mat-checkbox [checked]="useNumbers()" (change)="useNumbers.set($event.checked)">0–9 Números</mat-checkbox>
          <mat-checkbox [checked]="useSymbols()" (change)="useSymbols.set($event.checked)">!&#64;#$ Símbolos</mat-checkbox>
        </div>

        <mat-divider style="margin:16px 0"></mat-divider>

        <div class="generate-row">
          <mat-form-field appearance="outline" style="width:120px">
            <mat-label>Quantidade</mat-label>
            <input matInput type="number" [(ngModel)]="quantity" min="1" max="50">
          </mat-form-field>
          <button mat-flat-button (click)="generate()" [disabled]="charset().length === 0">
            <mat-icon>refresh</mat-icon> Gerar
          </button>
        </div>

        @if (charset().length === 0) {
          <div class="info-note" style="margin-top:8px">
            <mat-icon>warning</mat-icon>
            <span>Selecione ao menos um tipo de caractere.</span>
          </div>
        }

        @if (results().length > 0) {
          <mat-divider style="margin:20px 0"></mat-divider>
          <div class="results-header">
            <span class="results-label">Resultados ({{ results().length }})</span>
            <button mat-stroked-button (click)="copyAll()">
              <mat-icon>content_copy</mat-icon> Copiar todos
            </button>
          </div>
          <div class="result-list">
            @for (pwd of results(); track pwd; let i = $index) {
              <div class="result-row">
                <span class="result-index">{{ i + 1 }}</span>
                <span class="result-value">{{ pwd }}</span>
                <button mat-icon-button (click)="copySingle(pwd, i)" matTooltip="Copiar">
                  <mat-icon>{{ copiedIndex() === i ? 'check' : 'content_copy' }}</mat-icon>
                </button>
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .slider-row { display: flex; flex-direction: column; gap: 4px; }
    .field-label { font-size: 12px; font-weight: 500; color: var(--mat-sys-on-surface-variant); text-transform: uppercase; letter-spacing: .5px; }
    .checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
    .generate-row { display: flex; align-items: flex-start; gap: 12px; }
    .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .results-label { font-size: 13px; font-weight: 600; }
  `]
})
export class PasswordGeneratorComponent {
  length = signal(16);
  useUpper = signal(true);
  useLower = signal(true);
  useNumbers = signal(true);
  useSymbols = signal(false);
  quantity = 5;
  results = signal<string[]>([]);
  copiedIndex = signal(-1);

  charset = computed(() => {
    let c = '';
    if (this.useUpper())   c += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (this.useLower())   c += 'abcdefghijklmnopqrstuvwxyz';
    if (this.useNumbers()) c += '0123456789';
    if (this.useSymbols()) c += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    return c;
  });

  constructor(private snackBar: MatSnackBar) {}

  generate(): void {
    const cs = this.charset();
    if (!cs) return;
    const list = Array.from({ length: Math.min(this.quantity, 50) }, () =>
      Array.from({ length: this.length() }, () => cs[Math.floor(Math.random() * cs.length)]).join('')
    );
    this.results.set(list);
    this.copiedIndex.set(-1);
  }

  copySingle(value: string, index: number): void {
    navigator.clipboard.writeText(value);
    this.copiedIndex.set(index);
    this.snackBar.open('Senha copiada!', '', { duration: 2000 });
    setTimeout(() => this.copiedIndex.set(-1), 1500);
  }

  copyAll(): void {
    navigator.clipboard.writeText(this.results().join('\n'));
    this.snackBar.open(`${this.results().length} senhas copiadas!`, '', { duration: 2000 });
  }
}
