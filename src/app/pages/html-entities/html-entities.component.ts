import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

function encodeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeHtml(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

@Component({
  selector: 'app-html-entities',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">HTML Entities Encode / Decode</h1>
    <p class="page-subtitle">Codifique ou decodifique entidades HTML especiais.</p>

    <div class="toggle-row">
      <mat-button-toggle-group [ngModel]="mode()" (ngModelChange)="onModeChange($event)">
        <mat-button-toggle value="encode">Codificar</mat-button-toggle>
        <mat-button-toggle value="decode">Decodificar</mat-button-toggle>
      </mat-button-toggle-group>
    </div>

    <div class="editor-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ mode() === 'encode' ? 'HTML original' : 'HTML com entidades' }}</mat-card-title>
          <button mat-icon-button (click)="clear()"><mat-icon>clear</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <textarea matInput [(ngModel)]="rawValue" (ngModelChange)="convert()"
              [placeholder]="mode() === 'encode' ? 'Cole seu HTML aqui...' : 'Cole o HTML com entidades...'"
              rows="12" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ mode() === 'encode' ? 'HTML com entidades' : 'HTML decodificado' }}</mat-card-title>
          @if (output()) {
            <button mat-icon-button (click)="copy()"><mat-icon>content_copy</mat-icon></button>
          }
        </mat-card-header>
        <mat-card-content>
          @if (output()) {
            <pre class="output-pre">{{ output() }}</pre>
          } @else {
            <div class="empty-state">
              <mat-icon>code</mat-icon>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>

    <mat-card style="margin-top:16px">
      <mat-card-content>
        <span class="section-label">Referência de entidades comuns</span>
        <div class="ref-grid">
          @for (e of commonEntities; track e.char) {
            <div class="ref-item">
              <span class="ref-char">{{ e.char }}</span>
              <span class="ref-entity">{{ e.entity }}</span>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .toggle-row { margin-bottom: 16px; }
    .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 800px) { .editor-grid { grid-template-columns: 1fr; } }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .output-pre { font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-all; margin: 0; max-height: 300px; overflow-y: auto; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 150px; color: var(--mat-sys-on-surface-variant); mat-icon { font-size: 48px; width: 48px; height: 48px; } p { margin: 0; font-size: 14px; } }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--mat-sys-on-surface-variant); display: block; margin-bottom: 12px; }
    .ref-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px,1fr)); gap: 8px; }
    .ref-item { display: flex; gap: 8px; align-items: center; background: var(--mat-sys-surface-container); border-radius: 6px; padding: 6px 10px; }
    .ref-char { font-size: 18px; font-weight: 700; color: var(--mat-sys-primary); min-width: 20px; }
    .ref-entity { font-family: 'Courier New', monospace; font-size: 12px; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class HtmlEntitiesComponent {
  rawValue = '';
  mode = signal<'encode' | 'decode'>('encode');
  output = signal('');

  commonEntities = [
    { char: '&',  entity: '&amp;' },
    { char: '<',  entity: '&lt;' },
    { char: '>',  entity: '&gt;' },
    { char: '"',  entity: '&quot;' },
    { char: "'",  entity: '&#39;' },
    { char: '©',  entity: '&copy;' },
    { char: '®',  entity: '&reg;' },
    { char: '™',  entity: '&trade;' },
    { char: '€',  entity: '&euro;' },
    { char: '£',  entity: '&pound;' },
    { char: ' ',  entity: '&nbsp;' },
    { char: '÷',  entity: '&divide;' },
  ];

  constructor(private snackBar: MatSnackBar) {}

  onModeChange(m: 'encode' | 'decode'): void {
    this.mode.set(m); this.rawValue = ''; this.output.set('');
  }

  convert(): void {
    if (!this.rawValue) { this.output.set(''); return; }
    this.output.set(this.mode() === 'encode' ? encodeHtml(this.rawValue) : decodeHtml(this.rawValue));
  }

  clear(): void { this.rawValue = ''; this.output.set(''); }

  copy(): void {
    navigator.clipboard.writeText(this.output());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }
}
