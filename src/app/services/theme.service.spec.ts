import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const clean = (): void => {
    localStorage.removeItem('theme');
    document.documentElement.removeAttribute('data-theme');
  };

  beforeEach(clean);
  afterEach(clean);

  it('defaults to day when nothing is saved', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('day');
    expect(service.isDusk()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('day');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('restores a saved dusk theme', () => {
    localStorage.setItem('theme', 'dusk');

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dusk');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dusk');
  });

  it('ignores an invalid saved value', () => {
    localStorage.setItem('theme', 'neon');

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('day');
  });

  it('toggles, applies and persists the theme', () => {
    const service = TestBed.inject(ThemeService);

    service.toggleTheme();
    expect(service.theme()).toBe('dusk');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dusk');
    expect(localStorage.getItem('theme')).toBe('dusk');

    service.toggleTheme();
    expect(service.theme()).toBe('day');
    expect(document.documentElement.getAttribute('data-theme')).toBe('day');
    expect(localStorage.getItem('theme')).toBe('day');
  });
});
