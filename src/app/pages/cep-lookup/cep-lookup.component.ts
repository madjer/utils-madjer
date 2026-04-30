import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';

interface CepResult {
  cep: string; logradouro: string; complemento: string;
  bairro: string; localidade: string; uf: string; ibge: string;
}

@Component({
  selector: 'app-cep-lookup',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule,
            MatInputModule, MatIconModule, MatProgressSpinnerModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Consulta de CEP</h1>
    <p class="page-subtitle">Busca endereço a partir do CEP usando a API ViaCEP.</p>

    <mat-card>
      <mat-card-content>
        <div class="search-row">
          <mat-form-field appearance="outline">
            <mat-label>CEP</mat-label>
            <input matInput [(ngModel)]="cep" placeholder="00000-000" maxlength="9"
              (keyup.enter)="search()" (ngModelChange)="onCepChange($event)">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-flat-button (click)="search()" [disabled]="loading()">
            @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
            @else { <mat-icon>search</mat-icon> }
            Buscar
          </button>
        </div>

        @if (error()) {
          <div class="error-box">
            <mat-icon>error</mat-icon>
            <span>{{ error() }}</span>
          </div>
        }
      </mat-card-content>
    </mat-card>

    @if (result()) {
      <mat-card style="margin-top:16px">
        <mat-card-header>
          <mat-card-title>{{ result()!.logradouro || 'Endereço encontrado' }}</mat-card-title>
          <mat-card-subtitle>CEP {{ result()!.cep }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="address-grid">
            @for (field of addressFields(); track field.label) {
              @if (field.value) {
                <div class="address-field">
                  <span class="field-label">{{ field.label }}</span>
                  <span class="field-value">{{ field.value }}</span>
                </div>
              }
            }
          </div>
          <button mat-stroked-button style="margin-top:16px" (click)="copyJson()">
            <mat-icon>content_copy</mat-icon> Copiar JSON
          </button>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .search-row { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
    .error-box { display: flex; align-items: center; gap: 8px; color: var(--mat-sys-error); margin-top: 8px; font-size: 14px; }
    .address-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 16px; }
    .address-field { display: flex; flex-direction: column; gap: 2px; }
    .field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--mat-sys-on-surface-variant); }
    .field-value { font-size: 14px; color: var(--mat-sys-on-surface); }
  `]
})
export class CepLookupComponent {
  cep = '';
  loading = signal(false);
  error = signal('');
  result = signal<CepResult | null>(null);

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  onCepChange(value: string): void {
    const digits = value.replace(/\D/g, '');
    this.cep = digits.length > 5 ? `${digits.slice(0,5)}-${digits.slice(5,8)}` : digits;
  }

  search(): void {
    const digits = this.cep.replace(/\D/g, '');
    if (digits.length !== 8) { this.error.set('CEP deve ter 8 dígitos.'); return; }
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);
    this.http.get<CepResult & { erro?: boolean }>(`https://viacep.com.br/ws/${digits}/json/`).subscribe({
      next: (data) => {
        this.loading.set(false);
        if (data.erro) { this.error.set('CEP não encontrado.'); return; }
        this.result.set(data);
      },
      error: () => { this.loading.set(false); this.error.set('Erro ao consultar o CEP.'); }
    });
  }

  addressFields() {
    const r = this.result();
    if (!r) return [];
    return [
      { label: 'Logradouro', value: r.logradouro },
      { label: 'Complemento', value: r.complemento },
      { label: 'Bairro', value: r.bairro },
      { label: 'Cidade', value: r.localidade },
      { label: 'Estado', value: r.uf },
      { label: 'IBGE', value: r.ibge },
    ];
  }

  copyJson(): void {
    navigator.clipboard.writeText(JSON.stringify(this.result(), null, 2));
    this.snackBar.open('JSON copiado!', '', { duration: 2000 });
  }
}
