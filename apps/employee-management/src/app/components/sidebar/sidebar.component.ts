import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public readonly isExpanded = signal(false);

  public toggleExpanded(): void {
    this.isExpanded.update((expanded) => !expanded);
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}