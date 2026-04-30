import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

function jsonToXml(obj: any, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    return obj.map(item => `${pad}<item>${typeof item === 'object' && item !== null ? '\n' + jsonToXml(item, indent + 1) + '\n' + pad : item}</item>`).join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).map(([k, v]) => {
      const tag = k.replace(/[^a-zA-Z0-9_\-.]/g, '_');
      if (Array.isArray(v)) {
        return `${pad}<${tag}>\n${v.map(item => `${'  '.repeat(indent + 1)}<item>${typeof item === 'object' ? '\n' + jsonToXml(item, indent + 2) + '\n' + '  '.repeat(indent + 1) : item}</item>`).join('\n')}\n${pad}</${tag}>`;
      }
      if (typeof v === 'object' && v !== null) {
        return `${pad}<${tag}>\n${jsonToXml(v, indent + 1)}\n${pad}</${tag}>`;
      }
      return `${pad}<${tag}>${v}</${tag}>`;
    }).join('\n');
  }
  return String(obj);
}

function xmlToJson(xml: string): any {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml.trim(), 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error(parseError.textContent ?? 'XML inválido');
  return nodeToJson(doc.documentElement);
}

function nodeToJson(node: Element): any {
  if (node.children.length === 0) return node.textContent ?? '';
  const result: Record<string, any> = {};
  for (const child of Array.from(node.children)) {
    const key = child.tagName;
    const val = nodeToJson(child);
    if (key in result) {
      if (!Array.isArray(result[key])) result[key] = [result[key]];
      result[key].push(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

@Component({
  selector: 'app-json-xml',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Conversor JSON ↔ XML</h1>
    <p class="page-subtitle">Converta dados entre os formatos JSON e XML.</p>

    <div class="toggle-row">
      <mat-button-toggle-group [ngModel]="direction()" (ngModelChange)="onDirectionChange($event)">
        <mat-button-toggle value="json-to-xml">JSON → XML</mat-button-toggle>
        <mat-button-toggle value="xml-to-json">XML → JSON</mat-button-toggle>
      </mat-button-toggle-group>
    </div>

    <div class="editor-grid">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ direction() === 'json-to-xml' ? 'JSON' : 'XML' }}</mat-card-title>
          <button mat-icon-button (click)="clear()"><mat-icon>clear</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%">
            <textarea matInput [(ngModel)]="rawValue" (ngModelChange)="convert()"
              [placeholder]="direction() === 'json-to-xml' ? 'Cole seu JSON aqui...' : 'Cole seu XML aqui...'"
              rows="18" spellcheck="false" class="mono-textarea">
            </textarea>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ direction() === 'json-to-xml' ? 'XML' : 'JSON' }}</mat-card-title>
          @if (output()) {
            <button mat-icon-button (click)="copy()"><mat-icon>content_copy</mat-icon></button>
          }
        </mat-card-header>
        <mat-card-content>
          @if (error()) {
            <div class="error-box">
              <mat-icon>error</mat-icon>
              <div><strong>Erro na conversão</strong><p>{{ error() }}</p></div>
            </div>
          } @else if (output()) {
            <pre class="output-pre">{{ output() }}</pre>
          } @else {
            <div class="empty-state">
              <mat-icon>swap_horiz</mat-icon>
              <p>O resultado aparecerá aqui</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .toggle-row { margin-bottom: 16px; }
    .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 800px) { .editor-grid { grid-template-columns: 1fr; } }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .output-pre { font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-all; margin: 0; max-height: 420px; overflow-y: auto; }
    .error-box { display: flex; gap: 10px; background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); border-radius: 8px; padding: 14px; mat-icon { flex-shrink: 0; } strong { display: block; margin-bottom: 4px; } p { font-size: 12px; margin: 0; } }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 200px; color: var(--mat-sys-on-surface-variant); mat-icon { font-size: 48px; width: 48px; height: 48px; } p { margin: 0; font-size: 14px; } }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
  `]
})
export class JsonXmlComponent {
  rawValue = '';
  direction = signal<'json-to-xml' | 'xml-to-json'>('json-to-xml');
  output = signal('');
  error = signal('');

  constructor(private snackBar: MatSnackBar) {}

  onDirectionChange(d: 'json-to-xml' | 'xml-to-json'): void {
    this.direction.set(d);
    this.rawValue = '';
    this.output.set('');
    this.error.set('');
  }

  convert(): void {
    this.error.set('');
    if (!this.rawValue.trim()) { this.output.set(''); return; }
    try {
      if (this.direction() === 'json-to-xml') {
        const parsed = JSON.parse(this.rawValue);
        const rootKey = typeof parsed === 'object' && !Array.isArray(parsed)
          ? Object.keys(parsed)[0] ?? 'root'
          : 'root';
        const inner = typeof parsed === 'object' && !Array.isArray(parsed)
          ? jsonToXml(parsed[rootKey] ?? parsed, 1)
          : jsonToXml(parsed, 1);
        this.output.set(`<?xml version="1.0" encoding="UTF-8"?>\n<${rootKey}>\n${inner}\n</${rootKey}>`);
      } else {
        const json = xmlToJson(this.rawValue);
        this.output.set(JSON.stringify(json, null, 2));
      }
    } catch (e: any) {
      this.error.set(e.message);
      this.output.set('');
    }
  }

  clear(): void { this.rawValue = ''; this.output.set(''); this.error.set(''); }

  copy(): void {
    navigator.clipboard.writeText(this.output());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }
}
