import { Component, computed, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);

  public isProfileMenuOpen = false;
  public isSettingsMenuOpen = false;
  public isProfileModalOpen = false;

  public readonly isDusk = this.themeService.isDusk;

  public readonly themeToggleLabel = computed(() =>
    this.isDusk() ? 'Switch to Day theme' : 'Switch to Dusk theme',
  );

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  public get currentUser(): { username: string; email: string } | null {
    return this.authService.getCurrentUser();
  }

  public get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  public toggleProfileMenu(): void {
    this.isSettingsMenuOpen = false;
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  public toggleSettingsMenu(): void {
    this.isProfileMenuOpen = false;
    this.isSettingsMenuOpen = !this.isSettingsMenuOpen;
  }

  public goTo(page: 'help' | 'about' | 'access-management'): void {
    this.isSettingsMenuOpen = false;
    this.router.navigate(['/employees', page]);
  }

  public openProfile(): void {
    this.isProfileMenuOpen = false;
    this.isProfileModalOpen = true;
  }

  public closeProfile(): void {
    this.isProfileModalOpen = false;
  }

  @HostListener('document:click')
  public closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
    this.isSettingsMenuOpen = false;
  }

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  public logout(): void {
    this.isProfileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
