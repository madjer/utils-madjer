import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Markdown Viewer</h1>
      <p>Cole texto Markdown e visualize o resultado formatado em tempo real.</p>
    </div>

    <div class="viewer-layout">
      <div class="card editor-panel">
        <div class="panel-header">
          <span class="section-title">Markdown</span>
          <div class="panel-actions">
            <button class="btn btn-secondary btn-sm" (click)="loadSample()">
              <span class="material-icons-round">description</span>
              Exemplo
            </button>
            <button class="btn btn-secondary btn-sm" (click)="clear()">
              <span class="material-icons-round">clear</span>
              Limpar
            </button>
          </div>
        </div>
        <textarea
          class="form-control md-textarea"
          [(ngModel)]="markdownValue"
          (ngModelChange)="onInput($event)"
          placeholder="Cole seu Markdown aqui..."
          spellcheck="false"
        ></textarea>
        <div class="char-count">{{ charCount() }} caracteres</div>
      </div>

      <div class="card preview-panel">
        <div class="panel-header">
          <span class="section-title">Preview</span>
          @if (renderedHtml()) {
            <button class="btn btn-secondary btn-sm" (click)="copyHtml()">
              <span class="material-icons-round">{{ copiedHtml() ? 'check' : 'content_copy' }}</span>
              {{ copiedHtml() ? 'Copiado!' : 'Copiar HTML' }}
            </button>
          }
        </div>

        @if (renderedHtml()) {
          <div class="markdown-preview fade-in" [innerHTML]="renderedHtml()"></div>
        } @else {
          <div class="empty-state">
            <span class="material-icons-round">article</span>
            <p>O preview aparecerá aqui</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .viewer-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: start;

      @media (max-width: 700px) {
        grid-template-columns: 1fr;
      }
    }

    .editor-panel, .preview-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 480px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .panel-actions {
      display: flex;
      gap: 6px;
    }

    .md-textarea {
      flex: 1;
      min-height: 380px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
    }

    .char-count {
      font-size: 11px;
      color: var(--text-muted);
      text-align: right;
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--text-muted);

      .material-icons-round { font-size: 40px !important; opacity: .3; }
      p { font-size: 13px; }
    }

    .markdown-preview {
      flex: 1;
      overflow: auto;
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-primary);

      ::ng-deep {
        h1, h2, h3, h4, h5, h6 {
          margin: 1em 0 .4em;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }

        h1 { font-size: 1.7em; border-bottom: 2px solid var(--border); padding-bottom: .3em; }
        h2 { font-size: 1.3em; border-bottom: 1px solid var(--border); padding-bottom: .2em; }
        h3 { font-size: 1.1em; }

        p { margin: .6em 0; }

        a { color: var(--primary); text-decoration: none; }
        a:hover { text-decoration: underline; }

        strong { font-weight: 700; }
        em { font-style: italic; }
        del { opacity: .6; }

        code {
          font-family: 'Courier New', monospace;
          font-size: 12.5px;
          background: var(--surface-3);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1px 5px;
        }

        pre {
          background: #1e1e2e;
          border-radius: var(--radius-sm);
          padding: 14px 16px;
          overflow: auto;
          margin: .8em 0;

          code {
            background: none;
            border: none;
            padding: 0;
            color: #cdd6f4;
            font-size: 13px;
            line-height: 1.5;
          }
        }

        blockquote {
          border-left: 3px solid var(--primary);
          margin: .8em 0;
          padding: .4em 0 .4em 16px;
          color: var(--text-secondary);
          font-style: italic;
        }

        ul, ol {
          padding-left: 20px;
          margin: .5em 0;
          li { margin: .25em 0; }
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: .8em 0;
          font-size: 13px;

          th, td {
            border: 1px solid var(--border);
            padding: 8px 12px;
            text-align: left;
          }

          th {
            background: var(--surface-3);
            font-weight: 600;
          }

          tr:hover td { background: var(--surface-3); }
        }

        hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1em 0;
        }

        img {
          max-width: 100%;
          border-radius: var(--radius-sm);
        }
      }
    }
  `]
})
export class MarkdownViewerComponent {
  markdownValue = '';
  markdown = signal('');
  renderedHtml = signal<SafeHtml | null>(null);
  charCount = signal(0);
  copiedHtml = signal(false);
  private rawHtml = '';

  constructor(private sanitizer: DomSanitizer) {
    marked.setOptions({ breaks: true, gfm: true } as any);
  }

  onInput(value: string): void {
    this.markdown.set(value);
    this.charCount.set(value.length);
    if (!value.trim()) {
      this.renderedHtml.set(null);
      this.rawHtml = '';
      return;
    }
    const html = marked.parse(value) as string;
    this.rawHtml = html;
    this.renderedHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
  }

  loadSample(): void {
    this.markdownValue = SAMPLE;
    this.onInput(SAMPLE);
  }

  clear(): void {
    this.markdownValue = '';
    this.onInput('');
  }

  copyHtml(): void {
    if (!this.rawHtml) return;
    navigator.clipboard.writeText(this.rawHtml);
    this.copiedHtml.set(true);
    setTimeout(() => this.copiedHtml.set(false), 1500);
  }
}
