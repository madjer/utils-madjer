import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ViewMode = 'formatted' | 'escaped';

@Component({
  selector: 'app-xml-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Formatador de XML</h1>
      <p>Cole um XML, visualize formatado e opcionalmente escape como string JSON.</p>
    </div>

    <div class="editor-layout">
      <div class="card input-panel">
        <div class="panel-header">
          <span class="section-title">XML de entrada</span>
          <div class="panel-actions">
            <button class="btn btn-secondary btn-sm" (click)="clear()" [disabled]="!rawXml()">
              <span class="material-icons-round">clear</span>
              Limpar
            </button>
            <button class="btn btn-secondary btn-sm" (click)="pasteFromClipboard()">
              <span class="material-icons-round">content_paste</span>
              Colar
            </button>
          </div>
        </div>
        <textarea
          class="form-control xml-textarea"
          [(ngModel)]="rawXmlValue"
          (ngModelChange)="onInput($event)"
          placeholder="Cole seu XML aqui..."
          spellcheck="false"
        ></textarea>
      </div>

      <div class="card output-panel">
        <div class="panel-header">
          <div class="toggle-group">
            <button [class.active]="viewMode() === 'formatted'" (click)="viewMode.set('formatted')">
              <span class="material-icons-round">format_indent_increase</span>
              Formatado
            </button>
            <button [class.active]="viewMode() === 'escaped'" (click)="viewMode.set('escaped')">
              <span class="material-icons-round">data_object</span>
              Escapado (JSON)
            </button>
          </div>

          <div class="panel-actions">
            @if (outputContent()) {
              <button class="btn btn-secondary btn-sm" (click)="copyOutput()">
                <span class="material-icons-round">{{ copied() ? 'check' : 'content_copy' }}</span>
                {{ copied() ? 'Copiado!' : 'Copiar' }}
              </button>
            }
          </div>
        </div>

        @if (error()) {
          <div class="error-box fade-in">
            <span class="material-icons-round">error</span>
            <div>
              <strong>XML inválido</strong>
              <p>{{ error() }}</p>
            </div>
          </div>
        } @else if (outputContent()) {
          <pre class="output-pre fade-in"><code>{{ outputContent() }}</code></pre>
        } @else {
          <div class="empty-state">
            <span class="material-icons-round">code</span>
            <p>O resultado aparecerá aqui</p>
          </div>
        }
      </div>
    </div>

    @if (viewMode() === 'escaped' && outputContent()) {
      <div class="card hint-card fade-in">
        <span class="material-icons-round">lightbulb</span>
        <p>O XML está escapado e pode ser usado como valor de propriedade em um JSON: <code>&#123;"xml": "..."&#125;</code></p>
      </div>
    }
  `,
  styles: [`
    .editor-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;

      @media (max-width: 700px) {
        grid-template-columns: 1fr;
      }
    }

    .input-panel, .output-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 420px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;

      .toggle-group button {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        .material-icons-round { font-size: 14px !important; }
      }
    }

    .panel-actions {
      display: flex;
      gap: 6px;
    }

    .xml-textarea {
      flex: 1;
      min-height: 340px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
    }

    .output-pre {
      flex: 1;
      overflow: auto;
      background: var(--surface-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 14px;
      margin: 0;

      code {
        font-family: 'Courier New', monospace;
        font-size: 12.5px;
        color: var(--text-primary);
        white-space: pre;
        line-height: 1.6;
      }
    }

    .error-box {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-sm);
      padding: 14px;
      color: #991b1b;

      .material-icons-round { flex-shrink: 0; font-size: 18px !important; }

      strong { display: block; margin-bottom: 4px; font-size: 13px; }
      p { font-size: 12px; opacity: .8; }
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

    .hint-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: var(--accent-light);
      border-color: #6ee7b7;
      color: #065f46;
      font-size: 13px;

      .material-icons-round { font-size: 18px !important; flex-shrink: 0; color: var(--accent); }

      code {
        font-family: 'Courier New', monospace;
        background: rgba(0,0,0,.06);
        padding: 1px 4px;
        border-radius: 3px;
      }
    }
  `]
})
export class XmlFormatterComponent {
  rawXml = signal('');
  rawXmlValue = '';
  viewMode = signal<ViewMode>('formatted');
  error = signal('');
  formattedXml = signal('');
  copied = signal(false);

  outputContent = computed(() => {
    const formatted = this.formattedXml();
    if (!formatted) return '';
    return this.viewMode() === 'formatted' ? formatted : this.escapeXml(formatted);
  });

  onInput(value: string): void {
    this.rawXml.set(value);
    this.error.set('');
    this.formattedXml.set('');
    if (!value.trim()) return;
    try {
      this.formattedXml.set(this.formatXml(value.trim()));
    } catch (e: any) {
      this.error.set(e.message || 'Erro ao processar XML.');
    }
  }

  private formatXml(xml: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error(parseError.textContent?.split('\n')[0] ?? 'XML inválido');
    }
    return this.serializeNode(doc.documentElement, 0);
  }

  private serializeNode(node: Node, depth: number): string {
    const indent = '  '.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').trim();
      return text ? text : '';
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attrs = Array.from(el.attributes)
        .map(a => ` ${a.name}="${a.value}"`)
        .join('');
      const children = Array.from(el.childNodes)
        .map(c => this.serializeNode(c, depth + 1))
        .filter(s => s.trim());

      if (children.length === 0) return `${indent}<${el.tagName}${attrs}/>`;
      if (children.length === 1 && !children[0].includes('\n')) {
        return `${indent}<${el.tagName}${attrs}>${children[0]}</${el.tagName}>`;
      }
      return `${indent}<${el.tagName}${attrs}>\n${children.map(c => c.startsWith(' ') || c.startsWith('<') ? c : `${'  '.repeat(depth + 1)}${c}`).join('\n')}\n${indent}</${el.tagName}>`;
    }
    return '';
  }

  private escapeXml(xml: string): string {
    return xml
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r\n/g, '\\n')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  copyOutput(): void {
    const content = this.outputContent();
    if (!content) return;
    navigator.clipboard.writeText(content);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  clear(): void {
    this.rawXmlValue = '';
    this.rawXml.set('');
    this.formattedXml.set('');
    this.error.set('');
  }

  async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.rawXmlValue = text;
      this.onInput(text);
    } catch {
      // clipboard read blocked — user can paste manually
    }
  }
}
