import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoPageModule, PoButtonModule, PoRadioGroupModule,
  PoContainerModule, PoDividerModule, PoNotificationService,
  PoRadioGroupOption, PoFieldModule
} from '@po-ui/ng-components';

@Component({
  selector: 'app-cpf-generator',
  standalone: true,
  imports: [FormsModule, PoPageModule, PoButtonModule, PoRadioGroupModule, PoContainerModule, PoDividerModule, PoFieldModule],
  providers: [PoNotificationService],
  template: `
    <po-page-default p-title="Gerador de CPF">
      <p class="page-subtitle">Gera CPFs válidos para uso em testes e ambientes de desenvolvimento.</p>

      <po-container>
        <po-radio-group p-label="Formato" [p-options]="maskOptions"
          [ngModel]="withMask()" (ngModelChange)="withMask.set($event)" [p-columns]="2">
        </po-radio-group>

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
            @for (cpf of results(); track cpf; let i = $index) {
              <div class="result-row">
                <span class="result-index">{{ i + 1 }}</span>
                <span class="result-value result-mono">{{ cpf }}</span>
                <po-button [p-icon]="copiedIndex() === i ? 'ph ph-check' : 'ph ph-copy'"
                  p-kind="secondary" p-size="small" (p-click)="copySingle(cpf, i)">
                </po-button>
              </div>
            }
          </div>
        }
      </po-container>

      <po-container [p-no-border]="true">
        <p style="font-size:13px;color:var(--color-neutral-mid-60)">
          Os CPFs são gerados com dígitos verificadores calculados conforme o algoritmo do Módulo 11, sendo válidos para uso em ambientes de teste. <strong>Não use em produção.</strong>
        </p>
      </po-container>
    </po-page-default>
  `,
  styles: [`.generate-row{display:flex;align-items:flex-end;gap:12px}`]
})
export class CpfGeneratorComponent {
  withMask = signal<string>('with');
  quantity = 5;
  results = signal<string[]>([]);
  copiedIndex = signal(-1);

  maskOptions: PoRadioGroupOption[] = [
    { label: 'Com pontuação', value: 'with' },
    { label: 'Sem pontuação', value: 'without' }
  ];

  constructor(private notification: PoNotificationService) {}

  generate(): void {
    const list: string[] = [];
    for (let i = 0; i < Math.min(this.quantity, 50); i++) {
      list.push(this.generateCpf());
    }
    this.results.set(list);
    this.copiedIndex.set(-1);
  }

  private generateCpf(): string {
    const nums = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    nums.push(this.calcDigit(nums, 10));
    nums.push(this.calcDigit(nums, 11));
    const raw = nums.join('');
    return this.withMask() === 'with'
      ? `${raw.slice(0,3)}.${raw.slice(3,6)}.${raw.slice(6,9)}-${raw.slice(9)}`
      : raw;
  }

  private calcDigit(nums: number[], factor: number): number {
    const sum = nums.reduce((acc, n, i) => acc + n * (factor - i), 0);
    const rem = (sum * 10) % 11;
    return rem >= 10 ? 0 : rem;
  }

  copySingle(value: string, index: number): void {
    navigator.clipboard.writeText(value);
    this.copiedIndex.set(index);
    this.notification.success({ message: 'CPF copiado!', duration: 2000 });
    setTimeout(() => this.copiedIndex.set(-1), 1500);
  }

  copyAll(): void {
    navigator.clipboard.writeText(this.results().join('\n'));
    this.notification.success({ message: `${this.results().length} CPFs copiados!`, duration: 2000 });
  }
}
