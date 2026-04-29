import { Injectable, signal, effect } from '@angular/core';

export type ThemeColor = 'violet' | 'indigo' | 'teal' | 'rose' | 'orange';

export const THEME_COLORS: { id: ThemeColor; label: string; hex: string }[] = [
  { id: 'violet', label: 'Violeta', hex: '#7c3aed' },
  { id: 'indigo', label: 'Azul',    hex: '#0284c7' },
  { id: 'teal',   label: 'Ciano',   hex: '#0891b2' },
  { id: 'rose',   label: 'Rosa',    hex: '#db2777' },
  { id: 'orange', label: 'Laranja', hex: '#ea580c' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_COLOR = 'theme-color';
  private readonly STORAGE_DARK  = 'theme-dark';

  color = signal<ThemeColor>(this.loadColor());
  isDark = signal<boolean>(this.loadDark());

  constructor() {
    effect(() => {
      this.applyTheme(this.color(), this.isDark());
      localStorage.setItem(this.STORAGE_COLOR, this.color());
      localStorage.setItem(this.STORAGE_DARK, String(this.isDark()));
    });
  }

  setColor(color: ThemeColor): void { this.color.set(color); }
  toggleDark(): void { this.isDark.update(v => !v); }

  private applyTheme(color: ThemeColor, dark: boolean): void {
    const html = document.documentElement;
    html.classList.toggle('dark', dark);
    ['violet','indigo','teal','rose','orange'].forEach(c =>
      html.classList.remove(`theme-${c}`)
    );
    if (color !== 'violet') html.classList.add(`theme-${color}`);
  }

  private loadColor(): ThemeColor {
    return (localStorage.getItem(this.STORAGE_COLOR) as ThemeColor) || 'violet';
  }

  private loadDark(): boolean {
    const saved = localStorage.getItem(this.STORAGE_DARK);
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
