import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Formatador de JSON</h1>
    <p class="page-subtitle">Valide, formate e minifique JSON.</p>

    <div class="editor-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Entrada</mat-card-title>
          <button mat-icon-button (click)="clear()"><mat-icon>clear</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <textarea matInput [(ngModel)]="rawValue" (ngModelChange)="onInput($event)"
              placeholder="Cole seu JSON aqui..." rows="18" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <div class="output-header">
            <mat-button-toggle-group [ngModel]="mode()" (ngModelChange)="mode.set($event)">
              <mat-button-toggle value="pretty">Formatado</mat-button-toggle>
              <mat-button-toggle value="minified">Minificado</mat-button-toggle>
            </mat-button-toggle-group>
            @if (output()) {
              <button mat-icon-button (click)="copy()"><mat-icon>content_copy</mat-icon></button>
            }
          </div>
        </mat-card-header>
        <mat-card-content>
          @if (error()) {
            <div class="error-box">
              <mat-icon>error</mat-icon>
              <div><strong>JSON inválido</strong><p>{{ error() }}</p></div>
            </div>
          } @else if (output()) {
            <pre class="output-pre">{{ output() }}</pre>
          } @else {
            <div class="empty-state">
              <mat-icon>data_object</mat-icon>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .output-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .error-box { display: flex; gap: 10px; background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); border-radius: 8px; padding: 14px; mat-icon { flex-shrink: 0; } strong { display: block; margin-bottom: 4px; } p { font-size: 12px; margin: 0; } }
  `]
})
export class JsonFormatterComponent {
  rawValue = '';
  mode = signal<'pretty' | 'minified'>('pretty');
  error = signal('');
  parsed = signal<any>(null);

  output = computed(() => {
    const p = this.parsed();
    if (!p) return '';
    try {
      return this.mode() === 'pretty'
        ? JSON.stringify(p, null, 2)
        : JSON.stringify(p);
    } catch { return ''; }
  });

  constructor(private snackBar: MatSnackBar) {}

  onInput(value: string): void {
    this.error.set('');
    this.parsed.set(null);
    if (!value.trim()) return;
    try { this.parsed.set(JSON.parse(value)); }
    catch (e: any) { this.error.set(e.message); }
  }

  clear(): void { this.rawValue = ''; this.parsed.set(null); this.error.set(''); }

  copy(): void {
    navigator.clipboard.writeText(this.output());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }
}
