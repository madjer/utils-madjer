import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoPageModule, PoButtonModule, PoContainerModule,
  PoDividerModule, PoNotificationService, PoFieldModule
} from '@po-ui/ng-components';
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
  imports: [FormsModule, PoPageModule, PoButtonModule, PoContainerModule, PoDividerModule, PoFieldModule],
  providers: [PoNotificationService],
  template: `
    <po-page-default p-title="Markdown Viewer">
      <p class="page-subtitle">Cole texto Markdown e visualize o resultado formatado em tempo real.</p>

      <div class="editor-grid">
        <po-container p-title="Markdown">
          <div class="panel-header">
            <span class="char-badge">{{ charCount() }} chars</span>
            <div style="display:flex;gap:6px">
              <po-button p-label="Exemplo" p-icon="ph ph-file-text" p-kind="secondary" p-size="small" (p-click)="loadSample()"></po-button>
              <po-button p-label="Limpar"  p-icon="ph ph-eraser"    p-kind="secondary" p-size="small" (p-click)="clear()"></po-button>
            </div>
          </div>
          <po-textarea p-label="" [ngModel]="markdownValue" (ngModelChange)="onInput($event)"
            p-placeholder="Cole seu Markdown aqui..." [p-rows]="18">
          </po-textarea>
        </po-container>

        <po-container p-title="Preview">
          <div class="panel-header">
            <span></span>
            @if (renderedHtml()) {
              <po-button p-label="Copiar HTML" p-icon="ph ph-copy" p-kind="secondary" p-size="small" (p-click)="copyHtml()"></po-button>
            }
          </div>
          @if (renderedHtml()) {
            <div class="markdown-preview" [innerHTML]="renderedHtml()"></div>
          } @else {
            <div class="empty-state">
              <span class="ph ph-article" style="font-size:36px;opacity:.3"></span>
              <p>O preview aparecerá aqui</p>
            </div>
          }
        </po-container>
      </div>
    </po-page-default>
  `,
  styles: [`
    .empty-state {
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;padding:48px 0;gap:8px;
      color:var(--color-neutral-mid-40); p{font-size:13px}
    }
  `]
})
export class MarkdownViewerComponent {
  markdownValue = '';
  renderedHtml = signal<SafeHtml | null>(null);
  charCount = signal(0);
  private rawHtml = '';

  constructor(private sanitizer: DomSanitizer, private notification: PoNotificationService) {
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
    this.notification.success({ message: 'HTML copiado!', duration: 2000 });
  }
}
