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
  selector: 'app-uuid-generator',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule, MatDividerModule, MatTooltipModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Gerador de UUID</h1>
    <p class="page-subtitle">Gera UUIDs v4 aleatórios para uso como identificadores únicos.</p>

    <mat-card>
      <mat-card-content>
        <div class="options-row">
          <div class="field-group">
            <label class="field-label">Formato</label>
            <mat-button-toggle-group [ngModel]="uppercase()" (ngModelChange)="uppercase.set($event)">
              <mat-button-toggle [value]="false">minúsculas</mat-button-toggle>
              <mat-button-toggle [value]="true">MAIÚSCULAS</mat-button-toggle>
            </mat-button-toggle-group>
          </div>
          <div class="field-group">
            <label class="field-label">Com hífens</label>
            <mat-button-toggle-group [ngModel]="hyphens()" (ngModelChange)="hyphens.set($event)">
              <mat-button-toggle [value]="true">Sim</mat-button-toggle>
              <mat-button-toggle [value]="false">Não</mat-button-toggle>
            </mat-button-toggle-group>
          </div>
        </div>

        <mat-divider style="margin:20px 0"></mat-divider>

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
          <mat-divider style="margin:20px 0"></mat-divider>
          <div class="results-header">
            <span class="results-label">Resultados ({{ results().length }})</span>
            <button mat-stroked-button (click)="copyAll()">
              <mat-icon>content_copy</mat-icon> Copiar todos
            </button>
          </div>
          <div class="result-list">
            @for (uuid of results(); track uuid; let i = $index) {
              <div class="result-row">
                <span class="result-index">{{ i + 1 }}</span>
                <span class="result-value">{{ uuid }}</span>
                <button mat-icon-button (click)="copySingle(uuid, i)" matTooltip="Copiar">
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
    .options-row { display: flex; flex-wrap: wrap; gap: 24px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 12px; font-weight: 500; color: var(--mat-sys-on-surface-variant); text-transform: uppercase; letter-spacing: .5px; }
    .generate-row { display: flex; align-items: flex-start; gap: 12px; }
    .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .results-label { font-size: 13px; font-weight: 600; }
  `]
})
export class UuidGeneratorComponent {
  uppercase = signal(false);
  hyphens = signal(true);
  quantity = 5;
  results = signal<string[]>([]);
  copiedIndex = signal(-1);

  constructor(private snackBar: MatSnackBar) {}

  generate(): void {
    const list = Array.from({ length: Math.min(this.quantity, 50) }, () => this.generateUuid());
    this.results.set(list);
    this.copiedIndex.set(-1);
  }

  private generateUuid(): string {
    const uuid = crypto.randomUUID();
    const result = this.hyphens() ? uuid : uuid.replace(/-/g, '');
    return this.uppercase() ? result.toUpperCase() : result;
  }

  copySingle(value: string, index: number): void {
    navigator.clipboard.writeText(value);
    this.copiedIndex.set(index);
    this.snackBar.open('UUID copiado!', '', { duration: 2000 });
    setTimeout(() => this.copiedIndex.set(-1), 1500);
  }

  copyAll(): void {
    navigator.clipboard.writeText(this.results().join('\n'));
    this.snackBar.open(`${this.results().length} UUIDs copiados!`, '', { duration: 2000 });
  }
}
