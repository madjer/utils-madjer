import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoPageModule, PoButtonModule, PoContainerModule, PoDividerModule,
  PoRadioGroupModule, PoFieldModule, PoTagModule, PoNotificationService,
  PoRadioGroupOption, PoCheckboxGroupOption
} from '@po-ui/ng-components';

@Component({
  selector: 'app-text-formatter',
  standalone: true,
  imports: [FormsModule, PoPageModule, PoButtonModule, PoContainerModule, PoDividerModule, PoRadioGroupModule, PoFieldModule, PoTagModule],
  providers: [PoNotificationService],
  template: `
    <po-page-default p-title="Formatador de Texto">
      <p class="page-subtitle">Cole um texto, selecione as transformações desejadas e veja o resultado em tempo real.</p>

      <div class="formatter-layout">
        <div class="options-sticky">
          <po-container p-title="Transformações">
            <po-radio-group p-label="Capitalização" [p-options]="capitalizationOptions"
              [ngModel]="capitalization()" (ngModelChange)="capitalization.set($event)" [p-columns]="1">
            </po-radio-group>

            <po-divider></po-divider>

            <po-checkbox-group p-label="Espaços e Linhas" [p-options]="spaceOptions"
              [ngModel]="selectedSpaces()" (ngModelChange)="selectedSpaces.set($event)" [p-columns]="1">
            </po-checkbox-group>

            <po-divider></po-divider>

            <po-checkbox-group p-label="Caracteres" [p-options]="charOptions"
              [ngModel]="selectedChars()" (ngModelChange)="selectedChars.set($event)" [p-columns]="1">
            </po-checkbox-group>

            <po-divider></po-divider>

            <po-button p-label="Limpar seleções" p-icon="ph ph-arrow-counter-clockwise"
              p-kind="secondary" style="width:100%" (p-click)="resetAll()">
            </po-button>
          </po-container>
        </div>

        <div class="main-panel">
          <po-container p-title="Texto de entrada">
            <div class="panel-header">
              <span class="char-badge">{{ inputText().length }} chars</span>
              <po-button p-label="Limpar" p-icon="ph ph-eraser" p-kind="secondary" p-size="small"
                (p-click)="inputText.set('')" [p-disabled]="!inputText()">
              </po-button>
            </div>
            <po-textarea p-label="" [ngModel]="inputText()" (ngModelChange)="inputText.set($event)"
              p-placeholder="Cole seu texto aqui..." [p-rows]="8">
            </po-textarea>
          </po-container>

          @if (activeCount() > 0) {
            <div class="active-chips">
              @for (label of activeLabels(); track label) {
                <po-tag [p-value]="label" p-color="color-01"></po-tag>
              }
            </div>
          }

          <po-container p-title="Resultado">
            <div class="panel-header">
              <span class="char-badge">{{ outputText().length }} chars</span>
              @if (outputText()) {
                <po-button p-label="Copiar" p-icon="ph ph-copy" p-kind="secondary" p-size="small" (p-click)="copyOutput()"></po-button>
              }
            </div>
            @if (outputText()) {
              <pre class="output-pre output-pre-wrap">{{ outputText() }}</pre>
            } @else if (inputText()) {
              <div class="empty-state">
                <span class="ph ph-sliders" style="font-size:32px;opacity:.3"></span>
                <p>Selecione ao menos uma transformação</p>
              </div>
            } @else {
              <div class="empty-state">
                <span class="ph ph-text-t" style="font-size:32px;opacity:.3"></span>
                <p>O resultado aparecerá aqui</p>
              </div>
            }
          </po-container>
        </div>
      </div>
    </po-page-default>
  `,
  styles: [`
    .main-panel { display:flex;flex-direction:column;gap:12px }
    .empty-state {
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;padding:32px 0;gap:8px;
      color:var(--color-neutral-mid-40); p{font-size:13px}
    }
  `]
})
export class TextFormatterComponent {
  inputText = signal('');
  capitalization = signal('');
  selectedSpaces = signal<string[]>([]);
  selectedChars = signal<string[]>([]);

  capitalizationOptions: PoRadioGroupOption[] = [
    { label: 'UPPER CASE',      value: 'upper' },
    { label: 'lower case',      value: 'lower' },
    { label: 'Capitalize Words', value: 'capitalize' },
    { label: 'Sentence case',   value: 'sentence' },
  ];

  spaceOptions: PoCheckboxGroupOption[] = [
    { label: 'Remover espaços nas bordas',  value: 'trim' },
    { label: 'Remover espaços duplos',      value: 'remove_extra_spaces' },
    { label: 'Remover quebras de linha',    value: 'remove_newlines' },
    { label: 'Remover linhas vazias',       value: 'remove_empty_lines' },
    { label: 'Ordenar linhas (A → Z)',      value: 'sort_lines' },
    { label: 'Remover linhas duplicadas',   value: 'dedupe_lines' },
  ];

  charOptions: PoCheckboxGroupOption[] = [
    { label: 'Remover acentos',             value: 'remove_accents' },
    { label: 'Remover caracteres especiais',value: 'remove_special' },
    { label: 'Remover números',             value: 'remove_numbers' },
    { label: 'Remover pontuação',           value: 'remove_punctuation' },
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
    const input = this.inputText();
    if (!input || this.activeCount() === 0) return '';
    return this.applyTransformations(input);
  });

  constructor(private notification: PoNotificationService) {}

  private applyTransformations(text: string): string {
    let r = text;
    const active = new Set([...this.selectedSpaces(), ...this.selectedChars()]);

    if (active.has('trim'))               r = r.split('\n').map(l => l.trim()).join('\n');
    if (active.has('remove_extra_spaces'))r = r.replace(/ {2,}/g, ' ');
    if (active.has('remove_empty_lines')) r = r.split('\n').filter(l => l.trim() !== '').join('\n');
    if (active.has('remove_newlines'))    r = r.replace(/\r?\n/g, ' ').replace(/ {2,}/g, ' ').trim();
    if (active.has('sort_lines'))         r = r.split('\n').sort((a, b) => a.localeCompare(b, 'pt')).join('\n');
    if (active.has('dedupe_lines'))       r = [...new Set(r.split('\n'))].join('\n');
    if (active.has('remove_accents'))     r = r.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (active.has('remove_punctuation')) r = r.replace(/[.,;:!?"'()\[\]{}\-–—]/g, '');
    if (active.has('remove_special'))     r = r.replace(/[^a-zA-ZÀ-ÿ0-9 \n\r\t]/g, '');
    if (active.has('remove_numbers'))     r = r.replace(/[0-9]/g, '');

    const cap = this.capitalization();
    if (cap === 'upper')      r = r.toLocaleUpperCase('pt-BR');
    else if (cap === 'lower') r = r.toLocaleLowerCase('pt-BR');
    else if (cap === 'capitalize') r = r.replace(/\b\w/g, c => c.toLocaleUpperCase('pt-BR'));
    else if (cap === 'sentence')   r = r.replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toLocaleUpperCase('pt-BR'));

    return r;
  }

  copyOutput(): void {
    const text = this.outputText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.notification.success({ message: 'Texto copiado!', duration: 2000 });
  }

  resetAll(): void {
    this.capitalization.set('');
    this.selectedSpaces.set([]);
    this.selectedChars.set([]);
  }
}
