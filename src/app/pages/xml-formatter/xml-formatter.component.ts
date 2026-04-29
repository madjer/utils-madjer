import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

type ViewMode = 'formatted' | 'escaped';

@Component({
  selector: 'app-xml-formatter',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Formatador de XML</h1>
    <p class="page-subtitle">Cole um XML, visualize formatado e opcionalmente escape como string JSON.</p>

    <div class="editor-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>XML de entrada</mat-card-title>
          <button mat-icon-button (click)="clear()" [disabled]="!rawXml()" matSuffix>
            <mat-icon>clear</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <textarea matInput [(ngModel)]="rawXmlValue" (ngModelChange)="onInput($event)"
              placeholder="Cole seu XML aqui..." rows="16" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <div class="output-header">
            <mat-button-toggle-group [ngModel]="viewMode()" (ngModelChange)="viewMode.set($event)">
              <mat-button-toggle value="formatted">Formatado</mat-button-toggle>
              <mat-button-toggle value="escaped">Escapado (JSON)</mat-button-toggle>
            </mat-button-toggle-group>
            @if (outputContent()) {
              <button mat-icon-button (click)="copyOutput()">
                <mat-icon>content_copy</mat-icon>
              </button>
            }
          </div>
        </mat-card-header>
        <mat-card-content>
          @if (error()) {
            <div class="error-box">
              <mat-icon>error</mat-icon>
              <div>
                <strong>XML inválido</strong>
                <p>{{ error() }}</p>
              </div>
            </div>
          } @else if (outputContent()) {
            <pre class="output-pre">{{ outputContent() }}</pre>
          } @else {
            <div class="empty-state">
              <mat-icon>code</mat-icon>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>

    @if (viewMode() === 'escaped' && outputContent()) {
      <div class="info-note">
        <mat-icon>lightbulb</mat-icon>
        <span>XML escapado — use como valor em JSON: <code>&#123;"xml": "..."&#125;</code></span>
      </div>
    }
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .output-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.5; }
    .error-box {
      display: flex; gap: 10px; align-items: flex-start; padding: 14px;
      background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container);
      border-radius: 8px;
      strong { display: block; margin-bottom: 4px; font-size: 13px; }
      p { font-size: 12px; opacity: .8; margin: 0; }
      mat-icon { flex-shrink: 0; }
    }
    code { font-family: 'Courier New', monospace; background: rgba(0,0,0,.08); padding: 1px 4px; border-radius: 3px; }
  `]
})
export class XmlFormatterComponent {
  rawXml = signal('');
  rawXmlValue = '';
  viewMode = signal<ViewMode>('formatted');
  error = signal('');
  formattedXml = signal('');

  outputContent = computed(() => {
    const f = this.formattedXml();
    if (!f) return '';
    return this.viewMode() === 'formatted' ? f : this.escapeXml(f);
  });

  constructor(private snackBar: MatSnackBar) {}

  onInput(value: string): void {
    this.rawXml.set(value);
    this.error.set('');
    this.formattedXml.set('');
    if (!value.trim()) return;
    try { this.formattedXml.set(this.formatXml(value.trim())); }
    catch (e: any) { this.error.set(e.message || 'Erro ao processar XML.'); }
  }

  private formatXml(xml: string): string {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) throw new Error(err.textContent?.split('\n')[0] ?? 'XML inválido');
    return this.serializeNode(doc.documentElement, 0);
  }

  private serializeNode(node: Node, depth: number): string {
    const indent = '  '.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').trim();
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const attrs = Array.from(el.attributes).map(a => ` ${a.name}="${a.value}"`).join('');
      const children = Array.from(el.childNodes).map(c => this.serializeNode(c, depth + 1)).filter(s => s.trim());
      if (!children.length) return `${indent}<${el.tagName}${attrs}/>`;
      if (children.length === 1 && !children[0].includes('\n')) return `${indent}<${el.tagName}${attrs}>${children[0]}</${el.tagName}>`;
      return `${indent}<${el.tagName}${attrs}>\n${children.map(c => c.startsWith('<') ? c : `${'  '.repeat(depth+1)}${c}`).join('\n')}\n${indent}</${el.tagName}>`;
    }
    return '';
  }

  private escapeXml(xml: string): string {
    return xml.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      .replace(/\r\n/g, '\\n').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  }

  copyOutput(): void {
    navigator.clipboard.writeText(this.outputContent());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }

  clear(): void { this.rawXmlValue = ''; this.rawXml.set(''); this.formattedXml.set(''); this.error.set(''); }
}
