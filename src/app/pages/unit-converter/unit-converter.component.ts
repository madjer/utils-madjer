import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

type Category = 'length' | 'weight' | 'temperature' | 'data' | 'time';

interface UnitDef { id: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number; }

const UNITS: Record<Category, UnitDef[]> = {
  length: [
    { id: 'mm',  label: 'Milímetro (mm)',  toBase: v => v / 1000,       fromBase: v => v * 1000 },
    { id: 'cm',  label: 'Centímetro (cm)', toBase: v => v / 100,        fromBase: v => v * 100 },
    { id: 'm',   label: 'Metro (m)',        toBase: v => v,              fromBase: v => v },
    { id: 'km',  label: 'Quilômetro (km)', toBase: v => v * 1000,       fromBase: v => v / 1000 },
    { id: 'in',  label: 'Polegada (in)',    toBase: v => v * 0.0254,     fromBase: v => v / 0.0254 },
    { id: 'ft',  label: 'Pé (ft)',          toBase: v => v * 0.3048,     fromBase: v => v / 0.3048 },
    { id: 'mi',  label: 'Milha (mi)',       toBase: v => v * 1609.344,   fromBase: v => v / 1609.344 },
  ],
  weight: [
    { id: 'mg',  label: 'Miligrama (mg)',   toBase: v => v / 1e6,        fromBase: v => v * 1e6 },
    { id: 'g',   label: 'Grama (g)',        toBase: v => v / 1000,       fromBase: v => v * 1000 },
    { id: 'kg',  label: 'Quilograma (kg)',  toBase: v => v,              fromBase: v => v },
    { id: 't',   label: 'Tonelada (t)',     toBase: v => v * 1000,       fromBase: v => v / 1000 },
    { id: 'lb',  label: 'Libra (lb)',       toBase: v => v * 0.453592,   fromBase: v => v / 0.453592 },
    { id: 'oz',  label: 'Onça (oz)',        toBase: v => v * 0.0283495,  fromBase: v => v / 0.0283495 },
  ],
  temperature: [
    { id: 'c', label: 'Celsius (°C)',    toBase: v => v,                fromBase: v => v },
    { id: 'f', label: 'Fahrenheit (°F)', toBase: v => (v - 32) * 5/9,  fromBase: v => v * 9/5 + 32 },
    { id: 'k', label: 'Kelvin (K)',      toBase: v => v - 273.15,      fromBase: v => v + 273.15 },
  ],
  data: [
    { id: 'b',   label: 'Byte (B)',        toBase: v => v,              fromBase: v => v },
    { id: 'kb',  label: 'Kilobyte (KB)',   toBase: v => v * 1024,       fromBase: v => v / 1024 },
    { id: 'mb',  label: 'Megabyte (MB)',   toBase: v => v * 1024**2,    fromBase: v => v / 1024**2 },
    { id: 'gb',  label: 'Gigabyte (GB)',   toBase: v => v * 1024**3,    fromBase: v => v / 1024**3 },
    { id: 'tb',  label: 'Terabyte (TB)',   toBase: v => v * 1024**4,    fromBase: v => v / 1024**4 },
    { id: 'bit', label: 'Bit',             toBase: v => v / 8,          fromBase: v => v * 8 },
  ],
  time: [
    { id: 'ms',  label: 'Milissegundo',    toBase: v => v / 1000,       fromBase: v => v * 1000 },
    { id: 's',   label: 'Segundo',         toBase: v => v,              fromBase: v => v },
    { id: 'min', label: 'Minuto',          toBase: v => v * 60,         fromBase: v => v / 60 },
    { id: 'h',   label: 'Hora',            toBase: v => v * 3600,       fromBase: v => v / 3600 },
    { id: 'd',   label: 'Dia',             toBase: v => v * 86400,      fromBase: v => v / 86400 },
    { id: 'wk',  label: 'Semana',          toBase: v => v * 604800,     fromBase: v => v / 604800 },
  ],
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'length',      label: 'Comprimento', icon: 'straighten' },
  { id: 'weight',      label: 'Peso',        icon: 'monitor_weight' },
  { id: 'temperature', label: 'Temperatura', icon: 'thermostat' },
  { id: 'data',        label: 'Dados',       icon: 'storage' },
  { id: 'time',        label: 'Tempo',       icon: 'schedule' },
];

