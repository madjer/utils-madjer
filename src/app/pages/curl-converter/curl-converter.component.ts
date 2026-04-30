import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

function parseCurl(cmd: string): ParsedCurl {
  // Normalize line continuations
  const raw = cmd.replace(/\\\n/g, ' ').trim();
  let method = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let body: string | null = null;

  // Extract URL (first non-flag argument or after --url)
  const urlMatch = raw.match(/curl\s+(?:['"](https?:\/\/[^'"]+)['"]|(https?:\/\/\S+))/);
  if (urlMatch) url = urlMatch[1] ?? urlMatch[2] ?? '';

  // --url
  const urlFlag = raw.match(/--url\s+['"]?([^'" ]+)['"]?/);
  if (urlFlag) url = urlFlag[1];

  // -X / --request
  const methodMatch = raw.match(/(?:-X|--request)\s+([A-Z]+)/);
  if (methodMatch) method = methodMatch[1];

  // -H / --header
  const headerRe = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let hm;
  while ((hm = headerRe.exec(raw)) !== null) {
    const idx = hm[1].indexOf(':');
    if (idx > 0) headers[hm[1].slice(0, idx).trim()] = hm[1].slice(idx + 1).trim();
  }

  // -d / --data / --data-raw / --data-binary
  const dataMatch = raw.match(/(?:-d|--data(?:-raw|-binary)?)\s+['"]([^'"]*)['"]/s);
  if (dataMatch) {
    body = dataMatch[1];
    if (!methodMatch) method = 'POST';
  }

  return { method, url, headers, body };
}

function toFetch(p: ParsedCurl): string {
  const opts: string[] = [`  method: '${p.method}'`];
  if (Object.keys(p.headers).length) {
    const h = Object.entries(p.headers).map(([k, v]) => `    '${k}': '${v}'`).join(',\n');
    opts.push(`  headers: {\n${h}\n  }`);
  }
  if (p.body) opts.push(`  body: ${JSON.stringify(p.body)}`);
  const hasOpts = opts.length > 1 || p.method !== 'GET';
  return `const response = await fetch('${p.url}'${hasOpts ? `, {\n${opts.join(',\n')}\n}` : ''});\nconst data = await response.json();\nconsole.log(data);`;
}

function toAxios(p: ParsedCurl): string {
  const cfg: string[] = [];
  if (Object.keys(p.headers).length) {
    const h = Object.entries(p.headers).map(([k, v]) => `    '${k}': '${v}'`).join(',\n');
    cfg.push(`  headers: {\n${h}\n  }`);
  }
  const method = p.method.toLowerCase();
  if (p.body) {
    cfg.push(`  data: ${JSON.stringify(p.body)}`);
  }
  const cfgStr = cfg.length ? `, {\n${cfg.join(',\n')}\n}` : '';
  if (['get', 'delete', 'head'].includes(method)) {
    return `const { data } = await axios.${method}('${p.url}'${cfgStr});\nconsole.log(data);`;
  }
  return `const { data } = await axios.${method}('${p.url}', ${p.body ? JSON.stringify(p.body) : 'null'}${cfgStr ? ', ' + cfgStr.slice(2) : ''});\nconsole.log(data);`;
}

function toPython(p: ParsedCurl): string {
  const lines = ['import requests', ''];
  const h = Object.entries(p.headers);
  if (h.length) {
    lines.push('headers = {');
    h.forEach(([k, v]) => lines.push(`    '${k}': '${v}',`));
    lines.push('}', '');
  }
  const hArg = h.length ? ', headers=headers' : '';
  if (p.body) {
    lines.push(`data = ${JSON.stringify(p.body)}`, '');
    lines.push(`response = requests.${p.method.toLowerCase()}('${p.url}'${hArg}, data=data)`);
  } else {
    lines.push(`response = requests.${p.method.toLowerCase()}('${p.url}'${hArg})`);
  }
  lines.push('print(response.json())');
  return lines.join('\n');
}

@Component({
  selector: 'app-curl-converter',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">cURL → Código</h1>
    <p class="page-subtitle">Converta comandos cURL em código fetch, Axios ou Python requests.</p>

    <mat-card>
      <mat-card-content>
        <mat-form-field appearance="outline" style="width:100%">
          <mat-label>Comando cURL</mat-label>
          <textarea matInput [(ngModel)]="rawValue" (ngModelChange)="convert()"
            rows="6" spellcheck="false" class="mono-textarea"
            placeholder="curl -X POST 'https://api.exemplo.com/dados' -H 'Content-Type: application/json' -d '&#123;&quot;chave&quot;: &quot;valor&quot;&#125;'">
          </textarea>
        </mat-form-field>
        <button mat-stroked-button (click)="clear()"><mat-icon>clear</mat-icon> Limpar</button>
      </mat-card-content>
    </mat-card>

    @if (error()) {
      <div class="error-box" style="margin-top:12px">
        <mat-icon>error</mat-icon>
        <span>{{ error() }}</span>
      </div>
    }

    @if (parsed()) {
      <mat-card style="margin-top:12px">
        <mat-card-content>
          <div class="meta-row">
            <span class="method-badge">{{ parsed()!.method }}</span>
            <span class="url-text">{{ parsed()!.url }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="toggle-row">
        <mat-button-toggle-group [ngModel]="lang()" (ngModelChange)="lang.set($event)">
          <mat-button-toggle value="fetch">fetch</mat-button-toggle>
          <mat-button-toggle value="axios">Axios</mat-button-toggle>
          <mat-button-toggle value="python">Python</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ langLabel() }}</mat-card-title>
          <button mat-icon-button (click)="copy()"><mat-icon>content_copy</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <pre class="output-pre">{{ output() }}</pre>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .mono-textarea { font-family: 'Courier New', monospace; font-size: 13px; }
    .error-box { display: flex; align-items: center; gap: 8px; color: var(--mat-sys-error); font-size: 14px; }
    .meta-row { display: flex; align-items: center; gap: 12px; }
    .method-badge { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-radius: 6px; padding: 4px 12px; font-size: 13px; font-weight: 700; }
    .url-text { font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all; color: var(--mat-sys-on-surface); }
    .toggle-row { margin: 16px 0 12px; }
    .output-pre { font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-word; margin: 0; max-height: 360px; overflow-y: auto; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
  `]
})
export class CurlConverterComponent {
  rawValue = '';
  lang = signal<'fetch' | 'axios' | 'python'>('fetch');
  parsed = signal<ParsedCurl | null>(null);
  error = signal('');

  constructor(private snackBar: MatSnackBar) {}

  langLabel(): string {
    return { fetch: 'JavaScript (fetch)', axios: 'JavaScript (Axios)', python: 'Python (requests)' }[this.lang()];
  }

  output(): string {
    const p = this.parsed();
    if (!p) return '';
    if (this.lang() === 'fetch')  return toFetch(p);
    if (this.lang() === 'axios')  return toAxios(p);
    return toPython(p);
  }

  convert(): void {
    this.error.set('');
    if (!this.rawValue.trim()) { this.parsed.set(null); return; }
    try {
      if (!this.rawValue.trim().startsWith('curl')) throw new Error('O comando deve começar com "curl".');
      this.parsed.set(parseCurl(this.rawValue));
    } catch (e: any) {
      this.error.set(e.message);
      this.parsed.set(null);
    }
  }

  clear(): void { this.rawValue = ''; this.parsed.set(null); this.error.set(''); }

  copy(): void {
    navigator.clipboard.writeText(this.output());
    this.snackBar.open('Copiado!', '', { duration: 2000 });
  }
}
