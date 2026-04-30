import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

interface HashResult { algorithm: string; value: string; }

@Component({
  selector: 'app-hash',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule,
            MatInputModule, MatIconModule, MatProgressSpinnerModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Gerador de Hash</h1>
    <p class="page-subtitle">Gere hashes SHA-1, SHA-256, SHA-384 e SHA-512 a partir de texto.</p>

    <mat-card>
      <mat-card-content>
        <mat-form-field appearance="outline" style="width:100%">
          <mat-label>Texto de entrada</mat-label>
          <textarea matInput [(ngModel)]="rawValue" rows="5" spellcheck="false" class="mono-textarea"
            placeholder="Digite ou cole o texto aqui...">
          </textarea>
        </mat-form-field>
        <div class="action-row">
          <button mat-flat-button (click)="hash()" [disabled]="loading()">
            @if (loading()) { <mat-spinner diameter="18"></mat-spinner> }
            @else { <mat-icon>tag</mat-icon> }
            Gerar Hashes
          </button>
          <button mat-stroked-button (click)="clear()">
            <mat-icon>clear</mat-icon> Limpar
          </button>
        </div>
      </mat-card-content>
    </mat-card>

    @if (results().length > 0) {
      <div class="results-list">
        @for (r of results(); track r.algorithm) {
          <mat-card style="margin-top:12px">
            <mat-card-content>
              <div class="hash-header">
                <span class="algo-badge">{{ r.algorithm }}</span>
                <button mat-icon-button (click)="copy(r)"><mat-icon>content_copy</mat-icon></button>
              </div>
              <pre class="hash-value">{{ r.value }}</pre>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .action-row { display: flex; gap: 12px; margin-top: 8px; }
    .hash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .algo-badge { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-radius: 12px; padding: 4px 12px; font-size: 12px; font-weight: 700; }
    .hash-value { font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all; white-space: pre-wrap; margin: 0; color: var(--mat-sys-on-surface); }
  `]
})
export class HashComponent {
  rawValue = '';
  loading = signal(false);
  results = signal<HashResult[]>([]);

  constructor(private snackBar: MatSnackBar) {}

  async hash(): Promise<void> {
    if (!this.rawValue.trim()) return;
    this.loading.set(true);
    const encoder = new TextEncoder();
    const data = encoder.encode(this.rawValue);
    const algorithms: { name: string; algo: AlgorithmIdentifier }[] = [
      { name: 'SHA-1',   algo: 'SHA-1' },
      { name: 'SHA-256', algo: 'SHA-256' },
      { name: 'SHA-384', algo: 'SHA-384' },
      { name: 'SHA-512', algo: 'SHA-512' },
    ];
    const results = await Promise.all(algorithms.map(async ({ name, algo }) => {
      const buffer = await crypto.subtle.digest(algo, data);
      const hex = Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      return { algorithm: name, value: hex };
    }));
    this.results.set(results);
    this.loading.set(false);
  }

  clear(): void { this.rawValue = ''; this.results.set([]); }

  copy(r: HashResult): void {
    navigator.clipboard.writeText(r.value);
    this.snackBar.open(`${r.algorithm} copiado!`, '', { duration: 2000 });
  }
}
