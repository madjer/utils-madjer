import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { format } from 'sql-formatter';

@Component({
  selector: 'app-sql-formatter',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Formatador de SQL</h1>
    <p class="page-subtitle">Formate e embeleize queries SQL com suporte a múltiplos dialetos.</p>

    <div class="toolbar-row">
      <mat-form-field appearance="outline" style="width:160px">
        <mat-label>Dialeto</mat-label>
        <mat-select [ngModel]="dialect()" (ngModelChange)="dialect.set($event)">
          @for (d of dialects; track d.value) {
            <mat-option [value]="d.value">{{ d.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" style="width:110px">
        <mat-label>Indentação</mat-label>
        <mat-select [ngModel]="indent()" (ngModelChange)="indent.set($event)">
          <mat-option value="  ">2 espaços</mat-option>
          <mat-option value="    ">4 espaços</mat-option>
          <mat-option value="	">Tab</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div class="editor-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Entrada</mat-card-title>
          <button mat-icon-button (click)="clear()"><mat-icon>clear</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <textarea matInput [(ngModel)]="rawValue" (ngModelChange)="onInput()"
              placeholder="Cole seu SQL aqui..." rows="18" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Resultado</mat-card-title>
          @if (output()) {
            <button mat-icon-button (click)="copy()"><mat-icon>content_copy</mat-icon></button>
          }
        </mat-card-header>
        <mat-card-content>
          @if (error()) {
            <div class="error-box">
              <mat-icon>error</mat-icon>
              <div><strong>Erro ao formatar</strong><p>{{ error() }}</p></div>
            </div>
          } @else if (output()) {
            <pre class="output-pre">{{ output() }}</pre>
          } @else {
            <div class="empty-state">
              <mat-icon>data_array</mat-icon>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .toolbar-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 800px) { .editor-grid { grid-template-columns: 1fr; } }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .output-pre { font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-all; margin: 0; max-height: 420px; overflow-y: auto; }
    .error-box { display: flex; gap: 10px; background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); border-radius: 8px; padding: 14px; mat-icon { flex-shrink: 0; } strong { display: block; margin-bottom: 4px; } p { font-size: 12px; margin: 0; } }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 200px; color: var(--mat-sys-on-surface-variant); mat-icon { font-size: 48px; width: 48px; height: 48px; } p { margin: 0; font-size: 14px; } }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
  `]
})
export class SqlFormatterComponent {
  rawValue = '';
  dialect = signal<string>('sql');
  indent = signal<string>('  ');
  output = signal('');
  error = signal('');

  dialects = [
    { value: 'sql',        label: 'SQL' },
    { value: 'mysql',      label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite',     label: 'SQLite' },
    { value: 'tsql',       label: 'T-SQL' },
    { value: 'plsql',      label: 'PL/SQL' },
  ];

  constructor(private snackBar: MatSnackBar) {}

  onInput(): void {
    this.error.set('');
    if (!this.rawValue.trim()) { this.output.set(''); return; }
    try {
      const result = format(this.rawValue, {
        language: this.dialect() as any,
        tabWidth: this.indent() === '\t' ? 1 : this.indent().length,
        useTabs: this.indent() === '\t',
      });
      this.output.set(result);
    } catch (e: any) {
      this.error.set(e.message);
      this.output.set('');
    }
  }

  clear(): void { this.rawValue = ''; this.output.set(''); this.error.set(''); }

  copy(): void {
    navigator.clipboard.writeText(this.output());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }
}
