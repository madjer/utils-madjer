import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .replace(/\s+/g, ' ')
    .trim();
}

function minifyJs(js: string): string {
  return js
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n\s*/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, '\n')
    .replace(/ *\n */g, '\n')
    .replace(/\n([{};,])/g, '$1')
    .replace(/([{};,])\n/g, '$1')
    .trim();
}

@Component({
  selector: 'app-minifier',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Minificador CSS / JS</h1>
    <p class="page-subtitle">Comprime código CSS ou JavaScript removendo espaços e comentários.</p>

    <div class="toggle-row">
      <mat-button-toggle-group [ngModel]="mode()" (ngModelChange)="onModeChange($event)">
        <mat-button-toggle value="css">CSS</mat-button-toggle>
        <mat-button-toggle value="js">JavaScript</mat-button-toggle>
      </mat-button-toggle-group>
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
              [placeholder]="mode() === 'css' ? 'Cole seu CSS aqui...' : 'Cole seu JavaScript aqui...'"
              rows="18" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <div class="output-header">
            <mat-card-title>Resultado</mat-card-title>
            @if (output()) {
              <div class="stats">
                <span class="stat-badge">{{ savingsPercent() }}% menor</span>
                <button mat-icon-button (click)="copy()"><mat-icon>content_copy</mat-icon></button>
              </div>
            }
          </div>
        </mat-card-header>
        <mat-card-content>
          @if (output()) {
            <pre class="output-pre">{{ output() }}</pre>
          } @else {
            <div class="empty-state">
              <mat-icon>compress</mat-icon>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .toggle-row { margin-bottom: 16px; }
    .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 800px) { .editor-grid { grid-template-columns: 1fr; } }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .output-pre { font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-all; margin: 0; max-height: 420px; overflow-y: auto; }
    .output-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .stats { display: flex; align-items: center; gap: 8px; }
    .stat-badge { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-radius: 12px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 200px; color: var(--mat-sys-on-surface-variant); mat-icon { font-size: 48px; width: 48px; height: 48px; } p { margin: 0; font-size: 14px; } }
  `]
})
export class MinifierComponent {
  rawValue = '';
  mode = signal<'css' | 'js'>('css');
  output = signal('');

  constructor(private snackBar: MatSnackBar) {}

  onModeChange(m: 'css' | 'js'): void { this.mode.set(m); this.onInput(); }

  onInput(): void {
    if (!this.rawValue.trim()) { this.output.set(''); return; }
    this.output.set(this.mode() === 'css' ? minifyCss(this.rawValue) : minifyJs(this.rawValue));
  }

  savingsPercent(): number {
    const orig = this.rawValue.length;
    const min = this.output().length;
    if (!orig) return 0;
    return Math.round((1 - min / orig) * 100);
  }

  clear(): void { this.rawValue = ''; this.output.set(''); }

  copy(): void {
    navigator.clipboard.writeText(this.output());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }
}
