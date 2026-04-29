import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-text-formatter',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatCheckboxModule, MatFormFieldModule, MatInputModule, MatIconModule,
            MatChipsModule, MatDividerModule],
  providers: [MatSnackBar],
  template: `
    <h1 class="page-title">Formatador de Texto</h1>
    <p class="page-subtitle">Cole um texto, selecione as transformações e veja o resultado em tempo real.</p>

    <div class="formatter-layout">
      <!-- Options panel -->
      <div class="options-sticky">
        <mat-card>
          <mat-card-header><mat-card-title>Transformações</mat-card-title></mat-card-header>
          <mat-card-content>
            <p class="option-group-label">Capitalização</p>
            <mat-button-toggle-group [ngModel]="capitalization()" (ngModelChange)="capitalization.set($event)"
              style="flex-direction:column;width:100%;align-items:stretch">
              @for (opt of capitalizationOptions; track opt.value) {
                <mat-button-toggle [value]="opt.value" style="text-align:left">{{ opt.label }}</mat-button-toggle>
              }
            </mat-button-toggle-group>

            <mat-divider style="margin: 16px 0"></mat-divider>
            <p class="option-group-label">Espaços e Linhas</p>
            @for (opt of spaceOptions; track opt.value) {
              <mat-checkbox [checked]="selectedSpaces().includes(opt.value)"
                (change)="toggleSpace(opt.value, $event.checked)">
                {{ opt.label }}
              </mat-checkbox>
            }

            <mat-divider style="margin: 16px 0"></mat-divider>
            <p class="option-group-label">Caracteres</p>
            @for (opt of charOptions; track opt.value) {
              <mat-checkbox [checked]="selectedChars().includes(opt.value)"
                (change)="toggleChar(opt.value, $event.checked)">
                {{ opt.label }}
              </mat-checkbox>
            }

            <mat-divider style="margin: 16px 0"></mat-divider>
            <button mat-stroked-button style="width:100%" (click)="resetAll()">
              <mat-icon>restart_alt</mat-icon> Limpar seleções
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main panel -->
      <div class="main-panel">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Texto de entrada</mat-card-title>
            <div class="header-actions">
              <span class="char-badge">{{ inputText().length }} chars</span>
              <button mat-icon-button (click)="inputText.set('')" [disabled]="!inputText()">
                <mat-icon>clear</mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" style="width:100%">
              <textarea matInput [ngModel]="inputText()" (ngModelChange)="inputText.set($event)"
                placeholder="Cole seu texto aqui..." [rows]="8" spellcheck="false">
              </textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        @if (activeCount() > 0) {
          <mat-chip-set class="active-chips">
            @for (label of activeLabels(); track label) {
              <mat-chip>{{ label }}</mat-chip>
            }
          </mat-chip-set>
        }

        <mat-card>
          <mat-card-header>
            <mat-card-title>Resultado</mat-card-title>
            <div class="header-actions">
              <span class="char-badge">{{ outputText().length }} chars</span>
              @if (outputText()) {
                <button mat-icon-button (click)="copyOutput()"><mat-icon>content_copy</mat-icon></button>
              }
            </div>
          </mat-card-header>
          <mat-card-content>
            @if (outputText()) {
              <pre class="output-pre output-pre-wrap">{{ outputText() }}</pre>
            } @else if (inputText()) {
              <div class="empty-state">
                <mat-icon>tune</mat-icon>
                <p>Selecione ao menos uma transformação</p>
              </div>
            } @else {
              <div class="empty-state">
                <mat-icon>text_fields</mat-icon>
                <p>O resultado aparecerá aqui</p>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .option-group-label { font-size: 11px; font-weight: 700; color: var(--mat-sys-on-surface-variant); text-transform: uppercase; letter-spacing: .6px; margin: 0 0 8px; }
    .header-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .char-badge { font-size: 11px; color: var(--mat-sys-on-surface-variant); background: var(--mat-sys-surface-container); border: 1px solid var(--mat-sys-outline-variant); border-radius: 20px; padding: 2px 8px; }
    mat-checkbox { display: flex; margin: 2px 0; }
    .main-panel { display: flex; flex-direction: column; gap: 12px; }
  `]
})
export class TextFormatterComponent {
  inputText = signal('');
  capitalization = signal('');
  selectedSpaces = signal<string[]>([]);
  selectedChars = signal<string[]>([]);