@Component({
  selector: 'app-unit-converter',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
            MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule],
  template: `
    <h1 class="page-title">Conversor de Unidades</h1>
    <p class="page-subtitle">Converta entre unidades de comprimento, peso, temperatura, dados e tempo.</p>

    <div class="category-row">
      @for (cat of categories; track cat.id) {
        <button mat-stroked-button [class.active]="category() === cat.id" (click)="setCategory(cat.id)">
          <mat-icon>{{ cat.icon }}</mat-icon> {{ cat.label }}
        </button>
      }
    </div>

    <mat-card>
      <mat-card-content>
        <div class="converter-row">
          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>De</mat-label>
            <mat-select [ngModel]="fromUnit()" (ngModelChange)="fromUnit.set($event); compute()">
              @for (u of units(); track u.id) {
                <mat-option [value]="u.id">{{ u.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Valor</mat-label>
            <input matInput type="number" [(ngModel)]="inputValue" (ngModelChange)="compute()">
          </mat-form-field>

          <mat-icon class="swap-icon">arrow_forward</mat-icon>

          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Para</mat-label>
            <mat-select [ngModel]="toUnit()" (ngModelChange)="toUnit.set($event); compute()">
              @for (u of units(); track u.id) {
                <mat-option [value]="u.id">{{ u.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Resultado</mat-label>
            <input matInput [value]="result()" readonly>
          </mat-form-field>
        </div>

        @if (allConversions().length > 0) {
          <div class="all-conversions">
            <span class="section-label">Todas as conversões para {{ inputValue }} {{ fromLabel() }}</span>
            <div class="conversions-grid">
              @for (c of allConversions(); track c.id) {
                <div class="conversion-item">
                  <span class="conv-value">{{ c.value }}</span>
                  <span class="conv-label">{{ c.label }}</span>
                </div>
              }
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--mat-sys-on-surface); }
    .category-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .category-row button.active { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .converter-row { display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
    .swap-icon { margin-top: 16px; color: var(--mat-sys-on-surface-variant); }
    .all-conversions { margin-top: 20px; }
    .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--mat-sys-on-surface-variant); display: block; margin-bottom: 12px; }
    .conversions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 12px; }
    .conversion-item { background: var(--mat-sys-surface-container); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 2px; }
    .conv-value { font-size: 16px; font-weight: 600; color: var(--mat-sys-primary); }
    .conv-label { font-size: 12px; color: var(--mat-sys-on-surface-variant); }
  `]
})
export class UnitConverterComponent {
  categories = CATEGORIES;
  category = signal<Category>('length');
  fromUnit = signal('m');
  toUnit = signal('km');
  inputValue: number | null = 1;
  result = signal('');

  units = computed(() => UNITS[this.category()]);

  fromLabel = computed(() => this.units().find(u => u.id === this.fromUnit())?.label ?? '');

  allConversions = computed(() => {
    const val = this.inputValue;
    if (val === null || isNaN(Number(val))) return [];
    const from = this.units().find(u => u.id === this.fromUnit());
    if (!from) return [];
    const base = from.toBase(Number(val));
    return this.units()
      .filter(u => u.id !== this.fromUnit())
      .map(u => ({ id: u.id, label: u.label, value: this.fmt(u.fromBase(base)) }));
  });

  setCategory(cat: Category): void {
    this.category.set(cat);
    this.fromUnit.set(UNITS[cat][0].id);
    this.toUnit.set(UNITS[cat][1]?.id ?? UNITS[cat][0].id);
    this.compute();
  }

  compute(): void {
    const val = this.inputValue;
    if (val === null || isNaN(Number(val))) { this.result.set(''); return; }
    const from = this.units().find(u => u.id === this.fromUnit());
    const to   = this.units().find(u => u.id === this.toUnit());
    if (!from || !to) { this.result.set(''); return; }
    this.result.set(this.fmt(to.fromBase(from.toBase(Number(val)))));
  }

  private fmt(n: number): string {
    if (Math.abs(n) < 1e-10 && n !== 0) return n.toExponential(6);
    if (Math.abs(n) > 1e10) return n.toExponential(6);
    return parseFloat(n.toPrecision(10)).toString();
  }
}
