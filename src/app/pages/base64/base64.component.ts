import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-base64',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Base64 Encode / Decode</h1>
    <p class="page-subtitle">Codifique ou decodifique texto e arquivos em Base64.</p>

    <div class="toggle-row">
      <mat-button-toggle-group [ngModel]="mode()" (ngModelChange)="onModeChange($event)">
        <mat-button-toggle value="encode">Codificar</mat-button-toggle>
        <mat-button-toggle value="decode">Decodificar</mat-button-toggle>
      </mat-button-toggle-group>
    </div>

    <div class="editor-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ mode() === 'encode' ? 'Texto original' : 'Base64' }}</mat-card-title>
          <button mat-icon-button (click)="clear()"><mat-icon>clear</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <textarea matInput [(ngModel)]="rawValue" (ngModelChange)="convert()"
              [placeholder]="mode() === 'encode' ? 'Digite ou cole o texto aqui...' : 'Cole o Base64 aqui...'"
              rows="12" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ mode() === 'encode' ? 'Base64' : 'Texto decodificado' }}</mat-card-title>
          @if (output()) {
            <button mat-icon-button (click)="copy()"><mat-icon>content_copy</mat-icon></button>
          }
        </mat-card-header>
        <mat-card-content>
          @if (error()) {
            <div class="error-box">
              <mat-icon>error</mat-icon>
              <div><strong>Erro na decodificação</strong><p>{{ error() }}</p></div>
            </div>
          } @else if (output()) {
            <pre class="output-pre">{{ output() }}</pre>
          } @else {
            <div class="empty-state">
              <mat-icon>lock_open</mat-icon>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>

    <mat-card style="margin-top:16px">
      <mat-card-content>
        <div class="file-section">
          <span class="section-label">Arquivo → Base64</span>
          <input type="file" #fileInput (change)="onFileSelect($event)" style="display:none">
          <button mat-stroked-button (click)="fileInput.click()">
            <mat-icon>upload_file</mat-icon> Selecionar arquivo
          </button>
          @if (fileBase64()) {
            <button mat-icon-button (click)="copyFile()" matTooltip="Copiar Base64">
              <mat-icon>content_copy</mat-icon>
            </button>
          }
        </div>
        @if (fileBase64()) {
          <pre class="file-output">{{ fileBase64() }}</pre>
        }
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
    .error-box { display: flex; gap: 10px; background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); border-radius: 8px; padding: 14px; mat-icon { flex-shrink: 0; } strong { display: block; margin-bottom: 4px; } p { font-size: 12px; margin: 0; } }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 150px; color: var(--mat-sys-on-surface-variant); mat-icon { font-size: 48px; width: 48px; height: 48px; } p { margin: 0; font-size: 14px; } }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .file-section { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--mat-sys-on-surface-variant); }
    .file-output { font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; margin: 0; max-height: 120px; overflow-y: auto; background: var(--mat-sys-surface-container); border-radius: 4px; padding: 8px; }
  `]
})
export class Base64Component {
  rawValue = '';
  mode = signal<'encode' | 'decode'>('encode');
  output = signal('');
  error = signal('');
  fileBase64 = signal('');

  constructor(private snackBar: MatSnackBar) {}

  onModeChange(m: 'encode' | 'decode'): void {
    this.mode.set(m); this.rawValue = ''; this.output.set(''); this.error.set('');
  }

  convert(): void {
    this.error.set('');
    if (!this.rawValue.trim()) { this.output.set(''); return; }
    try {
      if (this.mode() === 'encode') {
        this.output.set(btoa(unescape(encodeURIComponent(this.rawValue))));
      } else {
        this.output.set(decodeURIComponent(escape(atob(this.rawValue.trim()))));
      }
    } catch {
      this.error.set('Base64 inválido ou não é UTF-8 válido.');
      this.output.set('');
    }
  }

  clear(): void { this.rawValue = ''; this.output.set(''); this.error.set(''); }

  copy(): void {
    navigator.clipboard.writeText(this.output());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.fileBase64.set(result.split(',')[1] ?? '');
    };
    reader.readAsDataURL(file);
  }

  copyFile(): void {
    navigator.clipboard.writeText(this.fileBase64());
    this.snackBar.open('Base64 copiado!', '', { duration: 2000 });
  }
}