  capitalizationOptions = [
    { label: 'UPPER CASE',       value: 'upper' },
    { label: 'lower case',       value: 'lower' },
    { label: 'Capitalize Words', value: 'capitalize' },
    { label: 'Sentence case',    value: 'sentence' },
  ];

  spaceOptions = [
    { label: 'Remover espaços nas bordas',  value: 'trim' },
    { label: 'Remover espaços duplos',      value: 'remove_extra_spaces' },
    { label: 'Remover quebras de linha',    value: 'remove_newlines' },
    { label: 'Remover linhas vazias',       value: 'remove_empty_lines' },
    { label: 'Ordenar linhas (A → Z)',      value: 'sort_lines' },
    { label: 'Remover linhas duplicadas',   value: 'dedupe_lines' },
  ];

  charOptions = [
    { label: 'Remover acentos',              value: 'remove_accents' },
    { label: 'Remover caracteres especiais', value: 'remove_special' },
    { label: 'Remover números',              value: 'remove_numbers' },
    { label: 'Remover pontuação',            value: 'remove_punctuation' },
  ];

  activeCount = computed(() =>
    (this.capitalization() ? 1 : 0) + this.selectedSpaces().length + this.selectedChars().length
  );

  activeLabels = computed((): string[] => {
    const labels: string[] = [];
    if (this.capitalization()) {
      const opt = this.capitalizationOptions.find(o => o.value === this.capitalization());
      if (opt) labels.push(opt.label);
    }
    [...this.selectedSpaces(), ...this.selectedChars()].forEach(v => {
      const opt = [...this.spaceOptions, ...this.charOptions].find(o => o.value === v);
      if (opt) labels.push(opt.label);
    });
    return labels;
  });

  outputText = computed(() => {
    if (!this.inputText() || this.activeCount() === 0) return '';
    return this.applyTransformations(this.inputText());
  });

  constructor(private snackBar: MatSnackBar) {}

  toggleSpace(value: string, checked: boolean): void {
    this.selectedSpaces.update(arr => checked ? [...arr, value] : arr.filter(v => v !== value));
  }

  toggleChar(value: string, checked: boolean): void {
    this.selectedChars.update(arr => checked ? [...arr, value] : arr.filter(v => v !== value));
  }

  private applyTransformations(text: string): string {
    let r = text;
    const active = new Set([...this.selectedSpaces(), ...this.selectedChars()]);
    if (active.has('trim'))                r = r.split('\n').map(l => l.trim()).join('\n');
    if (active.has('remove_extra_spaces')) r = r.replace(/ {2,}/g, ' ');
    if (active.has('remove_empty_lines'))  r = r.split('\n').filter(l => l.trim() !== '').join('\n');
    if (active.has('remove_newlines'))     r = r.replace(/\r?\n/g, ' ').replace(/ {2,}/g, ' ').trim();
    if (active.has('sort_lines'))          r = r.split('\n').sort((a, b) => a.localeCompare(b, 'pt')).join('\n');
    if (active.has('dedupe_lines'))        r = [...new Set(r.split('\n'))].join('\n');
    if (active.has('remove_accents'))      r = r.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (active.has('remove_punctuation'))  r = r.replace(/[.,;:!?"'()\[\]{}\-–—]/g, '');
    if (active.has('remove_special'))      r = r.replace(/[^a-zA-ZÀ-ÿ0-9 \n\r\t]/g, '');
    if (active.has('remove_numbers'))      r = r.replace(/[0-9]/g, '');
    const cap = this.capitalization();
    if (cap === 'upper')      r = r.toLocaleUpperCase('pt-BR');
    else if (cap === 'lower') r = r.toLocaleLowerCase('pt-BR');
    else if (cap === 'capitalize') r = r.replace(/\b\w/g, c => c.toLocaleUpperCase('pt-BR'));
    else if (cap === 'sentence')   r = r.replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toLocaleUpperCase('pt-BR'));
    return r;
  }

  copyOutput(): void {
    navigator.clipboard.writeText(this.outputText());
    this.snackBar.open('Texto copiado!', '', { duration: 2000 });
  }

  resetAll(): void { this.capitalization.set(''); this.selectedSpaces.set([]); this.selectedChars.set([]); }
}
