import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

interface JwtParts { header: any; payload: any; signature: string; isExpired: boolean | null; }

function decodeJwt(token: string): JwtParts {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('JWT inválido: deve ter 3 partes separadas por ponto.');
  const decode = (part: string) => {
    const padded = part + '=='.slice((part.length % 4) || 4);
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  };
  const header = decode(parts[0]);
  const payload = decode(parts[1]);
  const isExpired = payload.exp ? Date.now() / 1000 > payload.exp : null;
  return { header, payload, signature: parts[2], isExpired };
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString('pt-BR');
}

@Component({
  selector: 'app-jwt-decoder',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule,
            MatInputModule, MatIconModule, MatChipsModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">JWT Decoder</h1>
    <p class="page-subtitle">Decodifique e inspecione tokens JWT (JSON Web Tokens).</p>

    <mat-card>
      <mat-card-content>
        <mat-form-field appearance="outline" style="width:100%">
          <mat-label>Token JWT</mat-label>
          <textarea matInput [(ngModel)]="rawValue" (ngModelChange)="decode()"
            rows="4" spellcheck="false" class="mono-textarea"
            placeholder="Cole seu JWT aqui...">
          </textarea>
        </mat-form-field>
        <button mat-stroked-button (click)="clear()"><mat-icon>clear</mat-icon> Limpar</button>
      </mat-card-content>
    </mat-card>

    @if (error()) {
      <div class="error-box" style="margin-top:12px">
        <mat-icon>error</mat-icon>
        <span>{{ error() }}</span>
      </div>
    }

    @if (result()) {
      <div class="parts-grid">
        <mat-card style="margin-top:12px">
          <mat-card-header>
            <mat-card-title>
              <span class="part-badge header-badge">Header</span>
            </mat-card-title>
            <button mat-icon-button (click)="copyPart('header')"><mat-icon>content_copy</mat-icon></button>
          </mat-card-header>
          <mat-card-content>
            <pre class="json-pre">{{ headerJson() }}</pre>
          </mat-card-content>
        </mat-card>

        <mat-card style="margin-top:12px">
          <mat-card-header>
            <mat-card-title>
              <span class="part-badge payload-badge">Payload</span>
              @if (result()!.isExpired === true) {
                <span class="expired-chip">Expirado</span>
              } @else if (result()!.isExpired === false) {
                <span class="valid-chip">Válido</span>
              }
            </mat-card-title>
            <button mat-icon-button (click)="copyPart('payload')"><mat-icon>content_copy</mat-icon></button>
          </mat-card-header>
          <mat-card-content>
            <pre class="json-pre">{{ payloadJson() }}</pre>
            @if (result()!.payload.iat) {
              <p class="date-info"><strong>iat:</strong> {{ formatDate(result()!.payload.iat) }}</p>
            }
            @if (result()!.payload.exp) {
              <p class="date-info"><strong>exp:</strong> {{ formatDate(result()!.payload.exp) }}</p>
            }
          </mat-card-content>
        </mat-card>

        <mat-card style="margin-top:12px">
          <mat-card-header>
            <mat-card-title>
              <span class="part-badge sig-badge">Signature</span>
            </mat-card-title>
            <button mat-icon-button (click)="copyPart('signature')"><mat-icon>content_copy</mat-icon></button>
          </mat-card-header>
          <mat-card-content>
            <pre class="sig-pre">{{ result()!.signature }}</pre>
            <p class="sig-note">A assinatura não pode ser verificada sem a chave secreta.</p>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .error-box { display: flex; align-items: center; gap: 8px; color: var(--mat-sys-error); font-size: 14px; }
    .parts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 16px; }
    .json-pre { font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-word; margin: 0; max-height: 280px; overflow-y: auto; }
    .sig-pre { font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all; white-space: pre-wrap; margin: 0 0 8px; }
    .sig-note { font-size: 11px; color: var(--mat-sys-on-surface-variant); margin: 0; }
    .date-info { font-size: 12px; margin: 4px 0 0; color: var(--mat-sys-on-surface-variant); }
    .part-badge { border-radius: 12px; padding: 2px 10px; font-size: 12px; font-weight: 700; margin-right: 6px; }
    .header-badge { background: #7c3aed22; color: #7c3aed; }
    .payload-badge { background: #0284c722; color: #0284c7; }
    .sig-badge { background: #ea580c22; color: #ea580c; }
    .expired-chip { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); border-radius: 12px; padding: 2px 10px; font-size: 11px; }
    .valid-chip { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-radius: 12px; padding: 2px 10px; font-size: 11px; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
  `]
})
export class JwtDecoderComponent {
  rawValue = '';
  result = signal<JwtParts | null>(null);
  error = signal('');

  headerJson = () => this.result() ? JSON.stringify(this.result()!.header, null, 2) : '';
  payloadJson = () => this.result() ? JSON.stringify(this.result()!.payload, null, 2) : '';
  formatDate = formatDate;

  constructor(private snackBar: MatSnackBar) {}

  decode(): void {
    this.error.set('');
    if (!this.rawValue.trim()) { this.result.set(null); return; }
    try {
      this.result.set(decodeJwt(this.rawValue));
    } catch (e: any) {
      this.error.set(e.message);
      this.result.set(null);
    }
  }

  clear(): void { this.rawValue = ''; this.result.set(null); this.error.set(''); }

  copyPart(part: 'header' | 'payload' | 'signature'): void {
    const r = this.result();
    if (!r) return;
    const text = part === 'signature' ? r.signature : JSON.stringify(r[part], null, 2);
    navigator.clipboard.writeText(text);
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }
}
