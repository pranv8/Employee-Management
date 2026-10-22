import { Injectable, computed, signal } from '@angular/core';

export type Theme = 'day' | 'dusk';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: Theme = 'day';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeState = signal<Theme>(DEFAULT_THEME);

  /** Current theme (read-only signal). */
  public readonly theme = this.themeState.asReadonly();

  /** True while the Dusk theme is active. */
  public readonly isDusk = computed(() => this.themeState() === 'dusk');

  constructor() {
    // Restore the saved theme (or Day) and apply it to <html>.
    // Nothing is written to storage here; only an explicit user choice is saved.
    const initialTheme = this.readSavedTheme();

    this.themeState.set(initialTheme);
    this.applyTheme(initialTheme);
  }

  public setTheme(theme: Theme): void {
    this.themeState.set(theme);
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  public toggleTheme(): void {
    this.setTheme(this.isDusk() ? 'day' : 'dusk');
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
  }

  private readSavedTheme(): Theme {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);

      return savedTheme === 'dusk' || savedTheme === 'day'
        ? savedTheme
        : DEFAULT_THEME;
    } catch {
      // Storage unavailable (privacy mode, SSR, blocked) - fall back to Day.
      return DEFAULT_THEME;
    }
  }

  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore: the theme still works for this session.
    }
  }
}
