import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const SAMPLE = `# Bem-vindo ao Markdown Viewer

Cole seu texto **Markdown** aqui e veja o resultado em tempo real.

## Formatações suportadas

- **Negrito** e *itálico*
- ~~Tachado~~
- \`código inline\`
- [Links](https://exemplo.com)

## Código

\`\`\`javascript
function hello(name) {
  console.log(\`Olá, \${name}!\`);
}
\`\`\`

## Tabela

| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Dado A   | Dado B   | Dado C   |
| Dado D   | Dado E   | Dado F   |

> Citações também são suportadas.
`;

@Component({
  selector: 'app-markdown-viewer',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Markdown Viewer</h1>
    <p class="page-subtitle">Cole texto Markdown e visualize o resultado formatado em tempo real.</p>

    <div class="editor-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Markdown</mat-card-title>
          <div class="header-actions">
            <span class="char-badge">{{ charCount() }} chars</span>
            <button mat-stroked-button (click)="loadSample()"><mat-icon>description</mat-icon> Exemplo</button>
            <button mat-icon-button (click)="clear()"><mat-icon>clear</mat-icon></button>
          </div>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <textarea matInput [ngModel]="markdownValue" (ngModelChange)="onInput($event)"
              placeholder="Cole seu Markdown aqui..." [rows]="18" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Preview</mat-card-title>
          @if (renderedHtml()) {
            <button mat-icon-button (click)="copyHtml()">
              <mat-icon>content_copy</mat-icon>
            </button>
          }
        </mat-card-header>
        <mat-card-content>
          @if (renderedHtml()) {
            <div class="markdown-preview" [innerHTML]="renderedHtml()"></div>
          } @else {
            <div class="empty-state">
              <mat-icon>article</mat-icon>
              <p>O preview aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .header-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .char-badge { font-size: 11px; color: var(--mat-sys-on-surface-variant); background: var(--mat-sys-surface-container); border: 1px solid var(--mat-sys-outline-variant); border-radius: 20px; padding: 2px 8px; }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6; }
  `]
})
export class MarkdownViewerComponent {
  markdownValue = '';
  renderedHtml = signal<SafeHtml | null>(null);
  charCount = signal(0);
  private rawHtml = '';

  constructor(private sanitizer: DomSanitizer, private snackBar: MatSnackBar) {
    marked.setOptions({ breaks: true, gfm: true } as any);
  }

  onInput(value: string): void {
    this.markdownValue = value;
    this.charCount.set(value.length);
    if (!value.trim()) { this.renderedHtml.set(null); this.rawHtml = ''; return; }
    const html = marked.parse(value) as string;
    this.rawHtml = html;
    this.renderedHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }

  loadSample(): void { this.onInput(SAMPLE); }
  clear(): void { this.onInput(''); }

  copyHtml(): void {
    if (!this.rawHtml) return;
    navigator.clipboard.writeText(this.rawHtml);
    this.snackBar.open('HTML copiado!', '', { duration: 2000 });
  }
}
