import { Component, inject } from '@angular/core';

import { AuthService, Permissions, RegisteredUser } from '../../services/auth.service';
import { CustomCheckboxComponent } from '@employee-management/shared-ui';

@Component({
  selector: 'app-access-management',
  standalone: true,
  imports: [CustomCheckboxComponent],
  templateUrl: './access-management.component.html',
  styleUrl: './access-management.component.css',
})
export class AccessManagementComponent {
  private readonly authService = inject(AuthService);

  public users: RegisteredUser[] = this.authService.getManageableUsers();
  public savedMessage = '';

  public toggle(user: RegisteredUser, action: keyof Permissions): void {
    const permissions: Permissions = {
      ...user.permissions,
      [action]: !user.permissions[action],
    };

    this.authService.updatePermissions(user.email, permissions);
    this.users = this.authService.getManageableUsers();

    this.savedMessage = `Updated access for ${user.username}.`;
  }
}
