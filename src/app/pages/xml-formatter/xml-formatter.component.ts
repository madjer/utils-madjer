import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoPageModule, PoButtonModule, PoRadioGroupModule,
  PoContainerModule, PoDividerModule, PoNotificationService,
  PoRadioGroupOption, PoFieldModule
} from '@po-ui/ng-components';

type ViewMode = 'formatted' | 'escaped';

@Component({
  selector: 'app-xml-formatter',
  standalone: true,
  imports: [FormsModule, PoPageModule, PoButtonModule, PoRadioGroupModule, PoContainerModule, PoDividerModule, PoFieldModule],
  providers: [PoNotificationService],
  template: `
    <po-page-default p-title="Formatador de XML">
      <p class="page-subtitle">Cole um XML, visualize formatado e opcionalmente escape como string JSON.</p>

      <div class="editor-grid">
        <po-container p-title="XML de entrada">
          <div class="panel-header">
            <span></span>
            <po-button p-label="Limpar" p-icon="ph ph-eraser" p-kind="secondary" p-size="small"
              (p-click)="clear()" [p-disabled]="!rawXml()">
            </po-button>
          </div>
          <po-textarea p-label="" [(ngModel)]="rawXmlValue" (ngModelChange)="onInput($event)"
            p-placeholder="Cole seu XML aqui..." [p-rows]="16">
          </po-textarea>
        </po-container>

        <po-container p-title="Resultado">
          <div class="panel-header">
            <po-radio-group [p-options]="viewOptions" [ngModel]="viewMode()"
              (ngModelChange)="viewMode.set($event)" [p-columns]="2">
            </po-radio-group>
            @if (outputContent()) {
              <po-button p-label="Copiar" p-icon="ph ph-copy" p-kind="secondary" p-size="small" (p-click)="copyOutput()"></po-button>
            }
          </div>

          @if (error()) {
            <div class="error-box">
              <span class="ph ph-warning-circle"></span>
              <div>
                <strong>XML inválido</strong>
                <p>{{ error() }}</p>
              </div>
            </div>
          } @else if (outputContent()) {
            <pre class="output-pre">{{ outputContent() }}</pre>
          } @else {
            <div class="empty-state">
              <span class="ph ph-code" style="font-size:36px;opacity:.3"></span>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </po-container>
      </div>

      @if (viewMode() === 'escaped' && outputContent()) {
        <div class="info-note" style="margin-top:16px">
          <span class="ph ph-lightbulb"></span>
          O XML está escapado e pode ser usado como valor de propriedade em um JSON:
          <code style="font-family:monospace;background:rgba(0,0,0,.06);padding:1px 4px;border-radius:3px">&#123;"xml": "..."&#125;</code>
        </div>
      }
    </po-page-default>
  `,
  styles: [`
    .error-box {
      display: flex; gap: 10px; align-items: flex-start;
      background: var(--color-feedback-negative-lightest, #fef2f2);
      border: 1px solid var(--color-feedback-negative-base, #f87171);
      border-radius: 6px; padding: 14px;
      strong { display: block; margin-bottom: 4px; font-size: 13px; }
      p { font-size: 12px; opacity: .8; }
    }
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 48px 0; gap: 8px;
      color: var(--color-neutral-mid-40);
      p { font-size: 13px; }
    }
  `]
})
export class XmlFormatterComponent {
  rawXml = signal('');
  rawXmlValue = '';
  viewMode = signal<ViewMode>('formatted');
  error = signal('');
  formattedXml = signal('');

  viewOptions: PoRadioGroupOption[] = [
    { label: 'Formatado',      value: 'formatted' },
    { label: 'Escapado (JSON)', value: 'escaped' }
  ];

  outputContent = computed(() => {
    const formatted = this.formattedXml();
    if (!formatted) return '';
    return this.viewMode() === 'formatted' ? formatted : this.escapeXml(formatted);
  });

  constructor(private notification: PoNotificationService) {}

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
    if (parseError) throw new Error(parseError.textContent?.split('\n')[0] ?? 'XML inválido');
    return this.serializeNode(doc.documentElement, 0);
  }

  private serializeNode(node: Node, depth: number): string {
    const indent = '  '.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').trim();
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attrs = Array.from(el.attributes).map(a => ` ${a.name}="${a.value}"`).join('');
      const children = Array.from(el.childNodes).map(c => this.serializeNode(c, depth + 1)).filter(s => s.trim());
      if (children.length === 0) return `${indent}<${el.tagName}${attrs}/>`;
      if (children.length === 1 && !children[0].includes('\n')) return `${indent}<${el.tagName}${attrs}>${children[0]}</${el.tagName}>`;
      return `${indent}<${el.tagName}${attrs}>\n${children.map(c => c.startsWith('<') ? c : `${'  '.repeat(depth + 1)}${c}`).join('\n')}\n${indent}</${el.tagName}>`;
    }
    return '';
  }

  private escapeXml(xml: string): string {
    return xml.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      .replace(/\r\n/g, '\\n').replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  }

  copyOutput(): void {
    const content = this.outputContent();
    if (!content) return;
    navigator.clipboard.writeText(content);
    this.notification.success({ message: 'Copiado!', duration: 2000 });
  }

  clear(): void {
    this.rawXmlValue = '';
    this.rawXml.set('');
    this.formattedXml.set('');
    this.error.set('');
  }
}
