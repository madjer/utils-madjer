import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

function jsonToCsv(data: any[], delimiter: string): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const escape = (v: any) => {
    const s = String(v ?? '');
    return s.includes(delimiter) || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(delimiter),
    ...data.map(row => headers.map(h => escape(row[h])).join(delimiter))
  ].join('\n');
}

function csvToJson(csv: string, delimiter: string): any[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV precisa ter ao menos cabeçalho e uma linha de dados.');
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.match(/("(?:[^"]|"")*"|[^,\n]*)/g) ?? [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? '').trim().replace(/^"|"$/g, '').replace(/""/g, '"');
    });
    return row;
  });
}

@Component({
  selector: 'app-json-csv',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Conversor JSON ↔ CSV</h1>
    <p class="page-subtitle">Converta dados entre JSON (array de objetos) e CSV.</p>

    <div class="toolbar-row">
      <mat-button-toggle-group [ngModel]="direction()" (ngModelChange)="onDirectionChange($event)">
        <mat-button-toggle value="json-to-csv">JSON → CSV</mat-button-toggle>
        <mat-button-toggle value="csv-to-json">CSV → JSON</mat-button-toggle>
      </mat-button-toggle-group>
      <mat-form-field appearance="outline" style="width:140px">
        <mat-label>Separador</mat-label>
        <mat-select [ngModel]="delimiter()" (ngModelChange)="onDelimiterChange($event)">
          <mat-option value=",">Vírgula (,)</mat-option>
          <mat-option value=";">Ponto-vírgula (;)</mat-option>
          <mat-option value="	">Tab</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div class="editor-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ direction() === 'json-to-csv' ? 'JSON' : 'CSV' }}</mat-card-title>
          <button mat-icon-button (click)="clear()"><mat-icon>clear</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <textarea matInput [(ngModel)]="rawValue" (ngModelChange)="convert()"
              [placeholder]="direction() === 'json-to-csv' ? 'Cole seu JSON (array) aqui...' : 'Cole seu CSV aqui...'"
              rows="18" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ direction() === 'json-to-csv' ? 'CSV' : 'JSON' }}</mat-card-title>
          @if (output()) {
            <button mat-icon-button (click)="copy()"><mat-icon>content_copy</mat-icon></button>
          }
        </mat-card-header>
        <mat-card-content>
          @if (error()) {
            <div class="error-box">
              <mat-icon>error</mat-icon>
              <div><strong>Erro na conversão</strong><p>{{ error() }}</p></div>
            </div>
          } @else if (output()) {
            <pre class="output-pre">{{ output() }}</pre>
          } @else {
            <div class="empty-state">
              <mat-icon>table_chart</mat-icon>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .toolbar-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; align-items: flex-start; }
    .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 800px) { .editor-grid { grid-template-columns: 1fr; } }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .output-pre { font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-all; margin: 0; max-height: 420px; overflow-y: auto; }
    .error-box { display: flex; gap: 10px; background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); border-radius: 8px; padding: 14px; mat-icon { flex-shrink: 0; } strong { display: block; margin-bottom: 4px; } p { font-size: 12px; margin: 0; } }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 200px; color: var(--mat-sys-on-surface-variant); mat-icon { font-size: 48px; width: 48px; height: 48px; } p { margin: 0; font-size: 14px; } }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
  `]
})
export class JsonCsvComponent {
  rawValue = '';
  direction = signal<'json-to-csv' | 'csv-to-json'>('json-to-csv');
  delimiter = signal(',');
  output = signal('');
  error = signal('');

  constructor(private snackBar: MatSnackBar) {}

  onDirectionChange(d: 'json-to-csv' | 'csv-to-json'): void {
    this.direction.set(d); this.rawValue = ''; this.output.set(''); this.error.set('');
  }

  onDelimiterChange(d: string): void { this.delimiter.set(d); this.convert(); }

  convert(): void {
    this.error.set('');
    if (!this.rawValue.trim()) { this.output.set(''); return; }
    try {
      if (this.direction() === 'json-to-csv') {
        const parsed = JSON.parse(this.rawValue);
        if (!Array.isArray(parsed)) throw new Error('Entrada deve ser um array JSON.');
        this.output.set(jsonToCsv(parsed, this.delimiter()));
      } else {
        const rows = csvToJson(this.rawValue, this.delimiter());
        this.output.set(JSON.stringify(rows, null, 2));
      }
    } catch (e: any) {
      this.error.set(e.message); this.output.set('');
    }
  }

  clear(): void { this.rawValue = ''; this.output.set(''); this.error.set(''); }

  copy(): void {
    navigator.clipboard.writeText(this.output());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }
}
