import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoPageModule, PoButtonModule, PoRadioGroupModule,
  PoContainerModule, PoDividerModule, PoNotificationService,
  PoRadioGroupOption, PoFieldModule
} from '@po-ui/ng-components';

type CnpjMode = 'normal' | 'alfanumerico';

@Component({
  selector: 'app-cnpj-generator',
  standalone: true,
  imports: [FormsModule, PoPageModule, PoButtonModule, PoRadioGroupModule, PoContainerModule, PoDividerModule, PoFieldModule],
  providers: [PoNotificationService],
  template: `
    <po-page-default p-title="Gerador de CNPJ">
      <p class="page-subtitle">Gera CNPJs válidos para uso em testes e ambientes de desenvolvimento.</p>

      <po-container>
        <div class="options-row">
          <po-radio-group p-label="Tipo de CNPJ" [p-options]="modeOptions"
            [ngModel]="mode()" (ngModelChange)="mode.set($event)" [p-columns]="2">
          </po-radio-group>
          <po-radio-group p-label="Formato" [p-options]="maskOptions"
            [ngModel]="withMask()" (ngModelChange)="withMask.set($event)" [p-columns]="2">
          </po-radio-group>
        </div>

        @if (mode() === 'alfanumerico') {
          <div class="info-note">
            <span class="ph ph-info"></span>
            CNPJ alfanumérico: os primeiros 8 caracteres podem conter letras e números (nova regra Receita Federal — vigência a partir de 2026).
          </div>
        }

        <po-divider p-label="Gerar"></po-divider>

        <div class="generate-row">
          <po-input p-label="Quantidade" [(ngModel)]="quantity" p-type="number" p-min="1" p-max="50" style="width:140px"></po-input>
          <po-button p-label="Gerar" p-icon="ph ph-arrows-clockwise" p-kind="primary" (p-click)="generate()"></po-button>
        </div>

        @if (results().length > 0) {
          <po-divider [p-label]="'Resultados (' + results().length + ')'"></po-divider>
          <div class="panel-header">
            <span></span>
            <po-button p-label="Copiar todos" p-icon="ph ph-copy" p-kind="secondary" p-size="small" (p-click)="copyAll()"></po-button>
          </div>
          <div class="result-list">
            @for (cnpj of results(); track cnpj; let i = $index) {
              <div class="result-row">
                <span class="result-index">{{ i + 1 }}</span>
                <span class="result-value result-mono">{{ cnpj }}</span>
                <po-button [p-icon]="copiedIndex() === i ? 'ph ph-check' : 'ph ph-copy'"
                  p-kind="secondary" p-size="small" (p-click)="copySingle(cnpj, i)">
                </po-button>
              </div>
            }
          </div>
        }
      </po-container>

      <po-container [p-no-border]="true">
        <p style="font-size:13px;color:var(--color-neutral-mid-60)">
          Os CNPJs são gerados com dígitos verificadores calculados conforme o algoritmo oficial da Receita Federal, sendo válidos para uso em ambientes de teste. <strong>Não use em produção.</strong>
        </p>
      </po-container>
    </po-page-default>
  `,
  styles: [`.options-row{display:flex;flex-wrap:wrap;gap:24px} .generate-row{display:flex;align-items:flex-end;gap:12px}`]
})
export class CnpjGeneratorComponent {
  mode = signal<CnpjMode>('normal');
  withMask = signal<string>('with');
  quantity = 5;
  results = signal<string[]>([]);
  copiedIndex = signal(-1);

  modeOptions: PoRadioGroupOption[] = [
    { label: 'Normal',       value: 'normal' },
    { label: 'Alfanumérico', value: 'alfanumerico' }
  ];

  maskOptions: PoRadioGroupOption[] = [
    { label: 'Com pontuação', value: 'with' },
    { label: 'Sem pontuação', value: 'without' }
  ];

  constructor(private notification: PoNotificationService) {}

  generate(): void {
    const list: string[] = [];
    for (let i = 0; i < Math.min(this.quantity, 50); i++) {
      list.push(this.mode() === 'normal' ? this.generateNormal() : this.generateAlfanumerico());
    }
    this.results.set(list);
    this.copiedIndex.set(-1);
  }

  private get useMask() { return this.withMask() === 'with'; }

  private generateNormal(): string {
    const nums = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
    nums.push(this.calcDigit(nums, [5,4,3,2,9,8,7,6,5,4,3,2]));
    nums.push(this.calcDigit(nums, [6,5,4,3,2,9,8,7,6,5,4,3,2]));
    const raw = nums.join('');
    return this.useMask ? this.applyMask(raw) : raw;
  }

  private generateAlfanumerico(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const base = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]);
    base.push(String(this.calcDigitAlfa(base, [5,4,3,2,9,8,7,6,5,4,3,2])));
    base.push(String(this.calcDigitAlfa(base, [6,5,4,3,2,9,8,7,6,5,4,3,2])));
    const raw = base.join('');
    return this.useMask ? this.applyMask(raw) : raw;
  }

  private calcDigit(nums: number[], weights: number[]): number {
    const sum = nums.slice(0, weights.length).reduce((acc, n, i) => acc + n * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  }

  private calcDigitAlfa(chars: string[], weights: number[]): number {
    const sum = chars.slice(0, weights.length).reduce((acc, c, i) => {
      const v = isNaN(Number(c)) ? c.charCodeAt(0) - 55 : Number(c);
      return acc + v * weights[i];
    }, 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  }

  private applyMask(raw: string): string {
    return `${raw.slice(0,2)}.${raw.slice(2,5)}.${raw.slice(5,8)}/${raw.slice(8,12)}-${raw.slice(12,14)}`;
  }

  copySingle(value: string, index: number): void {
    navigator.clipboard.writeText(value);
    this.copiedIndex.set(index);
    this.notification.success({ message: 'CNPJ copiado!', duration: 2000 });
    setTimeout(() => this.copiedIndex.set(-1), 1500);
  }

  copyAll(): void {
    navigator.clipboard.writeText(this.results().join('\n'));
    this.notification.success({ message: `${this.results().length} CNPJs copiados!`, duration: 2000 });
  }
}
