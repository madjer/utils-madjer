import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

function validateCpf(raw: string): { valid: boolean; formatted: string; message: string } {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 11) return { valid: false, formatted: '', message: 'CPF deve ter 11 dígitos.' };
  if (/^(\d)\1{10}$/.test(d)) return { valid: false, formatted: '', message: 'CPF inválido (sequência repetida).' };
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 || r === 11 ? 0 : r;
  };
  const valid = calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]);
  const fmt = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  return { valid, formatted: fmt, message: valid ? 'CPF válido.' : 'CPF inválido (dígitos verificadores incorretos).' };
}

function validateCnpj(raw: string): { valid: boolean; formatted: string; message: string } {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 14) return { valid: false, formatted: '', message: 'CNPJ deve ter 14 dígitos.' };
  if (/^(\d)\1{13}$/.test(d)) return { valid: false, formatted: '', message: 'CNPJ inválido (sequência repetida).' };
  const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const weights2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  const calcDigit = (weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const valid = calcDigit(weights1) === parseInt(d[12]) && calcDigit(weights2) === parseInt(d[13]);
  const fmt = `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
  return { valid, formatted: fmt, message: valid ? 'CNPJ válido.' : 'CNPJ inválido (dígitos verificadores incorretos).' };
}

@Component({
  selector: 'app-validator',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <h1 class="page-title">Validador CPF / CNPJ</h1>
    <p class="page-subtitle">Valide e formate CPF ou CNPJ verificando os dígitos verificadores.</p>

    <mat-card>
      <mat-card-content>
        <div class="toggle-row">
          <mat-button-toggle-group [ngModel]="mode()" (ngModelChange)="onModeChange($event)">
            <mat-button-toggle value="cpf">CPF</mat-button-toggle>
            <mat-button-toggle value="cnpj">CNPJ</mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <div class="input-row">
          <mat-form-field appearance="outline" style="flex:1; max-width:360px">
            <mat-label>{{ mode() === 'cpf' ? 'CPF' : 'CNPJ' }}</mat-label>
            <input matInput [(ngModel)]="rawValue" (ngModelChange)="onInputChange($event)"
              [placeholder]="mode() === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'"
              [maxlength]="mode() === 'cpf' ? 14 : 18">
            @if (result()) {
              <mat-icon matSuffix [style.color]="result()!.valid ? 'var(--mat-sys-primary)' : 'var(--mat-sys-error)'">
                {{ result()!.valid ? 'check_circle' : 'cancel' }}
              </mat-icon>
            }
          </mat-form-field>
          <button mat-flat-button (click)="validate()" [disabled]="!rawValue.trim()">
            <mat-icon>verified</mat-icon> Validar
          </button>
        </div>

        @if (result()) {
          <div class="result-box" [class.valid]="result()!.valid" [class.invalid]="!result()!.valid">
            <mat-icon>{{ result()!.valid ? 'check_circle' : 'cancel' }}</mat-icon>
            <div>
              <strong>{{ result()!.message }}</strong>
              @if (result()!.formatted) {
                <p>Formatado: <code>{{ result()!.formatted }}</code></p>
              }
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>

    @if (batchInput) {
      <!-- batch section below -->
    }

    <mat-card style="margin-top:16px">
      <mat-card-content>
        <span class="section-label">Validação em lote (um por linha)</span>
        <mat-form-field appearance="outline" style="width:100%;margin-top:8px">
          <textarea matInput [(ngModel)]="batchInput" rows="6" spellcheck="false" class="mono-textarea"
            placeholder="Cole aqui vários CPFs ou CNPJs, um por linha...">
          </textarea>
        </mat-form-field>
        <button mat-stroked-button (click)="validateBatch()">
          <mat-icon>playlist_add_check</mat-icon> Validar todos
        </button>

        @if (batchResults().length > 0) {
          <div class="batch-list">
            @for (r of batchResults(); track r.input) {
              <div class="batch-item" [class.valid]="r.valid" [class.invalid]="!r.valid">
                <mat-icon>{{ r.valid ? 'check_circle' : 'cancel' }}</mat-icon>
                <span class="batch-input">{{ r.input }}</span>
                <span class="batch-msg">{{ r.message }}</span>
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .toggle-row { margin-bottom: 16px; }
    .input-row { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
    .result-box { display: flex; gap: 12px; align-items: flex-start; border-radius: 8px; padding: 14px; margin-top: 12px; strong { display: block; } p { margin: 4px 0 0; font-size: 13px; } code { font-family: 'Courier New', monospace; } }
    .result-box.valid { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .result-box.invalid { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--mat-sys-on-surface-variant); }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .batch-list { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
    .batch-item { display: flex; align-items: center; gap: 10px; border-radius: 6px; padding: 8px 12px; font-size: 13px; }
    .batch-item.valid { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .batch-item.invalid { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .batch-input { font-family: 'Courier New', monospace; font-weight: 600; min-width: 160px; }
    .batch-msg { font-size: 12px; opacity: .8; }
  `]
})
export class ValidatorComponent {
  rawValue = '';
  batchInput = '';
  mode = signal<'cpf' | 'cnpj'>('cpf');
  result = signal<{ valid: boolean; formatted: string; message: string } | null>(null);
  batchResults = signal<{ input: string; valid: boolean; message: string }[]>([]);

  onModeChange(m: 'cpf' | 'cnpj'): void {
    this.mode.set(m); this.rawValue = ''; this.result.set(null);
  }

  onInputChange(value: string): void {
    const digits = value.replace(/\D/g, '');
    if (this.mode() === 'cpf') {
      let f = digits.slice(0, 11);
      if (f.length > 9) f = `${f.slice(0,3)}.${f.slice(3,6)}.${f.slice(6,9)}-${f.slice(9)}`;
      else if (f.length > 6) f = `${f.slice(0,3)}.${f.slice(3,6)}.${f.slice(6)}`;
      else if (f.length > 3) f = `${f.slice(0,3)}.${f.slice(3)}`;
      this.rawValue = f;
    } else {
      let f = digits.slice(0, 14);
      if (f.length > 12) f = `${f.slice(0,2)}.${f.slice(2,5)}.${f.slice(5,8)}/${f.slice(8,12)}-${f.slice(12)}`;
      else if (f.length > 8) f = `${f.slice(0,2)}.${f.slice(2,5)}.${f.slice(5,8)}/${f.slice(8)}`;
      else if (f.length > 5) f = `${f.slice(0,2)}.${f.slice(2,5)}.${f.slice(5)}`;
      else if (f.length > 2) f = `${f.slice(0,2)}.${f.slice(2)}`;
      this.rawValue = f;
    }
    this.result.set(null);
  }

  validate(): void {
    this.result.set(this.mode() === 'cpf' ? validateCpf(this.rawValue) : validateCnpj(this.rawValue));
  }

  validateBatch(): void {
    const lines = this.batchInput.split('\n').map(l => l.trim()).filter(Boolean);
    const fn = (v: string) => {
      const digits = v.replace(/\D/g, '');
      if (digits.length <= 11) return validateCpf(v);
      return validateCnpj(v);
    };
    this.batchResults.set(lines.map(line => ({ input: line, ...fn(line) })));
  }
}
